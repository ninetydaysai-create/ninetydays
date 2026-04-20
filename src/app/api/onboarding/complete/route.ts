import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/sync-user";
import { TargetRole } from "@prisma/client";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(userId);

  const { targetRole } = await req.json();

  await db.user.update({
    where: { id: userId },
    data: {
      targetRole: targetRole as TargetRole,
      onboardingDone: true,
    },
  });

  // Create email preference defaults
  await db.emailPreference.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  return NextResponse.json({ ok: true });
}
