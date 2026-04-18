import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/about(.*)",
  "/p/(.*)",            // public portfolio pages
  "/api/webhooks/(.*)", // Clerk + Stripe webhooks
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export const proxy = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Allow public routes without auth
  if (isPublicRoute(req)) return NextResponse.next();

  // Require auth for everything else
  if (!userId) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // Admin routes: only allowed for ADMIN_USER_IDS
  if (isAdminRoute(req)) {
    const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map((id) => id.trim());
    if (!adminIds.includes(userId)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
