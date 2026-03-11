import { redirect } from "next/navigation";

// Redirect to the Recruitment Life Cycle dashboard (deployed on Vercel)
const RECRUITMENT_DASHBOARD_URL =
  process.env.RECRUITMENT_DASHBOARD_URL || "https://elev8-recruitment.vercel.app";

export default function RecruitingInnovationPage() {
  redirect(RECRUITMENT_DASHBOARD_URL);
}
