import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Elev8 Vault",
  description: "Private document hub for Elev8 leadership",
};

export default function VaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
