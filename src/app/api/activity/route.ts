import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, metadata } = await req.json();
  if (!type) return NextResponse.json({ error: "type required" }, { status: 400 });

  await db.activityLog.create({ data: { userId, type, metadata: metadata ?? {} } });
  return NextResponse.json({ ok: true });
}
