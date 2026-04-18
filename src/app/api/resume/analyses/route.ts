import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [analyses, resumes] = await Promise.all([
    db.resumeAnalysis.findMany({
      where: { userId },
      include: { resume: { select: { id: true, fileName: true, createdAt: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, fileName: true, fileSize: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({ analyses, resumes });
}
