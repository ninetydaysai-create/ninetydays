import { resend, FROM_EMAIL } from "@/lib/resend";
import { db } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/constants";
import { TargetRole } from "@prisma/client";

export async function triggerReadyToApplyEmail(userId: string): Promise<void> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_") return;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true, targetRole: true },
  });
  if (!user) return;

  const roleLabel = ROLE_LABELS[user.targetRole as TargetRole] ?? "your target role";
  const firstName = user.name?.split(" ")[0] ?? "there";

  await resend.emails.send({
    from: FROM_EMAIL,
    to: user.email,
    subject: `You're interview-ready for ${roleLabel} roles 🎉`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #fff;">
        <div style="margin-bottom: 32px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #7c3aed); border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
            <span style="color: white; font-size: 20px;">⚡</span>
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 8px;">You're interview-ready, ${firstName}!</h1>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0;">Your readiness score just crossed 70% — the threshold where candidates start getting interviews at product companies.</p>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="color: #15803d; font-weight: 700; font-size: 15px; margin: 0 0 8px;">What this means:</p>
          <ul style="color: #166534; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>You're competitive for ${roleLabel} roles at product companies</li>
            <li>Your resume will pass initial screening at most companies</li>
            <li>Your gap-to-interview ratio is now in your favor</li>
          </ul>
        </div>

        <div style="margin-bottom: 24px;">
          <p style="color: #374151; font-size: 15px; font-weight: 600; margin: 0 0 12px;">Recommended next steps:</p>
          <ol style="color: #4b5563; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
            <li>Start applying — aim for 5 applications this week</li>
            <li>Run 3 mock interviews to warm up your answers</li>
            <li>Use Job Match Score on every JD before applying</li>
          </ol>
        </div>

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs" style="display: inline-block; background: #4f46e5; color: white; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin-bottom: 32px;">
          Start tracking your applications →
        </a>

        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
          NinetyDays.ai · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #94a3b8;">ninetydays.ai</a>
        </p>
      </div>
    `,
  });
}

export async function triggerWelcomeEmail(userId: string): Promise<void> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_") return;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
  if (!user) return;

  const firstName = user.name?.split(" ")[0] ?? "there";

  await resend.emails.send({
    from: FROM_EMAIL,
    to: user.email,
    subject: "Welcome to NinetyDays — your 90-day AI career plan starts now",
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #fff;">
        <div style="margin-bottom: 32px;">
          <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #7c3aed); border-radius: 10px; margin-bottom: 16px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 20px;">⚡</span>
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 8px;">Welcome, ${firstName}!</h1>
          <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin: 0;">You've joined NinetyDays — the system that tells you exactly how far you are from getting a product company or AI role, and fixes it.</p>
        </div>

        <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="color: #4338ca; font-weight: 700; font-size: 15px; margin: 0 0 12px;">Your 3-step start:</p>
          <ol style="color: #3730a3; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
            <li>Upload your resume → get your readiness score (2 min)</li>
            <li>Read your gap report → see exactly what's blocking you</li>
            <li>Generate your 90-day roadmap → start week 1 today</li>
          </ol>
        </div>

        <a href="${process.env.NEXT_PUBLIC_APP_URL}/resume" style="display: inline-block; background: #4f46e5; color: white; font-weight: 700; font-size: 15px; padding: 14px 28px; border-radius: 10px; text-decoration: none; margin-bottom: 32px;">
          Upload your resume now →
        </a>

        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
          NinetyDays.ai · <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #94a3b8;">ninetydays.ai</a>
        </p>
      </div>
    `,
  });
}
