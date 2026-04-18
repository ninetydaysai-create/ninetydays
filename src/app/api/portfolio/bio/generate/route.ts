import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { fastModel } from "@/lib/ai";
import { generateText } from "ai";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      targetRole: true,
      currentRole: true,
      yearsExperience: true,
    },
  });

  const resume = await db.resumeAnalysis.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { skillsFound: true },
  });

  const skillsStr = resume
    ? (resume.skillsFound as string[]).slice(0, 10).join(", ")
    : "";

  const prompt = `Write a compelling 3-4 sentence developer bio for a portfolio page.

Person: ${user?.name ?? "Developer"}
Current role: ${user?.currentRole ?? "Software Engineer"}
Target role: ${user?.targetRole?.replace(/_/g, " ") ?? "Product SWE"}
Years of experience: ${user?.yearsExperience ?? 5}
Key skills: ${skillsStr || "software engineering, cloud, APIs"}

Rules:
- Write in first person
- Focus on transition narrative: where they're coming from, where they're going
- Sound confident and specific, not generic
- End with what they're building or working toward
- Do NOT use corporate jargon. Sound like a real person.
- Max 80 words

Return only the bio text. No quotes. No label.`;

  const { text } = await generateText({
    model: fastModel,
    prompt,
  });

  return NextResponse.json({ bio: text.trim() });
}
