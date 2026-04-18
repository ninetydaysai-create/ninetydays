import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { assertPlanAllows } from "@/lib/plan-guard";
import { ResumeAnalysisResult } from "@/types/resume";

const OutreachSchema = z.object({
  subject: z.string(),
  emails: z.array(
    z.object({
      variant: z.string(),
      content: z.string(),
    })
  ),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const guard = await assertPlanAllows(userId, "outreach");
  if (guard) return guard;

  const { jdText, recruiterName, tone } = await req.json();

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

  // Build signal depth context to anchor claims in real evidence
  const rawAnalysis = latestAnalysis?.rawAnalysis as unknown as ResumeAnalysisResult | null;
  const signalDepthMap = rawAnalysis?.signalDepthMap;
  const skillsWithEvidence = rawAnalysis?.skillsFound ?? [];

  const strongSkills = signalDepthMap
    ? Object.entries(signalDepthMap)
        .filter(([, depth]) => depth === "STRONG")
        .map(([skill]) => skill)
    : skillsWithEvidence.slice(0, 5);

  const signalContext = strongSkills.length > 0
    ? `\nCANDIDATE'S STRONGEST SIGNALS (use 1-2 of these as the hook — they have real project evidence):\n${strongSkills.join(", ")}\n`
    : "";

  const recruiterLine = recruiterName
    ? `The recruiter/hiring manager's name is ${recruiterName} — address them by name.`
    : "No recruiter name was provided — use a professional generic greeting.";

  const prompt = `You are helping an engineer write a cold outreach email to a recruiter/hiring manager at a product company.
The email must feel human, specific, and confident — not templated or desperate.

RESUME:
${resume.rawText}

JOB DESCRIPTION:
${jdText}

TONE PREFERENCE: ${tone}
${recruiterLine}
${signalContext}
Write 3 email variants with variant labels: "Professional", "Warm", "Direct".

Rules:
- 150–200 words max per email
- Open with something specific to the company or role — not "I am very interested in this position"
- Reference 1–2 concrete things from the candidate's actual work history (use the strong signals listed above)
- Frame the connection between their experience and what the JD requires
- End with a specific, low-friction ask: "Would you be open to a 15-minute call next week?"
- Subject line must be specific to the role/company — NOT generic like "Exploring Opportunities"
- If recruiter name was provided, use it in all three variants

Return one shared subject line that works for all three variants, and three email variants.`;

  let object;
  try {
    const result = await generateObject({
      model: defaultModel,
      schema: OutreachSchema,
      prompt,
    });
    object = result.object;
  } catch (err) {
    console.error("[outreach] generateObject error:", err);
    return NextResponse.json(
      { error: "AI generation failed — please try again in a moment." },
      { status: 500 }
    );
  }

  return NextResponse.json(object);
}
