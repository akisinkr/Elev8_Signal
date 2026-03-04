"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useClerk } from "@clerk/nextjs";
import { BarChart3, Lightbulb, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin/signal", label: "Signal", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const [pendingCount, setPendingCount] = React.useState(0);

  React.useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/admin/signal/suggestions/count");
        if (res.ok) {
          const data = await res.json();
          setPendingCount(data.count);
        }
      } catch {
        // silently fail
      }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex h-14 items-center gap-2 px-4 border-b border-zinc-800">
        <span className="text-sm font-semibold text-white">Elev8 Signal</span>
        <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400">
          Admin
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
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
            </Link>
          );
        })}

        <Link
          href="/admin/signal#suggestions"
          className={cn(
            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
          )}
        >
          <div className="relative">
            <Lightbulb className="size-4" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-red-500" />
            )}
          </div>
          Suggestions
        </Link>
      </nav>

      <div className="border-t border-zinc-800 p-3 space-y-2">
        <UserButton afterSignOutUrl="/admin/login" />
        <button
          onClick={() => signOut({ redirectUrl: "/admin/login" })}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
