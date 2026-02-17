import UploadClient from "./UploadClient";

export default async function DealUploadPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = await params;

  return <UploadClient dealId={dealId} />;
}
