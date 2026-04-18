import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultModel } from "@/lib/ai";
import { generateObject } from "ai";
import { z } from "zod";
import { buildBulletRewritePrompt } from "@/prompts/bullet-rewriter";
import { assertPlanAllows } from "@/lib/plan-guard";

const RewriteSchema = z.object({
  impactScoreBefore: z.number(),
  rewrites: z.array(z.object({
    text: z.string(),
    impactScore: z.number(),
    reasoning: z.string(),
  })),
});

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const _planGuard = await assertPlanAllows(userId, "bullet_rewrite");
  if (_planGuard) return _planGuard;

  const { original, targetRole, jdText } = await req.json();
  if (!original || original.trim().length < 10) {
    return NextResponse.json({ error: "Please paste a resume bullet (at least 10 characters)" }, { status: 400 });
  }

  const prompt = buildBulletRewritePrompt(original.trim(), targetRole, jdText ?? undefined);

  const { object } = await generateObject({
    model: defaultModel,
    schema: RewriteSchema,
    prompt,
  });

  const impactScoreBefore = Math.min(10, Math.max(1, Math.round(object.impactScoreBefore)));
  const bestScore = Math.max(...object.rewrites.map(r => r.impactScore));
  const impactScoreAfter = Math.min(10, Math.max(1, Math.round(bestScore)));

  try {
    await db.bulletRewrite.create({
      data: {
        userId,
        original: original.trim(),
        rewrites: object.rewrites,
        impactScoreBefore,
        impactScoreAfter,
      },
    });
  } catch {
    // Schema may not have been pushed yet — return result anyway
  }

  return NextResponse.json({
    impactScoreBefore,
    impactScoreAfter,
    rewrites: object.rewrites,
  });
}
