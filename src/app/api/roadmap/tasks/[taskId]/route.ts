import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { triggerReadyToApplyEmail } from "@/lib/email-triggers";

interface GapItem {
  label: string;
  severity: string;
}

function severityBonus(severity: string): number {
  if (severity === "critical") return 12;
  if (severity === "major")    return 7;
  return 4;
}

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
    where: { id: taskId, week: { roadmap: { userId } } },
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

  // --- Gap-aware readiness recalculation ---
  const direction = completed ? 1 : -1;

  // Base bump from this task's impact score
  let impactBump = Math.round((task.impactScore * direction) / 2);

  // Extra bonus when an entire gap is resolved or un-resolved
  if (task.gapLabel) {
    const [siblingTasks, gapReport] = await Promise.all([
      db.roadmapTask.findMany({
        where: { week: { roadmap: { userId } }, gapLabel: task.gapLabel },
        select: { id: true, completed: true, impactScore: true },
      }),
      db.gapReport.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, totalGapScore: true, skillGaps: true, projectGaps: true, storyGaps: true },
      }),
    ]);

    const allGapDone = siblingTasks.every((t) => (t.id === taskId ? completed : t.completed));
    const noneGapDone = siblingTasks.every((t) => (t.id === taskId ? !completed : !t.completed));

    if (gapReport) {
      const allGaps = [
        ...(gapReport.skillGaps as unknown as GapItem[]),
        ...(gapReport.projectGaps as unknown as GapItem[]),
        ...(gapReport.storyGaps as unknown as GapItem[]),
      ];
      const gap = allGaps.find((g) => g.label === task.gapLabel);
      const bonus = gap ? severityBonus(gap.severity) : 5;

      if (allGapDone && completed)  impactBump += bonus;  // fully closed this gap
      if (noneGapDone && !completed) impactBump -= bonus; // re-opened this gap
    }
  }

  const gapReport = await db.gapReport.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, totalGapScore: true },
  });

  let newReadiness: number | null = null;
  if (gapReport) {
    const newScore = Math.min(100, Math.max(0, gapReport.totalGapScore + impactBump));
    await db.gapReport.update({ where: { id: gapReport.id }, data: { totalGapScore: newScore } });
    newReadiness = newScore;

    if (completed && newReadiness !== null && newReadiness >= 70 && gapReport.totalGapScore < 70) {
      triggerReadyToApplyEmail(userId).catch(() => {});
    }
  }

  await db.activityLog.create({
    data: { userId, type: "task_completed", metadata: { taskId, taskLabel: task.label, completed } },
  }).catch(() => {});

  return NextResponse.json({ task: updated, newReadiness });
}
