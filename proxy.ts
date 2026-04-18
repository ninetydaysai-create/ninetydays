import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/score(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/beta(.*)",                  // beta invite page — public so unauthenticated testers can land here
  "/p/(.*)",                    // public portfolio pages
  "/prep(.*)",                  // public interview prep pages
  "/api/score",
  "/api/stats/public",
  "/api/og/share-card",
  "/api/analytics/event",       // anonymous A/B tracking
  "/api/webhooks/(.*)",         // Clerk + LS webhooks (have their own signature auth)
]);

export const proxy = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
