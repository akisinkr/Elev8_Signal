"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, LogOut, ShieldPlus, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/signal", label: "Signal", icon: BarChart3 },
  { href: "/admin/access-requests", label: "Access Requests", icon: UserPlus },
  { href: "/admin/signup", label: "Add Admin", icon: ShieldPlus },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    fetch("/api/admin/access-requests")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: { status: string }[]) => {
        setPendingCount(
          Array.isArray(data) ? data.filter((r) => r.status === "PENDING").length : 0
        );
      })
      .catch(() => {});
  }, [pathname]);

  async function handleSignOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-zinc-800">
        <span className="text-sm font-semibold text-white">Elev8 Profile</span>
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const showDot = item.href === "/admin/access-requests" && pendingCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
              {showDot && (
                <span className="ml-auto size-2 rounded-full bg-red-500" />
              )}
            </Link>
          );
        })}

      </nav>

      <div className="border-t border-zinc-800 p-3 space-y-2">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
