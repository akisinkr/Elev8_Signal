"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, LogOut, ShieldPlus, UserPlus, Handshake, Users, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/signal", label: "Signal", icon: BarChart3 },
  { href: "/admin/intros", label: "Intros", icon: Handshake },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/access-requests", label: "Access Requests", icon: UserPlus },
  { href: "/admin/signup", label: "Add Admin", icon: ShieldPlus },
  { href: "/admin/audit-log", label: "Audit Log", icon: ScrollText },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = React.useState(0);
  const [pendingIntros, setPendingIntros] = React.useState(0);

  React.useEffect(() => {
    fetch("/api/admin/access-requests")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { status: string }[]) => {
        setPendingCount(
          Array.isArray(data) ? data.filter((r) => r.status === "PENDING").length : 0
        );
      })
      .catch(() => {});

    fetch("/api/admin/matches")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { status: string; curatorNote?: string }[]) => {
        if (!Array.isArray(data)) return;
        const introRequests = data.filter((m) => {
          try {
            const note = m.curatorNote ? JSON.parse(m.curatorNote) : {};
            return note.source === "signal-intro" && m.status === "PROPOSED";
          } catch { return false; }
        });
        setPendingIntros(introRequests.length);
      })
      .catch(() => {});
  }, [pathname]);

  async function handleSignOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-border/60 bg-background">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-border/60">
        <span className="text-sm font-semibold text-foreground">Elev8 Signal</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const showDot =
            (item.href === "/admin/access-requests" && pendingCount > 0) ||
            (item.href === "/admin/intros" && pendingIntros > 0);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
              {showDot && (
                <span className="ml-auto size-2 rounded-full bg-destructive" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <LogOut className="size-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
