import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth";
import { AppNav } from "@/components/layout/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await requireMember();

  // Onboarding guard — redirect incomplete members
  if (member.onboardingState !== "COMPLETED" && !member.cardCompletedAt) {
    redirect("/onboarding");
  }

  const navMember = {
    firstName: member.firstName,
    lastName: member.lastName,
    imageUrl: member.customPhotoUrl || member.imageUrl,
    role: member.role,
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <AppNav member={navMember} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
