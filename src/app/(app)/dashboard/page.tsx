import { requireMember } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";

export default async function DashboardPage() {
  const member = await requireMember();

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${member.firstName}`}
        description="Here's what's happening with your exchanges."
      />
      {/* Dashboard content will be implemented here */}
    </div>
  );
}
