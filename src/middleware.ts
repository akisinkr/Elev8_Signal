import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/admin(.*)",
  "/api/admin/auth/login",
  "/api/admin/auth/logout",
  "/api/admin(.*)",
  "/api/webhooks(.*)",
  "/signal(.*)",
  "/api/signal(.*)",
  "/preview",
  "/request-access",
  "/api/access-request",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  // All non-public routes require authentication
  // Admin auth is now handled by our own session cookie, not Clerk
  await auth.protect();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
