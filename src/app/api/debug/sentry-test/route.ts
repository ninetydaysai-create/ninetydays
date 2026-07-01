import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

// GET /api/debug/sentry-test
// Hit this endpoint once to verify Sentry is capturing errors.
// DELETE this route after confirming Sentry works in production.
// Protected by CRON_SECRET so it's not publicly exploitable.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (token !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const testError = new Error("Sentry test — NinetyDays production verification");
  Sentry.captureException(testError);

  return NextResponse.json({
    ok: true,
    message: "Test error sent to Sentry. Check your Sentry dashboard for 'Sentry test — NinetyDays production verification'.",
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? "configured ✓" : "NOT SET ✗",
  });
}
