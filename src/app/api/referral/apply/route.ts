import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { referralCode } = await req.json();
  if (!referralCode) return NextResponse.json({ error: "No code" }, { status: 400 });

  // Find referrer
  const referrer = await db.user.findUnique({
    where: { referralCode },
    select: { id: true },
  });
  if (!referrer || referrer.id === userId) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  // Check not already referred
  const me = await db.user.findUnique({ where: { id: userId }, select: { referredBy: true } });
  if (me?.referredBy) return NextResponse.json({ message: "Already applied" }, { status: 400 });

  // Apply referral
  await db.user.update({ where: { id: userId }, data: { referredBy: referrer.id } });
  await db.user.update({ where: { id: referrer.id }, data: { referralCount: { increment: 1 } } });

  return NextResponse.json({ success: true });
}
