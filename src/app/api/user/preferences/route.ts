import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ALLOWED = ["targetTimeline", "hoursPerWeek", "targetCompanyType", "learningStyle", "targetReason"];

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) data[key] = body[key];
  }

  const user = await db.user.update({ where: { id: userId }, data });
  return NextResponse.json({ user });
}
