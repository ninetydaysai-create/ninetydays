import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assertPlanAllows } from "@/lib/plan-guard";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const _planGuard = await assertPlanAllows(userId, "portfolio_public"); if (_planGuard) return _planGuard;

  const { username, bio, isPublic } = await req.json();

  // Validate username uniqueness
  if (username) {
    const existing = await db.portfolio.findFirst({
      where: { username, userId: { not: userId } },
    });
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
  }

  const portfolio = await db.portfolio.upsert({
    where: { userId },
    create: {
      userId,
      username: username ?? userId.slice(-8),
      bio: bio ?? "",
      isPublic: isPublic ?? true,
    },
    update: {
      ...(username && { username }),
      ...(bio !== undefined && { bio }),
      ...(isPublic !== undefined && { isPublic }),
    },
  });

  return NextResponse.json({ portfolio });
}
