import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Plan } from "@prisma/client";

/**
 * POST /api/beta/apply
 * Body: { code: string }
 *
 * Validates a beta invite code and upgrades the user to Pro.
 * Codes are configured via BETA_CODES env var (comma-separated).
 * Each code can only be used once — tracked via ActivityLog.
 */
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const { code } = await req.json() as { code?: string };
  if (!code?.trim()) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  const normalised = code.trim().toUpperCase();

  // ── 1. Validate against allowed codes ──────────────────────────────────────
  const allowedCodes = (process.env.BETA_CODES ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  if (allowedCodes.length === 0) {
    return NextResponse.json({ error: "Beta access is not currently open" }, { status: 403 });
  }

  if (!allowedCodes.includes(normalised)) {
    return NextResponse.json({ error: "Invalid beta code" }, { status: 400 });
  }

  // ── 2. Check the code hasn't already been used by someone else ─────────────
  const alreadyUsed = await db.activityLog.findFirst({
    where: {
      type: "beta_code_used",
      metadata: { path: ["code"], equals: normalised },
    },
  });

  if (alreadyUsed) {
    // Allow the same user to re-apply their own code (idempotent)
    if (alreadyUsed.userId !== userId) {
      return NextResponse.json({ error: "This beta code has already been used" }, { status: 409 });
    }
  }

  // ── 3. Check if user is already Pro (idempotent) ───────────────────────────
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (user?.plan === Plan.PRO) {
    return NextResponse.json({ ok: true, message: "You already have Pro access" });
  }

  // ── 4. Upgrade to Pro + log usage ─────────────────────────────────────────
  await db.$transaction([
    db.user.update({
      where: { id: userId },
      data: {
        plan: Plan.PRO,
        // Set a generous beta period: 60 days from now
        stripeCurrentPeriodEnd: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    }),
    db.activityLog.create({
      data: {
        userId,
        type: "beta_code_used",
        metadata: { code: normalised },
      },
    }),
    db.notification.create({
      data: {
        userId,
        type: "beta_activated",
        title: "Welcome to the NinetyDays beta!",
        body: "You have full Pro access for 60 days. Please share your honest feedback — it directly shapes the product.",
      },
    }),
  ]);

  return NextResponse.json({ ok: true, message: "Beta access activated — you now have full Pro access for 60 days." });
}
