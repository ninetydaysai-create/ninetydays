import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resend, FROM_EMAIL } from "@/lib/resend";

export async function GET(req: Request) {
  const cronSecret = process.env.VERCEL_CRON_SECRET ?? process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ skipped: "Resend not configured" });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const jobs = await db.jobApplication.findMany({
    where: {
      followUpDate: { gte: today, lt: tomorrow },
      followUpSent: false,
    },
    include: { user: { select: { email: true, name: true } } },
  });

  let sent = 0;
  for (const job of jobs) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: job.user.email,
      subject: `Follow up today: ${job.roleTitle} at ${job.company}`,
      html: `
        <p>Hey ${job.user.name?.split(" ")[0] ?? "there"},</p>
        <p>You set a reminder to follow up on <strong>${job.roleTitle} at ${job.company}</strong> today.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs">View your job tracker →</a></p>
      `,
    });

    await db.jobApplication.update({
      where: { id: job.id },
      data: { followUpSent: true },
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
