import { redirect } from "next/navigation";
import { requireMember } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const member = await requireMember();

  if (member.onboardingState === "COMPLETED") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold">Welcome to Superpower Exchange</h1>
        <p className="text-muted-foreground mt-2">
          Let&apos;s set up your profile. This will take about 5 minutes.
        </p>
        {/* Onboarding steps will be implemented here */}
      </div>
    </div>
  );
}
