import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { JobStatus } from "@prisma/client";
import { fastModel } from "@/lib/ai";
import { generateText } from "ai";

// Rejection stage → most likely blocking skill dimension
const STAGE_TO_DIMENSION: Record<string, string> = {
  saved:            "resume_quality",
  applied:          "resume_quality",
  recruiter_screen: "communication",
  technical:        "system_design",
  final_round:      "leadership",
};

const STAGE_LABEL: Record<string, string> = {
  saved:            "before applying",
  applied:          "at resume screen",
  recruiter_screen: "at recruiter screen",
  technical:        "at technical round",
  final_round:      "at final round",
};

const DIMENSION_LABEL: Record<string, string> = {
  resume_quality:       "Resume Quality",
  communication:        "Communication",
  system_design:        "System Design",
  leadership:           "Leadership",
};

// Fire-and-forget: generate AI insight + notify user
async function generateRejectionInsight(
  userId: string,
  jobId: string,
  rejectionStage: string,
  company: string,
  roleTitle: string
) {
  try {
    // Load skill score for the likely blocking dimension
    const dimension = STAGE_TO_DIMENSION[rejectionStage] ?? "resume_quality";
    const [skillScore, recentRejections] = await Promise.all([
      db.userSkillScore.findFirst({ where: { userId, dimension: dimension as never }, select: { score: true } }),
      db.jobApplication.findMany({
        where: { userId, status: "rejected" },
        select: { rejectionStage: true },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
    ]);

    // Rejection pattern: how many at this same stage
    const patternCount = recentRejections.filter(r => r.rejectionStage === rejectionStage).length;

    const { text } = await generateText({
      model: fastModel,
      prompt: `A job seeker was rejected ${STAGE_LABEL[rejectionStage] ?? "at an unknown stage"} at ${company} for a ${roleTitle} role.
Their ${DIMENSION_LABEL[dimension] ?? dimension} score: ${skillScore?.score ?? "not assessed"}/100.
This is rejection #${patternCount} at this exact stage (out of their last ${recentRejections.length} rejections).

Write 1 direct, specific coaching insight — what likely caused this rejection and the single most important action to take. Max 2 sentences. No hedging.`,
    });

    await db.jobApplication.update({
      where: { id: jobId },
      data: { aiInsight: text.trim() },
    });

    await db.notification.create({
      data: {
        userId,
        type: "rejection_insight",
        title: `Rejection insight — ${company}`,
        body: text.trim().slice(0, 200),
      },
    });
  } catch (err) {
    console.error("[rejection-insight]", err);
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await params;
  const body = await req.json();

  const job = await db.jobApplication.findUnique({ where: { id: jobId, userId } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newStatus = body.status as JobStatus | undefined;
  const isNowRejected = newStatus === "rejected" && job.status !== "rejected";

  const updated = await db.jobApplication.update({
    where: { id: jobId },
    data: {
      ...(newStatus && { status: newStatus }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.followUpDate !== undefined && { followUpDate: body.followUpDate ? new Date(body.followUpDate) : null }),
      ...(newStatus === "applied" && !job.appliedAt && { appliedAt: new Date() }),
      ...(body.keywordMatchPct !== undefined && { keywordMatchPct: body.keywordMatchPct }),
      ...(body.source !== undefined && { source: body.source }),
      ...(body.resumeVersionId !== undefined && { resumeVersionId: body.resumeVersionId }),
      // Record the stage at time of rejection
      ...(isNowRejected && { rejectionStage: body.previousStatus ?? job.status }),
    },
  });

  // Fire-and-forget AI insight generation on rejection
  if (isNowRejected) {
    const rejStage = body.previousStatus ?? job.status;
    generateRejectionInsight(userId, jobId, rejStage, job.company, job.roleTitle);
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await params;
  await db.jobApplication.deleteMany({ where: { id: jobId, userId } });
  return NextResponse.json({ deleted: true });
}
