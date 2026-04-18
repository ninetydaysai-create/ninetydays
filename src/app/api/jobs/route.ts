import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertPlanAllows } from "@/lib/plan-guard";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";

const JdExtractionSchema = z.object({
  company: z.string(),
  roleTitle: z.string(),
  requiredSkills: z.array(z.string()),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  remote: z.boolean().optional(),
  location: z.string().optional(),
});

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobs = await db.jobApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(jobs);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const _planGuard = await assertPlanAllows(userId, "job_application"); if (_planGuard) return _planGuard;

  const { company, roleTitle, jobUrl, rawJd } = await req.json();

  let extractedData = null;
  let finalCompany = company;
  let finalTitle = roleTitle;

  if (rawJd) {
    try {
      const { object } = await generateObject({
        model: defaultModel,
        schema: JdExtractionSchema,
        prompt: `Extract structured data from this job description:\n\n${rawJd.slice(0, 4000)}`,
      });
      extractedData = object;
      finalCompany = object.company || company;
      finalTitle = object.roleTitle || roleTitle;
    } catch {
      // extraction failed, use manual values
    }
  }

  const job = await db.jobApplication.create({
    data: {
      userId,
      company: finalCompany || "Unknown",
      roleTitle: finalTitle || "Unknown",
      jobUrl,
      rawJd,
      extractedData: extractedData ? JSON.parse(JSON.stringify(extractedData)) : null,
    },
  });

  await db.activityLog.create({
    data: {
      userId,
      type: "job_saved",
      metadata: { company: finalCompany, role: finalTitle },
    },
  });

  return NextResponse.json(job);
}
