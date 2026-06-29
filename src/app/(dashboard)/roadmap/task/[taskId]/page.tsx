import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Clock, TrendingUp } from "lucide-react";
import { TaskStepFlow } from "@/components/task-steps/TaskStepFlow";

interface Props {
  params: Promise<{ taskId: string }>;
}

export default async function TaskPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { taskId } = await params;

  const task = await db.roadmapTask.findFirst({
    where: { id: taskId, week: { roadmap: { userId } } },
    include: {
      steps: { orderBy: { order: "asc" } },
      week: {
        select: {
          theme: true,
          weekNumber: true,
          roadmap: { select: { targetRole: true } },
        },
      },
    },
  });

  if (!task) notFound();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back nav */}
      <Link
        href="/roadmap"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to roadmap
      </Link>

      {/* Task header */}
      <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Week {task.week.weekNumber} · {task.week.theme}
          </span>
          {task.completed && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Completed
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-white leading-snug mb-4">{task.label}</h1>
        {task.description && (
          <p className="text-slate-300 text-base leading-relaxed mb-4">{task.description}</p>
        )}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            {task.hours}h estimated
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
            <TrendingUp className="h-3.5 w-3.5" />
            Impact {task.impactScore}/10
          </span>
        </div>
      </div>

      {/* Step flow — fetches/generates steps client-side if needed */}
      <TaskStepFlow
        taskId={task.id}
        taskLabel={task.label}
        existingSteps={task.steps as never}
        alreadyCompleted={task.completed}
      />
    </div>
  );
}
