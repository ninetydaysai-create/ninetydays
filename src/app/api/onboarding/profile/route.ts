import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentCompany, currentRole, yearsExperience } = await req.json();

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId, email: "", currentCompany, currentRole, yearsExperience: Number(yearsExperience) },
    update: { currentCompany, currentRole, yearsExperience: Number(yearsExperience) },
  });

  return NextResponse.json({ ok: true });
}
