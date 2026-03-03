import { requireMember } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";

export default async function ProfilePage() {
  const member = await requireMember();

  return (
    <div>
      <PageHeader
        title="Your Profile"
        description="Manage your superpowers and professional info."
      />
      {/* Profile form will be implemented here */}
    </div>
  );
}
