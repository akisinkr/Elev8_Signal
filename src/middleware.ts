import { clerkMiddleware } from "@clerk/nextjs/server";

// All routes are public at the middleware level.
// Auth is enforced at the route/layout level:
//   - Member routes: requireMember() in (app)/layout.tsx + (onboarding)/page.tsx
//   - Admin routes:  requireAdmin() in (admin)/layout.tsx (custom JWT, not Clerk)
//   - API routes:    requireMember() or requireAdmin() per endpoint
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
