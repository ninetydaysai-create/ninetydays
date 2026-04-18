import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { ResumeAnalysisResult } from "@/types/resume";
import { assertPlanAllows } from "@/lib/plan-guard";

const CoverLetterSchema = z.object({
  coverLetter: z.string(),
  highlights: z.array(z.string()),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const _planGuard = await assertPlanAllows(userId, "cover_letter");
  if (_planGuard) return _planGuard;

  const { jdText, tone } = await req.json();

  if (!jdText || jdText.trim().length < 50) {
    return NextResponse.json(
      { error: "Please paste a job description (at least 50 characters)" },
      { status: 400 }
    );
  }

  const [resume, latestAnalysis] = await Promise.all([
    db.resume.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, rawText: true },
    }),
    db.resumeAnalysis.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { rawAnalysis: true },
    }),
  ]);

  if (!resume) {
    return NextResponse.json(
      { error: "No resume found. Please upload your resume first." },
      { status: 400 }
    );
  }

  // Build signal depth context to prevent overselling
  const rawAnalysis = latestAnalysis?.rawAnalysis as unknown as ResumeAnalysisResult | null;
  const signalDepthMap = rawAnalysis?.signalDepthMap;
  const skillsWithEvidence = rawAnalysis?.skillsFound ?? [];

  const signalContext = signalDepthMap && Object.keys(signalDepthMap).length > 0
    ? `\nCANDIDATE SIGNAL DEPTH (use this to ensure accuracy — do NOT claim WEAK skills as strengths):
${Object.entries(signalDepthMap)
  .map(([skill, depth]) => `  ${skill}: ${depth}`)
  .join("\n")}

Skills with real project evidence: ${skillsWithEvidence.join(", ") || "see resume"}
STRONG skills = can be featured prominently with specific claims
MODERATE skills = mention with context, do not oversell
WEAK skills = do not feature as primary strengths; use forward-looking framing if needed
`
    : "";

  const prompt = `You are a professional cover letter writer who helps engineers land roles at product companies.
Write a cover letter for this candidate based on their resume and the job description.

RESUME:
${resume.rawText}

JOB DESCRIPTION:
${jdText}

TONE: ${tone}
${signalContext}
Rules:
- Exactly 3 paragraphs, 250–350 words total
- First paragraph: open with a hook that immediately signals fit — reference the company or a specific thing from the JD. Do NOT open with "I am writing to apply" or any variant.
- Second paragraph: provide SPECIFIC evidence from the resume that directly matches the role. Use the strongest STRONG/MODERATE signals from the signal depth map above. Name actual projects, technologies, and metrics. Do NOT reference WEAK signals as primary competencies.
- Third paragraph: close confidently with a clear next step. One specific sentence about what you'd bring in the first 90 days.
- Tone: "formal" = precise and polished, "confident" = direct and assured, "story" = narrative-driven with a personal angle
- Do NOT use "I believe I would be a great fit" or similar generic phrases
- Do NOT address it "To Whom It May Concern" — use "Dear Hiring Team" if no name is available
- If the signal depth map shows ABSENT skills that the JD requires, do not claim them. Use "I am rapidly developing X" framing at most.

Also return an array of exactly 3 short strings (highlights) describing the key things the letter emphasizes — these will be shown as bullet points to the candidate.`;

  let object;
  try {
    const result = await generateObject({
      model: defaultModel,
      schema: CoverLetterSchema,
      prompt,
    });
    object = result.object;
  } catch (err) {
    console.error("[cover-letter] generateObject error:", err);
    return NextResponse.json(
      { error: "AI generation failed — please try again in a moment." },
      { status: 500 }
    );
  }

  // Track usage for plan guard (no dedicated CoverLetter model — use ActivityLog)
  await db.activityLog.create({
    data: { userId, type: "cover_letter_generated", metadata: {} },
  });

  return NextResponse.json(object);
}
