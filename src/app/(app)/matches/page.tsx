import { requireMember } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";

export default async function MatchesPage() {
  await requireMember();

  return (
    <div>
      <PageHeader
        title="Your Matches"
        description="View and manage your superpower exchange matches."
      />
      {/* Matches list will be implemented here */}
    </div>
  );
}
