import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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

  return NextResponse.json({ profile });
}
