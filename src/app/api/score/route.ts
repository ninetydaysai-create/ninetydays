import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { ResumeAnalysisResult } from "@/types/resume";
import { GapReportResult } from "@/types/gaps";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { hashJd, getCachedScore, setCachedScore } from "@/lib/jd-cache";

const ScoreSchema = z.object({
  readinessScore: z.number(),
  verdict: z.string(),
  topGaps: z.array(z.object({
    label: z.string(),
    severity: z.enum(["critical", "major", "minor"]),
    impact: z.string(),
  })),
  strongMatches: z.array(z.string()),
  topAction: z.string(),
  timeToReady: z.string(),
});

// Rate limits: FREE/anon = 5/hour, PRO = 50/hour
const FREE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 };
const PRO_LIMIT  = { max: 50, windowMs: 60 * 60 * 1000 };

export async function POST(req: Request) {
  const { jdText } = await req.json();
  if (!jdText || jdText.trim().length < 50) {
    return NextResponse.json({ error: "Paste a job description (at least 50 characters)" }, { status: 400 });
  }

  // Determine if user is logged in + their plan
  let userId: string | null = null;
  let isPro = false;
  try {
    const session = await auth();
    userId = session.userId;
    if (userId) {
      const user = await db.user.findUnique({ where: { id: userId }, select: { plan: true } });
      isPro = user?.plan === "PRO";
    }
  } catch { /* not logged in */ }

  // Rate limit by IP (anon) or userId (logged in)
  const ip = getClientIp(req);
  const rateLimitKey = userId ? `score:user:${userId}` : `score:ip:${ip}`;
  const limit = isPro ? PRO_LIMIT : FREE_LIMIT;
  const rateCheck = await checkRateLimit(rateLimitKey, limit.max, limit.windowMs);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Rate limit reached. Try again in ${rateCheck.retryAfterSecs} seconds.` },
      { status: 429 }
    );
  }

  // Cache check — skip AI if same JD scored in last 24h
  // Personalized results are cached per-user; anon results are shared
  const jdHash = hashJd(jdText) + (userId ? `:${userId}` : ":anon");
  const cached = getCachedScore(jdHash);
  if (cached) {
    return NextResponse.json({ ...cached as object, cached: true });
  }

  // Build personalized candidate context if logged in
  let candidateContext = "";
  if (userId) {
    const [analysis, gapReport] = await Promise.all([
      db.resumeAnalysis.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { rawAnalysis: true, overallScore: true, skillsFound: true },
      }),
      db.gapReport.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { skillGaps: true, totalGapScore: true },
      }),
    ]);

    if (analysis && gapReport) {
      const raw = analysis.rawAnalysis as unknown as ResumeAnalysisResult;
      const gaps = (gapReport.skillGaps as unknown as GapReportResult["skillGaps"]) ?? [];
      const signalMap = raw?.signalDepthMap;
      const strong = signalMap
        ? Object.entries(signalMap).filter(([, d]) => d === "STRONG").map(([s]) => s)
        : (analysis.skillsFound as string[]) ?? [];

      candidateContext = `
PERSONALIZED CANDIDATE DATA:
- Overall resume score: ${analysis.overallScore}/100
- Readiness score: ${gapReport.totalGapScore}/100
- Skills with strong project evidence: ${strong.join(", ")}
- Critical gaps: ${gaps.filter((g) => g.severity === "critical").map((g) => g.label).join(", ")}
- Major gaps: ${gaps.filter((g) => g.severity === "major").map((g) => g.label).join(", ")}

Use this data to personalize the readiness score for THIS specific JD.`;
    }
  }

  const prompt = `You are a career readiness scorer. Analyze how ready a candidate is for this specific job.
${candidateContext || `
GENERIC MODE: No candidate profile available. Score based on what a typical service-company engineer (5-8 years experience) would bring to this role. Be realistic — most will score 40-60% for product company roles.`}

JOB DESCRIPTION:
${jdText.slice(0, 3000)}

Score the candidate's readiness and return JSON:
{
  "readinessScore": <0-100: subtract from 100 for each critical gap (-15 to -25), major gap (-8 to -12), minor gap (-3 to -5)>,
  "verdict": "<one punchy line — e.g. 'Strong match — 2 gaps to close before applying'>",
  "topGaps": [
    { "label": "<gap name>", "severity": "critical|major|minor", "impact": "<why this gap specifically hurts for this JD>" }
  ],
  "strongMatches": ["<specific skill or experience that matches the JD — 2-4 items>"],
  "topAction": "<single most impactful thing to do right now — specific, not generic>",
  "timeToReady": "<e.g. '3-4 weeks of focused work' or 'Ready now — apply this week'>"
}

topGaps: maximum 3, ordered by impact on THIS specific JD.
Return ONLY valid JSON.`;

  const { object } = await generateObject({
    model: defaultModel,
    schema: ScoreSchema,
    prompt,
  });

  // Cache result
  setCachedScore(jdHash, object);

  return NextResponse.json(object);
}
