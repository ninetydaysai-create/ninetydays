import { db } from "@/lib/db";
import { GapItem } from "@/types/gaps";

// ─── Shape ────────────────────────────────────────────────────────────────────

export interface CareerContext {
  // Identity
  name: string | null;
  targetRole: string;
  currentRole: string | null;
  currentCompany: string | null;
  yearsExperience: number | null;

  // Goals (from CareerProfile)
  careerGoal: string | null;
  targetCompanies: string[];
  targetSalary: string | null;
  targetLocation: string | null;

  // Resume & gaps
  resumeScore: number | null;
  skillsFound: string[];
  criticalGaps: string[];
  majorGaps: string[];
  projectGaps: string[];
  storyGaps: string[];

  // Skill dimensions
  skillScores: Record<string, number>;
  weakestDimensions: string[];
  strongestDimensions: string[];

  // Roadmap progress
  roadmapTasksTotal: number;
  roadmapTasksDone: number;
  currentWeekTheme: string | null;
  pendingTaskLabels: string[];

  // Interviews
  interviewSessionCount: number;
  avgInterviewScore: number | null;

  // Portfolio
  deliverableCount: number;
  recentDeliverableTitles: string[];

  // Self-assessment (user-supplied)
  strengths: string[];
  weaknesses: string[];
  achievements: string[];
  notes: string | null;

  // Goal Engine
  targetRoleTitle: string | null;
  priority: string[];        // ordered focus areas e.g. ["interview","resume","system_design"]
  currentStage: string | null;
  needsVisa: boolean;
}

// ─── Builder ──────────────────────────────────────────────────────────────────

export async function buildCareerContext(userId: string): Promise<CareerContext> {
  const [
    user,
    profile,
    latestAnalysis,
    latestGapReport,
    skillScoreRows,
    roadmap,
    sessions,
    deliverables,
  ] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { name: true, targetRole: true, currentRole: true, currentCompany: true, yearsExperience: true },
    }),
    db.careerProfile.findUnique({ where: { userId } }),
    db.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { overallScore: true, skillsFound: true },
    }),
    db.gapReport.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { skillGaps: true, projectGaps: true, storyGaps: true },
    }),
    db.userSkillScore.findMany({ where: { userId } }),
    db.roadmap.findUnique({
      where: { userId },
      include: {
        weeks: {
          include: { tasks: { select: { label: true, completed: true } } },
          orderBy: { weekNumber: "asc" },
        },
      },
    }),
    db.interviewSession.findMany({
      where: { userId, status: "complete" },
      select: { overallScore: true },
    }),
    db.deliverable.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { title: true },
    }),
  ]);

  // Skill scores + weak/strong
  const skillScores: Record<string, number> = {};
  for (const row of skillScoreRows) skillScores[row.dimension] = row.score;

  const componentScores = skillScoreRows.filter((r) => r.dimension !== "recruiter_readiness");
  const sorted = [...componentScores].sort((a, b) => a.score - b.score);
  const weakestDimensions = sorted.slice(0, 3).map((r) => r.dimension.replace(/_/g, " "));
  const strongestDimensions = sorted.slice(-3).reverse().map((r) => r.dimension.replace(/_/g, " "));

  // Gaps
  const skillGaps   = (latestGapReport?.skillGaps   as unknown as GapItem[]) ?? [];
  const projectGaps = (latestGapReport?.projectGaps as unknown as GapItem[]) ?? [];
  const storyGaps   = (latestGapReport?.storyGaps   as unknown as GapItem[]) ?? [];

  // Roadmap
  const allTasks     = roadmap?.weeks.flatMap((w) => w.tasks) ?? [];
  const currentWeek  = roadmap?.weeks.find((w) => w.tasks.some((t) => !t.completed));
  const pendingTasks = (currentWeek?.tasks ?? []).filter((t) => !t.completed);

  // Interview avg
  const rawScores      = sessions.map((s) => s.overallScore).filter((s): s is number => s !== null);
  const avgInterviewScore = rawScores.length
    ? Math.round(rawScores.reduce((a, b) => a + b, 0) / rawScores.length)
    : null;

  return {
    name:            user?.name ?? null,
    targetRole:      user?.targetRole ?? "product_swe",
    currentRole:     user?.currentRole ?? null,
    currentCompany:  user?.currentCompany ?? null,
    yearsExperience: user?.yearsExperience ?? null,

    careerGoal:       profile?.careerGoal ?? null,
    targetCompanies:  (profile?.targetCompanies as string[]) ?? [],
    targetSalary:     profile?.targetSalary ?? null,
    targetLocation:   profile?.targetLocation ?? null,

    resumeScore:  latestAnalysis?.overallScore ?? null,
    skillsFound:  (latestAnalysis?.skillsFound as string[]) ?? [],
    criticalGaps: skillGaps.filter((g) => g.severity === "critical").map((g) => g.label),
    majorGaps:    skillGaps.filter((g) => g.severity === "major").map((g) => g.label),
    projectGaps:  projectGaps.filter((g) => g.severity !== "minor").map((g) => g.label),
    storyGaps:    storyGaps.map((g) => g.label),

    skillScores,
    weakestDimensions,
    strongestDimensions,

    roadmapTasksTotal: allTasks.length,
    roadmapTasksDone:  allTasks.filter((t) => t.completed).length,
    currentWeekTheme:  currentWeek?.theme ?? null,
    pendingTaskLabels: pendingTasks.slice(0, 4).map((t) => t.label),

    interviewSessionCount: sessions.length,
    avgInterviewScore,

    deliverableCount:        deliverables.length,
    recentDeliverableTitles: deliverables.map((d) => d.title),

    strengths:    (profile?.strengths    as string[]) ?? [],
    weaknesses:   (profile?.weaknesses   as string[]) ?? [],
    achievements: (profile?.achievements as string[]) ?? [],
    notes:        profile?.notes ?? null,

    // Goal Engine
    targetRoleTitle: profile?.targetRoleTitle ?? null,
    priority:        (profile?.priority        as string[]) ?? [],
    currentStage:    profile?.currentStage     ?? null,
    needsVisa:       profile?.needsVisa        ?? false,
  };
}

// ─── Formatter ────────────────────────────────────────────────────────────────

// Returns a structured text block every AI system prompt can include.
export function formatCareerContextForAI(ctx: CareerContext): string {
  const sections: string[] = [];

  const STAGE_LABELS: Record<string, string> = {
    not_applying:       "Not applying yet — in preparation",
    applying:           "Actively applying (no interviews yet)",
    getting_interviews: "Getting interviews — working on conversion",
    final_rounds:       "In final rounds",
  };

  const PRIORITY_LABELS: Record<string, string> = {
    interview:    "Interview Skills",
    resume:       "Resume & Writing",
    system_design:"System Design",
    product:      "Product Thinking",
    ai:           "AI & ML Knowledge",
  };

  // Identity + goals
  const identity = [
    `Candidate: ${ctx.name ?? "Unknown"}`,
    ctx.targetRoleTitle
      ? `Target: ${ctx.targetRoleTitle} (${ctx.targetRole.replace(/_/g, " ")})`
      : `Target role: ${ctx.targetRole.replace(/_/g, " ")}`,
    ctx.currentRole &&
      `Current: ${ctx.currentRole}${ctx.currentCompany ? ` at ${ctx.currentCompany}` : ""}${ctx.yearsExperience ? ` · ${ctx.yearsExperience} yrs exp` : ""}`,
    ctx.careerGoal      && `Goal: "${ctx.careerGoal}"`,
    ctx.targetCompanies.length && `Target companies: ${ctx.targetCompanies.join(", ")}`,
    ctx.targetSalary    && `Target salary: ${ctx.targetSalary}`,
    ctx.targetLocation  && `Location: ${ctx.targetLocation}`,
  ].filter(Boolean).join("\n");
  sections.push(identity);

  // Goal Engine context
  const goalParts = [
    ctx.currentStage && `Job search stage: ${STAGE_LABELS[ctx.currentStage] ?? ctx.currentStage}`,
    ctx.priority.length && `Focus priority: ${ctx.priority.map((p, i) => `${i + 1}. ${PRIORITY_LABELS[p] ?? p}`).join(", ")}`,
    ctx.needsVisa && "Visa sponsorship required: Yes",
  ].filter(Boolean);
  if (goalParts.length) sections.push(goalParts.join("\n"));

  // Resume & gaps
  const resumeParts = [
    ctx.resumeScore !== null  && `Resume score: ${ctx.resumeScore}/100`,
    ctx.skillsFound.length    && `Skills with evidence: ${ctx.skillsFound.slice(0, 8).join(", ")}`,
    ctx.criticalGaps.length   && `CRITICAL gaps (rejection risk): ${ctx.criticalGaps.join(", ")}`,
    ctx.majorGaps.length      && `Major gaps: ${ctx.majorGaps.join(", ")}`,
    ctx.projectGaps.length    && `Project gaps: ${ctx.projectGaps.join(", ")}`,
    ctx.storyGaps.length      && `Story gaps (interview): ${ctx.storyGaps.join(", ")}`,
  ].filter(Boolean);
  if (resumeParts.length) sections.push(resumeParts.join("\n"));

  // Skill dimension scores
  const dimensionEntries = Object.entries(ctx.skillScores).filter(([d]) => d !== "recruiter_readiness");
  if (dimensionEntries.length) {
    const scoreStr = dimensionEntries
      .map(([d, s]) => `${d.replace(/_/g, " ")}: ${s}`)
      .join(" | ");
    const dimParts = [
      `Skill scores: ${scoreStr}`,
      ctx.weakestDimensions.length    && `Weakest: ${ctx.weakestDimensions.join(", ")}`,
      ctx.strongestDimensions.length  && `Strongest: ${ctx.strongestDimensions.join(", ")}`,
    ].filter(Boolean);
    sections.push(dimParts.join("\n"));
  }

  // Progress
  const progressParts = [
    ctx.roadmapTasksTotal > 0 &&
      `Roadmap: ${ctx.roadmapTasksDone}/${ctx.roadmapTasksTotal} tasks done`,
    ctx.currentWeekTheme  && `Active week: "${ctx.currentWeekTheme}"`,
    ctx.pendingTaskLabels.length && `Pending: ${ctx.pendingTaskLabels.join(", ")}`,
    ctx.interviewSessionCount > 0 &&
      `Interviews: ${ctx.interviewSessionCount} sessions${ctx.avgInterviewScore !== null ? `, avg ${ctx.avgInterviewScore}/100` : ""}`,
    ctx.deliverableCount > 0 &&
      `Deliverables: ${ctx.deliverableCount} built (${ctx.recentDeliverableTitles.slice(0, 3).join(", ")})`,
  ].filter(Boolean);
  if (progressParts.length) sections.push(progressParts.join("\n"));

  // Self-assessment
  const selfParts = [
    ctx.strengths.length    && `Strengths: ${ctx.strengths.join(", ")}`,
    ctx.weaknesses.length   && `Weaknesses: ${ctx.weaknesses.join(", ")}`,
    ctx.achievements.length && `Achievements: ${ctx.achievements.join("; ")}`,
    ctx.notes               && `Additional context: ${ctx.notes}`,
  ].filter(Boolean);
  if (selfParts.length) sections.push(selfParts.join("\n"));

  return sections.join("\n\n");
}
