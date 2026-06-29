import { z } from "zod";

// ─── Zod schema ───────────────────────────────────────────────────────────────

export const TaskStepsSchema = z.object({
  why_it_matters: z.object({
    title: z.string(),
    text: z.string(),
    keyPoints: z.array(z.string()),
    interviewRelevance: z.string(),
    commonMistakes: z.array(z.string()),
  }),
  lesson: z.object({
    title: z.string(),
    sections: z.array(z.object({ heading: z.string(), body: z.string() })),
    summary: z.string(),
  }),
  example_gallery: z.object({
    title: z.string(),
    examples: z.array(z.object({
      label: z.enum(["Bad", "Average", "Excellent"]),
      text: z.string(),
      annotation: z.string(),
    })),
  }),
  practice: z.object({
    title: z.string(),
    instructions: z.string(),
    placeholder: z.string(),
    dimension: z.string(), // SkillDimension key
  }),
  quiz: z.object({
    title: z.string(),
    questions: z.array(z.object({
      question: z.string(),
      options: z.array(z.string()),
      correct: z.number().int().min(0).max(3),
      explanation: z.string(),
    })),
  }),
  deliverable: z.object({
    title: z.string(),
    instructions: z.string(),
    type: z.enum([
      "resume_bullets", "linkedin_summary", "star_story",
      "portfolio_project", "interview_answers", "case_study",
      "flashcard_deck", "project_doc",
    ]),
    template: z.string().optional(),
  }),
});

export type GeneratedSteps = z.infer<typeof TaskStepsSchema>;

// ─── Generation prompt ────────────────────────────────────────────────────────

export function buildTaskStepsPrompt(context: {
  label: string;
  description?: string | null;
  whyItMatters?: string | null;
  gapLabel?: string | null;
  targetRole: string;
  impactScore: number;
}): string {
  const role = context.targetRole.replace(/_/g, " ");
  return `Create a 6-step structured learning experience for a ${role} candidate.

Task: ${context.label}
${context.description ? `Description: ${context.description}` : ""}
${context.whyItMatters ? `Why it matters: ${context.whyItMatters}` : ""}
${context.gapLabel ? `Skill gap this closes: ${context.gapLabel}` : ""}
Readiness impact: ${context.impactScore}/10

Generate all 6 steps. Be specific, practical, and role-appropriate. No filler.

why_it_matters:
- text: 2-3 sentences on business value and why ${role}s need this skill
- keyPoints: exactly 3 punchy bullet points (what, when, how)
- interviewRelevance: one sentence on how this comes up in ${role} interviews
- commonMistakes: exactly 2 mistakes people make on this topic

lesson:
- title: short, specific
- sections: exactly 3 sections (concept, how to apply, patterns/frameworks) with heading + 3-4 sentence body
- summary: one sentence takeaway

example_gallery:
- title: short, specific
- examples: exactly 3 — Bad, Average, Excellent — all on the SAME topic related to this task
- Each example: realistic text (2-4 sentences), annotation explaining what makes it bad/average/excellent

practice:
- title: short, active (e.g. "Write Your Impact Bullet")
- instructions: 2-3 sentences telling user exactly what to produce
- placeholder: first-person starting phrase to help them begin (e.g. "I led the migration of...")
- dimension: the single most relevant SkillDimension key from: resume_quality, ats_score, ownership_language, impact_writing, interview_confidence, system_design, business_thinking, leadership, communication, ai_knowledge, problem_solving

quiz:
- title: short (e.g. "Check Your Understanding")
- questions: exactly 3 questions testing the lesson content
- Each: question string, 4 options, correct index (0-3), explanation of why it's correct

deliverable:
- title: the name of what they'll produce (e.g. "Your STAR Story", "3 Impact Bullets")
- instructions: what to write, what quality looks like, how long
- type: the best matching deliverable type
- template: optional skeleton with [...] placeholders if useful`;
}

// ─── Practice evaluation prompt ───────────────────────────────────────────────

export function buildPracticeEvaluationPrompt(context: {
  taskLabel: string;
  instructions: string;
  userInput: string;
  targetRole: string;
  dimension: string;
}): string {
  const role = context.targetRole.replace(/_/g, " ");
  const dim = context.dimension.replace(/_/g, " ");

  return `Evaluate this practice submission from a ${role} candidate working on: ${context.taskLabel}

Instructions given:
${context.instructions}

Their response:
${context.userInput}

Score 0-100 on ${dim} quality:
- Specificity: concrete examples, numbers, names, scope (35pts)
- Impact language: outcomes, business results, not just activities (35pts)
- Structure: clear, logically organized (20pts)
- Role-appropriateness: sounds like a ${role} (10pts)

Return valid JSON only (no markdown fences):
{
  "score": <number 0-100>,
  "verdict": "<one sentence summary>",
  "strengths": ["<specific strength>", "<specific strength>"],
  "improvements": ["<specific improvement>", "<specific improvement>"]
}`;
}
