"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface UploadClientProps {
  dealId: string;
}

const sanitizeFilename = (name: string): string => name.replace(/[^a-zA-Z0-9._-]/g, "_");

export default function UploadClient({ dealId }: UploadClientProps) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("You must be signed in to upload documents.");
      return;
    }

    if (!file) {
      setError("Please choose a PDF file.");
      return;
    }

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Only PDF files are supported.");
      return;
    }

    setSaving(true);

    try {
      const storagePath = `uploads/${dealId}/${Date.now()}_${sanitizeFilename(file.name)}`;
      const fileRef = ref(storage, storagePath);
      await uploadBytes(fileRef, file, { contentType: "application/pdf" });
      const downloadURL = await getDownloadURL(fileRef);

      await addDoc(collection(db, "deals", dealId, "documents"), {
        name: file.name,
        storagePath,
        downloadURL,
        uploadedAt: serverTimestamp(),
        uploadedBy: user.uid,
      });

      router.push(`/dashboard/deals/${dealId}`);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : "Failed to upload file.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ padding: "1rem" }}>Checking authentication…</p>;
  }

  if (!user) {
    return <p style={{ padding: "1rem" }}>Please login to upload a document.</p>;
  }

  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ marginBottom: "0.5rem" }}>Upload Deal Document</h1>
      <p style={{ color: "#6b7280", marginBottom: "1rem" }}>Deal ID: {dealId}</p>

      <form onSubmit={handleSubmit} style={{ border: "1px solid #e5e7eb", padding: "1rem", borderRadius: 8 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: "0.5rem" }} htmlFor="pdf-file">
          PDF File
        </label>
        <input
          id="pdf-file"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          style={{ marginBottom: "1rem" }}
        />

        {error ? <p style={{ color: "#b42318", marginBottom: "1rem" }}>{error}</p> : null}

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: "#1f6feb",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "0.6rem 1rem",
              cursor: "pointer",
            }}
          >
            {saving ? "Uploading..." : "Upload PDF"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => router.push(`/dashboard/deals/${dealId}`)}
            style={{
              background: "#fff",
              color: "#111827",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "0.6rem 1rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
