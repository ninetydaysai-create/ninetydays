import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/sync-user";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { buildGapEnginePrompt } from "@/prompts/gap-engine";
import { ResumeAnalysisResult } from "@/types/resume";
import { enrichGapsWithLinks } from "@/lib/resource-links";

const GapItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  severity: z.enum(["critical", "major", "minor"]),
  estimatedHours: z.number(),
  resourceLinks: z.array(z.string()),
  resolved: z.boolean().default(false),
});

const GapReportSchema = z.object({
  skillGaps: z.array(GapItemSchema),
  projectGaps: z.array(GapItemSchema),
  storyGaps: z.array(GapItemSchema),
  totalGapScore: z.number(),
  summary: z.string(),
});

// Default benchmarks per role (in production these come from DB)
const DEFAULT_BENCHMARKS: Record<string, { requiredSkills: string[]; requiredProjects: string[]; requiredStories: string[] }> = {
  product_swe: {
    requiredSkills: ["System Design", "Data Structures & Algorithms", "API Design", "Cloud (AWS/GCP/Azure)", "TypeScript", "Testing"],
    requiredProjects: ["High-traffic REST API", "Full-stack product with auth", "Open source contribution", "Performance optimization project"],
    requiredStories: ["Scaled a system 10x", "Led a cross-team project", "Shipped 0-to-1 feature", "Navigated technical disagreement"],
  },
  ml_eng: {
    requiredSkills: ["Python", "PyTorch/TensorFlow", "MLOps", "Feature Engineering", "Model Evaluation", "SQL", "Docker"],
    requiredProjects: ["End-to-end ML pipeline", "Model deployment with API", "RAG / LLM application", "A/B testing framework"],
    requiredStories: ["Improved model metric by X%", "Deployed ML model to production", "Reduced inference latency", "Handled data quality issue"],
  },
  ai_pm: {
    requiredSkills: ["Product Metrics", "SQL", "A/B Testing", "AI/ML fundamentals", "User Research", "Roadmap Prioritization"],
    requiredProjects: ["Product spec with AI feature", "Metrics dashboard", "User research study"],
    requiredStories: ["Launched AI feature", "Drove alignment across teams", "Killed a project that wasn't working", "Improved key metric"],
  },
  staff_eng: {
    requiredSkills: ["System Architecture", "Technical Leadership", "Cross-team Coordination", "Cloud Infrastructure", "Security", "Performance"],
    requiredProjects: ["Architecture migration", "Platform/infrastructure project", "Mentorship program"],
    requiredStories: ["Unblocked org-wide project", "Technical vision you set", "Mentored junior engineers", "Drove adoption of new practice"],
  },
  data_scientist: {
    requiredSkills: ["Python", "Statistics", "SQL", "Machine Learning", "Data Visualization", "Experimentation"],
    requiredProjects: ["Causal inference study", "Forecasting model", "Dashboard with insights"],
    requiredStories: ["Insight that drove business decision", "Built experiment framework", "Worked with stakeholders on data problem"],
  },
};

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(userId);

  const { analysisId } = await req.json();
  if (!analysisId) return NextResponse.json({ error: "analysisId required" }, { status: 400 });

  const analysis = await db.resumeAnalysis.findUnique({
    where: { id: analysisId, userId },
    include: { resume: { select: { rawText: true } } },
  });
  if (!analysis) return NextResponse.json({ error: "Analysis not found" }, { status: 404 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      targetRole:        true,
      yearsExperience:   true,
      currentRole:       true,
      targetCompanyType: true,
    },
  });

  const targetRole = user?.targetRole ?? "product_swe";
  const benchmark = DEFAULT_BENCHMARKS[targetRole] ?? DEFAULT_BENCHMARKS["product_swe"];

  // rawAnalysis contains signalDepthMap + techYears from the analyzer
  const rawAnalysis = analysis.rawAnalysis as unknown as ResumeAnalysisResult;

  const { object } = await generateObject({
    model: defaultModel,
    schema: GapReportSchema,
    prompt: buildGapEnginePrompt(
      rawAnalysis,
      targetRole,
      benchmark,
      analysis.resume?.rawText ?? undefined,
      user?.yearsExperience ?? undefined,
      user?.currentRole ?? undefined,
      user?.targetCompanyType ?? undefined,
    ),
  });

  // Enrich each gap with curated resource links from our library
  const skillGaps = enrichGapsWithLinks(object.skillGaps);
  const projectGaps = enrichGapsWithLinks(object.projectGaps);
  const storyGaps = enrichGapsWithLinks(object.storyGaps);

  const report = await db.gapReport.upsert({
    where: { analysisId },
    create: {
      userId,
      analysisId,
      skillGaps,
      projectGaps,
      storyGaps,
      totalGapScore: object.totalGapScore,
    },
    update: {
      skillGaps,
      projectGaps,
      storyGaps,
      totalGapScore: object.totalGapScore,
    },
  });

  return NextResponse.json({ gapReportId: report.id, totalGapScore: report.totalGapScore });
}
