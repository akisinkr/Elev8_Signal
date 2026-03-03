import { requireMember } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";

export default async function FeedbackPage() {
  await requireMember();

  return (
    <div>
      <PageHeader
        title="Feedback"
        description="Share feedback on your exchanges to help us improve matches."
      />
      {/* Feedback list will be implemented here */}
    </div>
  );
}
