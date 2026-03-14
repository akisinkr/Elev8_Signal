import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/auth(.*)",
  // Admin pages & auth routes only (admin API routes use own session check)
  "/admin/login",
  "/api/admin/auth/login",
  "/api/admin/auth/logout",
  "/api/webhooks(.*)",
  "/signal(.*)",
  "/onboarding(.*)",
  "/dashboard(.*)",
  "/api/signal(.*)",
  "/preview",
  "/request-access",
  "/api/access-request",
  "/welcome",
  "/api/welcome(.*)",
  "/invite",
  "/recruiting-innovation",
  "/vault(.*)",
  "/api/vault(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  // All non-public routes require authentication
  // Admin auth is now handled by our own session cookie, not Clerk
  const { userId } = await auth();
  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    // Only allow same-origin redirects to prevent open redirect attacks
    const redirectTarget = new URL(req.url);
    if (redirectTarget.origin === new URL(req.url).origin) {
      signInUrl.searchParams.set("redirect_url", redirectTarget.pathname + redirectTarget.search);
    }
    return NextResponse.redirect(signInUrl);
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
