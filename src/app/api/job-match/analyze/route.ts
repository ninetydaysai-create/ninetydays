import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { buildJobMatchPrompt } from "@/prompts/job-match";

const BlockingGapSchema = z.object({
  label: z.string(),
  severity: z.enum(["critical", "major", "minor"]),
  hoursToFix: z.number(),
  action: z.string(),
  signalFound: z.string().optional(),
});

// No .nullable() — Anthropic's JSON Schema subset does not support it.
const JobMatchSchema = z.object({
  matchScore: z.number(),
  roleTitle: z.string(),
  companyName: z.string().optional(),
  strengths: z.array(z.string()),
  blockingGaps: z.array(BlockingGapSchema),
  improvementPlan: z.string().optional(),
  redFlags: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jdText, jdUrl } = await req.json();
  if (!jdText || jdText.trim().length < 50) {
    return NextResponse.json({ error: "Please paste a job description (at least 50 characters)" }, { status: 400 });
  }

  const resume = await db.resume.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, rawText: true },
  });

  if (!resume) {
    return NextResponse.json({ error: "No resume found. Please upload your resume first." }, { status: 400 });
  }

  const prompt = buildJobMatchPrompt(resume.rawText, jdText);

  let object;
  try {
    const result = await generateObject({
      model: defaultModel,
      schema: JobMatchSchema,
      prompt,
    });
    object = result.object;
  } catch (err) {
    console.error("[job-match] generateObject error:", err);
    return NextResponse.json({ error: "AI analysis failed — please try again in a moment." }, { status: 500 });
  }

  const matchScore = Math.min(100, Math.max(0, Math.round(object.matchScore)));

  const saved = await db.jobMatch.create({
    data: {
      userId,
      jdText: jdText.slice(0, 10000),
      jdUrl: jdUrl ?? null,
      companyName: object.companyName ?? null,
      roleTitle: object.roleTitle,
      matchScore,
      strengths: object.strengths,
      blockingGaps: object.blockingGaps, // includes signalFound per gap
      improvementPlan: object.improvementPlan ?? null,
      resumeSnippet: resume.rawText.slice(0, 500),
      // Store redFlags in blockingGaps JSON for now (no schema change needed)
    },
  });

  await db.activityLog.create({
    data: { userId, type: "job_match_analyzed", metadata: { matchScore, roleTitle: object.roleTitle } },
  }).catch(() => {});

  return NextResponse.json({ match: saved });
}
