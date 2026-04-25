import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      currentCompany:   true,
      currentRole:      true,
      yearsExperience:  true,
      linkedinUrl:      true,
      githubUrl:        true,
      hoursPerWeek:     true,
      targetTimeline:   true,
      targetCompanyType: true,
      learningStyle:    true,
      targetReason:     true,
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const clean = (url: string | undefined | null) =>
    url ? url.trim().replace(/\/$/, "") || null : null;

  // Detect if githubUrl is changing — if so, invalidate the cached signal
  const existing = await db.user.findUnique({
    where: { id: userId },
    select: { githubUrl: true },
  });

  const newGithubUrl = body.githubUrl !== undefined ? clean(body.githubUrl) : undefined;
  const githubUrlChanged = newGithubUrl !== undefined && newGithubUrl !== existing?.githubUrl;

  const data: Record<string, unknown> = {};

  if (body.currentCompany   !== undefined) data.currentCompany   = body.currentCompany;
  if (body.currentRole      !== undefined) data.currentRole      = body.currentRole;
  if (body.yearsExperience  !== undefined) data.yearsExperience  = Number(body.yearsExperience);
  if (body.linkedinUrl      !== undefined) data.linkedinUrl      = clean(body.linkedinUrl);
  if (body.hoursPerWeek     !== undefined) data.hoursPerWeek     = Number(body.hoursPerWeek);
  if (body.targetTimeline   !== undefined) data.targetTimeline   = body.targetTimeline;
  if (body.targetCompanyType !== undefined) data.targetCompanyType = body.targetCompanyType;
  if (body.learningStyle    !== undefined) data.learningStyle    = body.learningStyle;
  if (body.targetReason     !== undefined) data.targetReason     = body.targetReason;

  if (newGithubUrl !== undefined) {
    data.githubUrl = newGithubUrl;
    if (githubUrlChanged) data.githubSignal = null; // force re-fetch on next roadmap generation
  }

  await db.user.update({ where: { id: userId }, data });

  return NextResponse.json({ ok: true });
}
