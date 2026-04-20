import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { currentCompany, currentRole, yearsExperience, linkedinUrl, githubUrl } = await req.json();

  const clean = (url: string | undefined) =>
    url ? url.trim().replace(/\/$/, "") || null : null;

  await db.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      email: "",
      currentCompany,
      currentRole,
      yearsExperience: Number(yearsExperience),
      linkedinUrl: clean(linkedinUrl),
      githubUrl: clean(githubUrl),
    },
    update: {
      currentCompany,
      currentRole,
      yearsExperience: Number(yearsExperience),
      linkedinUrl: clean(linkedinUrl),
      githubUrl: clean(githubUrl),
    },
  });

  return NextResponse.json({ ok: true });
}
