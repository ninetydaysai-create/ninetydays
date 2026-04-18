import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { JobStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await params;
  const body = await req.json();

  const job = await db.jobApplication.findUnique({ where: { id: jobId, userId } });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await db.jobApplication.update({
    where: { id: jobId },
    data: {
      status: body.status as JobStatus | undefined,
      notes: body.notes,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
      appliedAt: body.status === "applied" && !job.appliedAt ? new Date() : undefined,
      ...(body.keywordMatchPct !== undefined && { keywordMatchPct: body.keywordMatchPct }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId } = await params;
  await db.jobApplication.deleteMany({ where: { id: jobId, userId } });
  return NextResponse.json({ deleted: true });
}
