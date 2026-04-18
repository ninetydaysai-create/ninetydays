import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getEventCounts } from "../event/route";

const ADMIN_IDS = (process.env.ADMIN_USER_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (ADMIN_IDS.length > 0 && !ADMIN_IDS.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const counts = await getEventCounts();

  // Aggregate into two levels:
  // 1. test → variant → event → total count
  // 2. test → variant → geo → event → geo-segmented count
  const byTotal: Record<string, Record<string, Record<string, number>>> = {};
  const byGeo: Record<string, Record<string, Record<string, Record<string, number>>>> = {};

  for (const [key, count] of counts) {
    const parts = key.replace(/^ab:/, "").split(":");
    // Format A (no geo): test:variant:event  → 3 parts
    // Format B (with geo): test:variant:event:geo → 4 parts
    if (parts.length < 3) continue;
    const [test, variant] = parts;
    const isGeo = parts.length === 4 && ["IN", "US", "other"].includes(parts[3]);

    if (isGeo) {
      const [,, event, geo] = parts;
      if (!byGeo[test]) byGeo[test] = {};
      if (!byGeo[test][variant]) byGeo[test][variant] = {};
      if (!byGeo[test][variant][geo]) byGeo[test][variant][geo] = {};
      byGeo[test][variant][geo][event] = count;
    } else {
      const event = parts.slice(2).join(":");
      if (!byTotal[test]) byTotal[test] = {};
      if (!byTotal[test][variant]) byTotal[test][variant] = {};
      byTotal[test][variant][event] = count;
    }
  }

  const summary = Object.entries(byTotal).map(([test, variants]) => ({
    test,
    variants: Object.entries(variants).map(([variant, events]) => {
      const seen   = events["seen"]   ?? 0;
      const clicks = (events["cta_click"] ?? 0) + (events["oauth_click"] ?? 0) + (events["exit_intent_click"] ?? 0);
      return {
        variant,
        events,
        conversionRate: seen > 0 ? `${((clicks / seen) * 100).toFixed(1)}%` : "n/a",
        sampleSize: seen,
        // Geo breakdown for this variant (if available)
        geo: byGeo[test]?.[variant] ?? {},
      };
    }),
  }));

  return NextResponse.json({ summary });
}
