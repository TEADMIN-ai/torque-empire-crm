"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

interface DealDetailsClientProps {
  dealId: string;
}

interface DealDocument {
  id: string;
  name: string;
  storagePath: string;
  downloadURL: string;
  uploadedAt: Timestamp | null;
}

interface FirestoreDocumentData {
  name?: unknown;
  storagePath?: unknown;
  downloadURL?: unknown;
  uploadedAt?: Timestamp;
}

const mapDoc = (snapshot: QueryDocumentSnapshot): DealDocument | null => {
  const data = snapshot.data() as FirestoreDocumentData;

  if (
    typeof data.name !== "string" ||
    typeof data.storagePath !== "string" ||
    typeof data.downloadURL !== "string"
  ) {
    return null;
  }

  return {
    id: snapshot.id,
    name: data.name,
    storagePath: data.storagePath,
    downloadURL: data.downloadURL,
    uploadedAt: data.uploadedAt ?? null,
  };
};

export default function DealDetailsClient({ dealId }: DealDetailsClientProps) {
  const { user, loading } = useAuth();
  const [documents, setDocuments] = useState<DealDocument[]>([]);
  const [error, setError] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    const documentsRef = collection(db, "deals", dealId, "documents");
    const documentsQuery = query(documentsRef, orderBy("uploadedAt", "desc"));

    const unsubscribe = onSnapshot(
      documentsQuery,
      (snapshot) => {
        const nextDocuments = snapshot.docs
          .map((item) => mapDoc(item))
          .filter((item): item is DealDocument => item !== null);
        setDocuments(nextDocuments);
      },
      (snapshotError) => {
        setError(snapshotError.message || "Failed to load deal documents.");
      },
    );

    return () => unsubscribe();
  }, [dealId, loading, user]);

  const formattedDocuments = useMemo(
    () =>
      documents.map((item) => ({
        ...item,
        uploadedDate: item.uploadedAt?.toDate().toLocaleString() ?? "Pending upload timestamp",
      })),
    [documents],
  );

  const handleDelete = async (item: DealDocument) => {
    setDeletingId(item.id);
    setError("");

    try {
      await deleteObject(ref(storage, item.storagePath));
      await deleteDoc(doc(db, "deals", dealId, "documents", item.id));
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : "Failed to delete document.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <p style={{ padding: "1rem" }}>Checking authentication…</p>;
  }

  if (!user) {
    return <p style={{ padding: "1rem" }}>You must be logged in to view deal documents.</p>;
  }

  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h1 style={{ marginBottom: "0.25rem" }}>Deal Details</h1>
          <p style={{ margin: 0, color: "#666" }}>Deal ID: {dealId}</p>
        </div>
        <Link
          href={`/dashboard/deals/${dealId}/upload`}
          style={{
            background: "#1f6feb",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
            padding: "0.6rem 1rem",
            fontWeight: 600,
          }}
        >
          Upload Document
        </Link>
      </div>

      {error ? (
        <p style={{ color: "#b42318", background: "#fee4e2", padding: "0.75rem", borderRadius: 6 }}>{error}</p>
      ) : null}

      <section style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb", textAlign: "left" }}>
              <th style={{ padding: "0.8rem" }}>Name</th>
              <th style={{ padding: "0.8rem" }}>Uploaded</th>
              <th style={{ padding: "0.8rem" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {formattedDocuments.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: "1rem", color: "#6b7280" }}>
                  No documents uploaded for this deal yet.
                </td>
              </tr>
            ) : (
              formattedDocuments.map((item) => (
                <tr key={item.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.8rem" }}>{item.name}</td>
                  <td style={{ padding: "0.8rem", color: "#6b7280" }}>{item.uploadedDate}</td>
                  <td style={{ padding: "0.8rem", display: "flex", gap: "0.5rem" }}>
                    <a
                      href={item.downloadURL}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        border: "1px solid #cbd5e1",
                        padding: "0.35rem 0.6rem",
                        borderRadius: 6,
                        textDecoration: "none",
                        color: "#111827",
                      }}
                    >
                      View
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      style={{
                        border: "1px solid #fecaca",
                        background: "#fee2e2",
                        color: "#b91c1c",
                        padding: "0.35rem 0.6rem",
                        borderRadius: 6,
                        cursor: "pointer",
                      }}
                    >
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
