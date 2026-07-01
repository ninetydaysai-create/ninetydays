import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { captureServerEvent, EVENTS } from "@/lib/analytics";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.careerProfile.findUnique({ where: { userId } });
  return NextResponse.json({ profile });
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const allowed = [
    "careerGoal", "targetCompanies", "targetSalary", "targetLocation",
    "strengths", "weaknesses", "achievements", "notes",
    // Goal Engine
    "targetRoleTitle", "priority", "currentStage", "needsVisa",
  ];

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  const profile = await db.careerProfile.upsert({
    where:  { userId },
    update: data,
    create: { userId, ...data },
  });

  captureServerEvent(userId, EVENTS.GOAL_SAVED, {
    hasTargetCompany: Array.isArray(body.targetCompanies) && body.targetCompanies.length > 0,
    hasPriority:      Array.isArray(body.priority) && body.priority.length > 0,
    currentStage:     body.currentStage ?? null,
  });
  return NextResponse.json({ profile });
}
