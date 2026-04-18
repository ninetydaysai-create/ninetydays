import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";

const PostsSchema = z.object({
  posts: z.array(
    z.object({
      variant: z.string(),
      content: z.string(),
      hashtags: z.array(z.string()),
    })
  ),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { event, context, tone } = body as {
    event: string;
    context: string;
    tone: "motivational" | "technical" | "story";
  };

  if (!event) {
    return NextResponse.json({ error: "event is required" }, { status: 400 });
  }

  const prompt = `You are a LinkedIn content strategist helping tech professionals share career wins authentically.

Generate 3 LinkedIn post variants for the following milestone:

Event: ${event}
Additional context: ${context || "None provided"}
Preferred tone: ${tone}

Requirements for each post:
- 150–250 words
- Written in first person
- Natural LinkedIn voice — no cringe, no excessive emojis (max 1–2 if truly appropriate)
- Specific and concrete, not generic motivational filler
- Avoid clichés like "excited to announce", "humbled", "thrilled to share"
- If it fits naturally, mention NinetyDays readiness score or the 90-day career roadmap — but only if it adds context, don't force it
- Each variant must have a distinct angle:
  Variant 1 — Motivational: focus on the mindset shift or journey
  Variant 2 — Technical: focus on the skills learned or the technical challenge
  Variant 3 — Story-driven: tell a brief story with a beginning, conflict, and takeaway
- End each post with 3–5 relevant hashtags (no # symbol in the hashtags array, just the word)

Return exactly 3 posts with variant labels "Motivational", "Technical", and "Story-driven".`;

  const { object } = await generateObject({
    model: defaultModel,
    schema: PostsSchema,
    prompt,
  });

  return NextResponse.json(object);
}
