"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

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
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);
  const { signOut } = useClerk();

  const initials = `${member.firstName?.[0] || ""}${member.lastName?.[0] || ""}`.toUpperCase();

  // Close avatar menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(e.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    if (avatarMenuOpen) document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [avatarMenuOpen]);

  return (
    <nav className="border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.25em] text-[#C8A84E]/70 uppercase">
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
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
                      ? "text-white/90"
                      : "text-white/35 hover:text-white/60"
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
                className="text-[11px] text-[#C8A84E]/40 hover:text-[#C8A84E]/70 transition-colors hidden sm:block"
              >
                Admin
              </Link>
            )}
            <div className="relative" ref={avatarMenuRef}>
              <button
                onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                className="flex items-center gap-2 cursor-pointer"
              >
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
              </button>
              {avatarMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-white/[0.08] bg-[#0A0F1C] shadow-2xl py-1.5 z-50">
                  <div className="px-3.5 py-2.5 border-b border-white/[0.06]">
                    <p className="text-xs font-medium text-white/60 truncate">{member.firstName} {member.lastName}</p>
                  </div>
                  <button
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
                  >
                    <LogOut className="size-3.5" />
                    Sign out
                  </button>
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
                className={`block px-3 py-2.5 rounded-lg text-sm ${
                  isActive
                    ? "text-white font-medium"
                    : "text-white/40 hover:text-white/60 font-normal"
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
              className="block px-3 py-2 rounded-lg text-sm text-[#C8A84E]/40 hover:text-[#C8A84E]/70"
            >
              Admin Panel
            </Link>
          )}
          <div className="border-t border-white/[0.06] mt-2 pt-2">
            <button
              onClick={() => signOut({ redirectUrl: "/" })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 w-full"
            >
              <LogOut className="size-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
