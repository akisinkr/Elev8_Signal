import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0A0A0A" }}>
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 35%, rgba(200,168,78,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 sm:px-10 py-6">
        <Link href="/">
          <span
            className="text-[13px] font-semibold tracking-[0.3em] uppercase cursor-pointer"
            style={{ color: "#C8A84E", textShadow: "0 0 20px rgba(200,168,78,0.15)" }}
          >
            ELEV8
          </span>
        </Link>
      </header>

      {/* Sign-in form */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-12">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: "#E8E4DD" }}>
            This week&apos;s Signal is live
          </h1>
          <p className="text-[13px]" style={{ color: "#7A7670" }}>
            Sign in to vote and see how your peers answered
          </p>
        </div>

        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#C8A84E",
              colorBackground: "#141414",
              colorText: "#E8E4DD",
              colorTextSecondary: "#7A7670",
              colorInputBackground: "#1A1A1A",
              colorInputText: "#E8E4DD",
              borderRadius: "0.75rem",
            },
            elements: {
              rootBox: "w-full max-w-sm",
              card: "border border-[#1F1F1F] shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-[#141414]",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "border-[#1F1F1F] bg-[#1A1A1A] text-[#E8E4DD] hover:bg-[#222]",
              formFieldInput:
                "border-[#1F1F1F] bg-[#1A1A1A] text-[#E8E4DD] placeholder:text-[#7A7670]/50 focus:border-[#C8A84E]/40 focus:ring-[#C8A84E]/10",
              formButtonPrimary:
                "bg-[#C8A84E] text-[#0A0A0A] hover:bg-[#D4B85E] shadow-[0_0_20px_rgba(200,168,78,0.15)]",
              footerActionLink: "text-[#C8A84E] hover:text-[#D4B85E]",
              identityPreviewEditButton: "text-[#C8A84E]",
              formFieldLabel: "text-[#7A7670]",
              dividerLine: "bg-[#1F1F1F]",
              dividerText: "text-[#7A7670]",
              footer: "hidden",
              footerAction: "hidden",
              footerActionText: "hidden",
              footerActionLink__signUp: "hidden",
              signUp: "hidden",
              otherMethodsBlockButton: "hidden",
            },
          }}
        />

        <p className="mt-6 text-[11px]" style={{ color: "#4A4640" }}>
          Invite-only
        </p>
      </main>
    </div>
  );
}
