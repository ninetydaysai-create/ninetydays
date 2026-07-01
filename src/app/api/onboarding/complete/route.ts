import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/sync-user";
import { TargetRole } from "@prisma/client";
import { captureServerEvent, EVENTS } from "@/lib/analytics";

const VALID_TARGET_ROLES = Object.values(TargetRole) as string[];

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(userId);

  const { targetRole, targetReason } = await req.json();

  if (!targetRole || !VALID_TARGET_ROLES.includes(targetRole)) {
    return NextResponse.json(
      { error: `Invalid target role. Must be one of: ${VALID_TARGET_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  await db.user.update({
    where: { id: userId },
    data: {
      targetRole: targetRole as TargetRole,
      targetReason: targetReason ?? null,
      onboardingDone: true,
    },
  });

  // Create email preference defaults
  await db.emailPreference.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  captureServerEvent(userId, EVENTS.ONBOARDING_COMPLETED, { targetRole, targetReason });
  return NextResponse.json({ ok: true });
}
