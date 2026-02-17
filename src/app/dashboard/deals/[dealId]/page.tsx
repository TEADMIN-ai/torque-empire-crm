import DealDetailsClient from "./DealDetailsClient";

export default async function DealDetailsPage({
  params,
}: {
  params: Promise<{ dealId: string }>;
}) {
  const { dealId } = await params;
  return <DealDetailsClient dealId={dealId} />;
}
