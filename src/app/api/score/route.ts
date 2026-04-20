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
  isValidJd: z.boolean(),         // AI explicitly flags gibberish / non-JD input
  readinessScore: z.number(),
  verdict: z.string(),
  topGaps: z.array(z.object({
    label: z.string(),
    severity: z.enum(["critical", "major", "minor"]),
    impact: z.string(),
    timeToFix: z.string(),
  })),
  strongMatches: z.array(z.string()),
  topAction: z.string(),
  timeToReady: z.string(),
});

// Common English function words — real text always contains several of these
const COMMON_WORDS = new Set([
  "the","a","an","and","or","for","with","to","in","of","you","we","are","is","will",
  "be","have","has","this","that","our","your","can","at","by","as","on","not","if",
  "it","from","team","role","experience","skills","work","job","position","required",
  "responsibilities","qualifications","candidate","apply","company","salary","benefits",
]);

/**
 * Fast heuristic check — reject obvious gibberish before wasting an AI call.
 * Returns an error string if invalid, null if it might be a real JD.
 */
function quickJdCheck(text: string): string | null {
  const words = text.trim().split(/\s+/);

  if (words.length < 25) {
    return "Paste a complete job description (at least 25 words).";
  }

  // Average word length: real English ~4–7 chars. Random strings skew high or produce 1-char tokens.
  const avgLen = words.reduce((s, w) => s + w.replace(/[^a-zA-Z]/g, "").length, 0) / words.length;
  if (avgLen < 2 || avgLen > 14) {
    return "This doesn't look like a real job description. Please paste an actual JD.";
  }

  // Real text always contains several common function/job words
  const commonHits = words.filter(w => COMMON_WORDS.has(w.toLowerCase().replace(/[^a-z]/g, ""))).length;
  if (commonHits < 4) {
    return "This doesn't look like a real job description. Please paste an actual JD.";
  }

  return null; // passes heuristics — let AI decide
}

// Rate limits: FREE/anon = 5/hour, PRO = 50/hour
const FREE_LIMIT = { max: 5, windowMs: 60 * 60 * 1000 };
const PRO_LIMIT  = { max: 50, windowMs: 60 * 60 * 1000 };

export async function POST(req: Request) {
  const { jdText } = await req.json();
  if (!jdText || jdText.trim().length < 50) {
    return NextResponse.json({ error: "Paste a job description (at least 50 characters)." }, { status: 400 });
  }

  // Fast heuristic — reject obvious gibberish before hitting AI
  const heuristicError = quickJdCheck(jdText);
  if (heuristicError) {
    return NextResponse.json({ error: heuristicError }, { status: 400 });
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

FIRST: Determine if the pasted text is a real job description.
A real JD contains recognizable job requirements, responsibilities, skills, or qualifications — even if brief.
If the text is gibberish, random characters, test input, lorem ipsum, a single word, a company name only, or clearly NOT a job description, you MUST set isValidJd: false. Do NOT score it. Do NOT fall back to a generic baseline. Just flag it invalid.

${candidateContext || `
GENERIC MODE: No candidate profile available. Score based on what a typical service-company engineer (5-8 years experience) would bring to this role. Be realistic — most will score 40-60% for product company roles.`}

JOB DESCRIPTION:
${jdText.slice(0, 3000)}

If isValidJd is false, set readinessScore: 0, topGaps: [], strongMatches: [], topAction: "", timeToReady: "", verdict: "".

If isValidJd is true, score the candidate's readiness. Be brutally honest — most service-company engineers are NOT ready for product roles. Do not soften gaps.

{
  "isValidJd": <true if this is a recognizable job description, false if it's gibberish or test input>,
  "readinessScore": <0-100: subtract from 100 for each critical gap (-15 to -25), major gap (-8 to -12), minor gap (-3 to -5)>,
  "verdict": "<one blunt line — NO encouragement. Examples: 'Your resume will not pass the ATS filter for this role.' / 'You are missing the two skills that screen out 90% of applicants.' / 'You have the raw skills but zero evidence of using them at scale.' / 'Strong match — you can apply this week without changes.'>",
  "topGaps": [
    {
      "label": "<gap name>",
      "severity": "critical|major|minor",
      "impact": "<be specific and direct — name the exact consequence: 'No system design experience means automatic rejection at the technical screen' not 'may need improvement'>",
      "timeToFix": "<realistic hours or weeks — e.g. 'Fixable in ~12–15 hours of deliberate practice' or 'Requires 3–4 weeks of project work' — be honest, not optimistic>"
    }
  ],
  "strongMatches": ["<specific skill or experience that matches the JD — 2-4 items>"],
  "topAction": "<single most impactful thing to do right now — specific and direct. Not 'learn system design'. Say 'Build one end-to-end project using microservices and deploy it — without this you will fail the tech screen.'>",
  "timeToReady": "<realistic — don't be kind. '6-8 weeks of deliberate practice' not '2-3 weeks'>",
}

topGaps: maximum 3, ordered by impact on THIS specific JD.
Do not use words like "consider", "may", "could benefit from". State facts.
Return ONLY valid JSON.`;

  const { object } = await generateObject({
    model: defaultModel,
    schema: ScoreSchema,
    prompt,
  });

  // AI flagged the input as not a real JD — don't cache, return error
  if (!object.isValidJd) {
    return NextResponse.json(
      { error: "This doesn't look like a real job description. Paste an actual JD to get your readiness score." },
      { status: 400 }
    );
  }

  // Cache result (excluding the internal isValidJd flag)
  const { isValidJd: _valid, ...scorePayload } = object;
  setCachedScore(jdHash, scorePayload);

  return NextResponse.json(scorePayload);
}
