import { redirect } from "next/navigation";

export default function SignUpPage() {
  // Members are pre-registered — no self-signup allowed.
  // Redirect to sign-in where they can create a password via email verification.
  redirect("/sign-in");
}
