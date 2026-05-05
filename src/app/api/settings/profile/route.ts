import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TargetRole } from "@prisma/client";

const VALID_TARGET_ROLES = Object.values(TargetRole);
const VALID_TIMELINES    = ["3_months", "6_months", "12_months"];
const VALID_COMPANY_TYPES = ["faang", "funded_startup", "any_product"];
const VALID_LEARNING_STYLES = ["projects", "courses", "docs", "mix"];
const VALID_REASONS = ["growth", "passion", "culture", "relocation"];

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      targetRole:        true,
      currentCompany:    true,
      currentRole:       true,
      yearsExperience:   true,
      linkedinUrl:       true,
      githubUrl:         true,
      hoursPerWeek:      true,
      targetTimeline:    true,
      targetCompanyType: true,
      learningStyle:     true,
      targetReason:      true,
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

  const errors: string[] = [];
  const data: Record<string, unknown> = {};

  if (body.targetRole !== undefined) {
    if (!VALID_TARGET_ROLES.includes(body.targetRole)) {
      errors.push(`targetRole must be one of: ${VALID_TARGET_ROLES.join(", ")}`);
    } else {
      data.targetRole = body.targetRole;
    }
  }

  if (body.currentCompany !== undefined) data.currentCompany = body.currentCompany;
  if (body.currentRole    !== undefined) data.currentRole    = body.currentRole;

  if (body.yearsExperience !== undefined) {
    const yoe = Number(body.yearsExperience);
    if (!Number.isFinite(yoe) || yoe < 0 || yoe > 50) {
      errors.push("yearsExperience must be between 0 and 50");
    } else {
      data.yearsExperience = Math.round(yoe);
    }
  }

  if (body.hoursPerWeek !== undefined) {
    const hrs = Number(body.hoursPerWeek);
    if (!Number.isFinite(hrs) || hrs < 1 || hrs > 80) {
      errors.push("hoursPerWeek must be between 1 and 80");
    } else {
      data.hoursPerWeek = Math.round(hrs);
    }
  }

  if (body.targetTimeline !== undefined) {
    if (!VALID_TIMELINES.includes(body.targetTimeline)) {
      errors.push(`targetTimeline must be one of: ${VALID_TIMELINES.join(", ")}`);
    } else {
      data.targetTimeline = body.targetTimeline;
    }
  }

  if (body.targetCompanyType !== undefined) {
    if (!VALID_COMPANY_TYPES.includes(body.targetCompanyType)) {
      errors.push(`targetCompanyType must be one of: ${VALID_COMPANY_TYPES.join(", ")}`);
    } else {
      data.targetCompanyType = body.targetCompanyType;
    }
  }

  if (body.learningStyle !== undefined) {
    if (!VALID_LEARNING_STYLES.includes(body.learningStyle)) {
      errors.push(`learningStyle must be one of: ${VALID_LEARNING_STYLES.join(", ")}`);
    } else {
      data.learningStyle = body.learningStyle;
    }
  }

  if (body.targetReason !== undefined) {
    if (!VALID_REASONS.includes(body.targetReason)) {
      errors.push(`targetReason must be one of: ${VALID_REASONS.join(", ")}`);
    } else {
      data.targetReason = body.targetReason;
    }
  }

  if (body.linkedinUrl !== undefined) data.linkedinUrl = clean(body.linkedinUrl);

  if (newGithubUrl !== undefined) {
    data.githubUrl = newGithubUrl;
    if (githubUrlChanged) data.githubSignal = null;
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 400 });
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ ok: true });
  }

  await db.user.update({ where: { id: userId }, data });
  return NextResponse.json({ ok: true });
}
