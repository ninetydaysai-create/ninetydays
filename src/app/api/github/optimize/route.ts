import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syncUser } from "@/lib/sync-user";
import { fastModel } from "@/lib/ai";
import { generateText } from "ai";
import { buildGithubReadmePrompt } from "@/prompts/linkedin-optimizer";
import { assertPlanAllows } from "@/lib/plan-guard";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await syncUser(userId);

  const _planGuard = await assertPlanAllows(userId, "github_optimization");
  if (_planGuard) return _planGuard;

  const { currentReadme = "" } = await req.json();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, targetRole: true },
  });

  const { text } = await generateText({
    model: fastModel,
    prompt: buildGithubReadmePrompt(
      currentReadme,
      user?.name ?? "Developer",
      user?.targetRole ?? "product_swe",
      []
    ),
  });

  await db.githubOptimization.create({
    data: {
      userId,
      inputReadme: currentReadme,
      outputReadme: text,
    },
  });

  return NextResponse.json({ outputReadme: text });
}
