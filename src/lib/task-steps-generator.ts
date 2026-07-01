/**
 * Shared task-step generation utility.
 * Used by:
 *   - GET /api/roadmap/tasks/[taskId]   — lazy generation on first open
 *   - POST /api/roadmap/generate        — background pre-generation for first tasks
 */

import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { TaskStepType } from "@prisma/client";
import { TaskStepsSchema, buildTaskStepsPrompt, type GeneratedSteps } from "@/prompts/task-steps";

const STEP_ORDER: TaskStepType[] = [
  "why_it_matters", "lesson", "example_gallery", "practice", "quiz", "deliverable",
];

/**
 * Generates all 6 steps for a task and persists them.
 * Idempotent — skips silently if steps already exist.
 * Returns the created steps, or null on failure.
 */
export async function generateAndSaveTaskSteps(
  taskId: string,
  targetRole: string
) {
  // Idempotency check — don't regenerate if steps already exist
  const existing = await db.taskStep.count({ where: { taskId } });
  if (existing > 0) return null;

  const task = await db.roadmapTask.findUnique({
    where:  { id: taskId },
    select: { label: true, description: true, whyItMatters: true, gapLabel: true, impactScore: true },
  });
  if (!task) return null;

  const { object: generated } = await generateObject({
    model: defaultModel,
    schema: TaskStepsSchema,
    prompt: buildTaskStepsPrompt({
      label:        task.label,
      description:  task.description,
      whyItMatters: task.whyItMatters,
      gapLabel:     task.gapLabel,
      targetRole,
      impactScore:  task.impactScore,
    }),
  });

  const steps = await db.$transaction(
    STEP_ORDER.map((type, order) =>
      db.taskStep.create({
        data: {
          taskId,
          type,
          order,
          title:   (generated[type as keyof GeneratedSteps] as { title: string }).title,
          content:  generated[type as keyof GeneratedSteps] as object,
        },
      })
    )
  );

  return steps;
}
