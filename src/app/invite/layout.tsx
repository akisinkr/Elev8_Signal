import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elev8 Founding Member Invitation",
  description:
    "You're invited to join Elev8 — Where Leaders Connect. A private network for senior tech leaders across Seoul, Singapore, San Francisco & Seattle.",
  openGraph: {
    title: "Elev8 Founding Member Invitation",
    description:
      "You're invited to join Elev8 — Where Leaders Connect. Limited to 100 founding members.",
    images: ["/invite/invitation-hero.png"],
    type: "website",
  },
};

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
