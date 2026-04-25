import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const {
    currentCompany,
    currentRole,
    yearsExperience,
    hoursPerWeek,
    targetTimeline,
    targetCompanyType,
    learningStyle,
    linkedinUrl,
    githubUrl,
  } = await req.json();

  const clean = (url: string | undefined) =>
    url ? url.trim().replace(/\/$/, "") || null : null;

  const data = {
    currentCompany,
    currentRole,
    yearsExperience: Number(yearsExperience),
    hoursPerWeek: hoursPerWeek ? Number(hoursPerWeek) : 10,
    targetTimeline: targetTimeline ?? null,
    targetCompanyType: targetCompanyType ?? null,
    learningStyle: learningStyle ?? null,
    linkedinUrl: clean(linkedinUrl),
    githubUrl: clean(githubUrl),
  };

  await db.user.upsert({
    where: { id: userId },
    create: { id: userId, email: "", ...data },
    update: data,
  });

  return NextResponse.json({ ok: true });
}
