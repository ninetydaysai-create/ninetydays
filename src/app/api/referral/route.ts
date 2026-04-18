import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function generateCode(name: string | null, userId: string): string {
  const base = (name ?? "user").toLowerCase().replace(/[^a-z]/g, "").slice(0, 8) || "user";
  const suffix = userId.slice(-4).toLowerCase();
  return `${base}-${suffix}`;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let user = await db.user.findUnique({
    where: { id: userId },
    select: { referralCode: true, referralCount: true, name: true, plan: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Generate referral code if not set yet
  if (!user.referralCode) {
    const code = generateCode(user.name, userId);
    user = await db.user.update({
      where: { id: userId },
      data: { referralCode: code },
      select: { referralCode: true, referralCount: true, name: true, plan: true },
    });
  }

  return NextResponse.json({
    referralCode: user!.referralCode,
    referralCount: user!.referralCount,
    referralUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up?ref=${user!.referralCode}`,
  });
}
