import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const portfolio = await db.portfolio.findUnique({
    where: { userId },
    include: { projects: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ portfolio: portfolio ?? null });
}
