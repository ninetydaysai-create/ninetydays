import { NextResponse } from "next/server";
import { getPricingForCountry, toClientPricing } from "@/lib/geo-pricing";

/**
 * Lightweight geo endpoint — returns the user's detected country and
 * the matching pricing config (safe for client rendering).
 *
 * Country detection order:
 * 1. x-vercel-ip-country header (set by Vercel Edge Network — authoritative in prod)
 * 2. Falls back to "US" for local dev / unknown
 */
export async function GET(req: Request) {
  const country = req.headers.get("x-vercel-ip-country") ?? "US";
  const pricing = getPricingForCountry(country);

  return NextResponse.json(
    { country, pricing: toClientPricing(pricing) },
    {
      headers: {
        // Cache at the CDN edge for 1 hour — country doesn't change per session
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
