import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px w-8 bg-primary/40" />
          <div className="size-1.5 rounded-full bg-primary" />
          <div className="h-px w-8 bg-primary/40" />
        </div>
        <h1 className="text-xl font-bold tracking-[0.2em] text-foreground">
          ELEV8
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Sign in to continue</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-lg border border-border",
          },
        }}
      />
    </div>
  );
}
