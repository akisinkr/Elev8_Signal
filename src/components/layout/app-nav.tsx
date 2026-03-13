"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

interface AppNavProps {
  member: {
    firstName: string;
    lastName: string;
    imageUrl: string | null;
    role: string;
  };
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/signal", label: "Signal" },
  { href: "/matches", label: "Matches" },
  { href: "/profile", label: "Profile" },
];

export function AppNav({ member }: AppNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase();

  return (
    <nav className="border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-[0.25em] text-amber-400/70 uppercase">
              Elev8
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right side: avatar + admin link */}
          <div className="flex items-center gap-3">
            {member.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-[11px] text-amber-400/50 hover:text-amber-400/80 transition-colors hidden sm:block"
              >
                Admin
              </Link>
            )}
            <div className="flex items-center gap-2">
              {member.imageUrl ? (
                <img
                  src={member.imageUrl}
                  alt={member.firstName}
                  className="size-7 rounded-full object-cover border border-white/[0.08]"
                />
              ) : (
                <div className="size-7 rounded-full bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-[10px] font-medium text-white/50">
                  {initials}
                </div>
              )}
            </div>
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden text-white/40 hover:text-white/70 p-1"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-white/[0.06] bg-[#0a0a0f] px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm ${
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {member.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-amber-400/50 hover:text-amber-400/80"
            >
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
