import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { triggerReadyToApplyEmail } from "@/lib/email-triggers";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  const { completed } = await req.json();

  // Verify task belongs to user via roadmap
  const task = await db.roadmapTask.findFirst({
    where: {
      id: taskId,
      week: { roadmap: { userId } },
    },
    include: { week: true },
  });
  if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

  const updated = await db.roadmapTask.update({
    where: { id: taskId },
    data: { completed, completedAt: completed ? new Date() : null },
  });

  // Auto-mark week deliverable done when all tasks complete
  const weekTasks = await db.roadmapTask.findMany({ where: { weekId: task.weekId } });
  const allDone = weekTasks.every((t) => (t.id === taskId ? completed : t.completed));
  if (allDone) {
    await db.roadmapWeek.update({ where: { id: task.weekId }, data: { deliverableDone: true } });
  }

  // Recalculate readiness: impactScore contributes to totalGapScore in gap report
  // Each task completion nudges readiness up (completing = +impact, unchecking = -impact)
  const direction = completed ? 1 : -1;
  const impactBump = Math.round((task.impactScore * direction) / 2); // max +5 per task

  const gapReport = await db.gapReport.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, totalGapScore: true },
  });

  let newReadiness: number | null = null;
  if (gapReport) {
    const newScore = Math.min(100, Math.max(0, gapReport.totalGapScore + impactBump));
    await db.gapReport.update({
      where: { id: gapReport.id },
      data: { totalGapScore: newScore },
    });
    newReadiness = newScore;

    // Trigger "ready to apply" email if crossing 70% for the first time
    if (completed && newReadiness !== null && newReadiness >= 70 && gapReport.totalGapScore < 70) {
      // Fire and forget — non-blocking
      triggerReadyToApplyEmail(userId).catch(() => {});
    }
  }

  // Log activity for streak tracking
  await db.activityLog.create({
    data: { userId, type: "task_completed", metadata: { taskId, taskLabel: task.label, completed } },
  }).catch(() => {}); // non-fatal

  return NextResponse.json({ task: updated, newReadiness });
}
