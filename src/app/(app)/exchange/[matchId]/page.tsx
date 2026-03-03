import { requireMember } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";

export default async function ExchangePage({
  params,
}: {
  params: Promise<{ matchId: string }>;
}) {
  await requireMember();
  const { matchId } = await params;

  return (
    <div>
      <PageHeader title="Exchange" description={`Match: ${matchId}`} />
      {/* Exchange thread will be implemented here */}
    </div>
  );
}
