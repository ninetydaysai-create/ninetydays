import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { SkillDimension } from "@prisma/client";
import { buildPracticeEvaluationPrompt } from "@/prompts/task-steps";
import { applyPracticeScore, applyQuizScore } from "@/lib/skill-scores";

interface PracticeContent {
  instructions: string;
  placeholder: string;
  dimension: string;
}

interface QuizContent {
  questions: { question: string; options: string[]; correct: number; explanation: string }[];
}

interface DeliverableContent {
  instructions: string;
  type: string;
  template?: string;
}

const FeedbackSchema = z.object({
  score:        z.number().min(0).max(100),
  verdict:      z.string(),
  strengths:    z.array(z.string()),
  improvements: z.array(z.string()),
});

// POST /api/roadmap/tasks/[taskId]/steps/[stepId]/complete
// Marks a step complete. For practice/quiz/deliverable, expects body payload.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ taskId: string; stepId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId, stepId } = await params;
  const body = await req.json().catch(() => ({}));

  const step = await db.taskStep.findFirst({
    where: { id: stepId, taskId, task: { week: { roadmap: { userId } } } },
    include: { task: { include: { week: { include: { roadmap: { select: { targetRole: true } } } } } } },
  });
  if (!step) return NextResponse.json({ error: "Step not found" }, { status: 404 });
  if (step.completedAt) return NextResponse.json({ error: "Already completed" }, { status: 409 });

  const targetRole = step.task.week.roadmap.targetRole ?? "product_swe";
  let score: number | undefined;
  let aiFeedback: object | undefined;
  let quizResults: { correct: boolean; explanation: string }[] | undefined;

  // ── Practice step: AI evaluate response ──────────────────────────────────
  if (step.type === "practice") {
    const { userInput } = body;
    if (!userInput?.trim() || userInput.trim().length < 30) {
      return NextResponse.json({ error: "Response too short" }, { status: 422 });
    }
    const content = step.content as unknown as PracticeContent;
    const { object } = await generateObject({
      model: defaultModel,
      schema: FeedbackSchema,
      prompt: buildPracticeEvaluationPrompt({
        taskLabel:   step.task.label,
        instructions: content.instructions,
        userInput:    userInput.trim(),
        targetRole,
        dimension:    content.dimension,
      }),
    });
    score = object.score;
    aiFeedback = { verdict: object.verdict, strengths: object.strengths, improvements: object.improvements };

    if (content.dimension && Object.values(SkillDimension).includes(content.dimension as SkillDimension)) {
      await applyPracticeScore(userId, stepId, content.dimension as SkillDimension, object.score);
    }

    await db.taskStep.update({
      where: { id: stepId },
      data: { userInput: userInput.trim(), aiFeedback, score, completedAt: new Date() },
    });
  }

  // ── Quiz step: check answers ──────────────────────────────────────────────
  else if (step.type === "quiz") {
    const { answers } = body as { answers: number[] };
    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: "answers array required" }, { status: 422 });
    }
    const content = step.content as unknown as QuizContent;
    quizResults = content.questions.map((q, i) => ({
      correct: answers[i] === q.correct,
      explanation: q.explanation,
    }));
    const correctCount = quizResults.filter((r) => r.correct).length;
    score = Math.round((correctCount / content.questions.length) * 100);

    // Pick a representative skill dimension from the task's practice step (best-effort)
    const practiceStep = await db.taskStep.findFirst({
      where: { taskId, type: "practice" },
      select: { content: true },
    });
    const practiceContent = practiceStep?.content as unknown as PracticeContent | null;
    const quizDimension = practiceContent?.dimension as SkillDimension | undefined;
    if (quizDimension && Object.values(SkillDimension).includes(quizDimension)) {
      await applyQuizScore(userId, stepId, quizDimension, score);
    }

    await db.taskStep.update({
      where: { id: stepId },
      data: { score, completedAt: new Date() },
    });
  }

  // ── Deliverable step: create Deliverable record ───────────────────────────
  else if (step.type === "deliverable") {
    const { userInput } = body;
    if (!userInput?.trim() || userInput.trim().length < 30) {
      return NextResponse.json({ error: "Deliverable too short" }, { status: 422 });
    }
    const content = step.content as unknown as DeliverableContent;

    await db.deliverable.create({
      data: {
        userId,
        taskId,
        type: content.type as never,
        title: step.title,
        content: { text: userInput.trim() },
      },
    });

    await db.taskStep.update({
      where: { id: stepId },
      data: { userInput: userInput.trim(), completedAt: new Date() },
    });
  }

  // ── Simple steps (why_it_matters, lesson, example_gallery) ───────────────
  else {
    await db.taskStep.update({
      where: { id: stepId },
      data: { completedAt: new Date() },
    });
  }

  // ── Auto-complete task when all steps done ────────────────────────────────
  const allSteps = await db.taskStep.findMany({ where: { taskId } });
  const allDone = allSteps.every((s) => s.id === stepId || !!s.completedAt);

  if (allDone && !step.task.completed) {
    await db.roadmapTask.update({
      where: { id: taskId },
      data: { completed: true, completedAt: new Date() },
    });
    await db.activityLog.create({
      data: {
        userId,
        type: "task_completed",
        metadata: { taskId, taskLabel: step.task.label, via: "steps" },
      },
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, score, aiFeedback, quizResults, taskCompleted: allDone });
}
