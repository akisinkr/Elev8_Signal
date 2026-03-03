import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <span className="text-lg font-semibold">Admin Dashboard</span>
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Overview
              </Link>
              <Link
                href="/admin/signal"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <BarChart3 className="size-4" />
                Signal
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
