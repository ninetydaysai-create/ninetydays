import { Plan } from "@prisma/client";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PLAN_LIMITS } from "@/lib/constants";

type PlanFeature =
  | "resume_analysis"
  | "interview_session"
  | "roadmap_full"
  | "roadmap_generation"
  | "job_application"
  | "portfolio_public"
  | "outreach"
  | "bullet_rewrite"
  | "linkedin_optimization"
  | "cover_letter";

interface PlanGuardResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
}

export async function checkPlanLimit(
  userId: string,
  feature: PlanFeature
): Promise<PlanGuardResult> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  if (!user) return { allowed: false, reason: "User not found" };

  const plan = user.plan;
  const limits = PLAN_LIMITS[plan];

  // Shared helper: start-of-current-month date
  function startOfMonth(): Date {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  switch (feature) {
    case "resume_analysis": {
      const count = await db.resumeAnalysis.count({ where: { userId } });
      if (count >= limits.resumeAnalyses) {
        return {
          allowed: false,
          reason: `${plan === Plan.PRO ? "Pro" : "Free"} plan allows ${limits.resumeAnalyses} resume analyses. ${plan === Plan.FREE ? "Upgrade to Pro for more." : "Contact support if you need more."}`,
          upgradeRequired: plan === Plan.FREE,
        };
      }
      return { allowed: true };
    }

    case "interview_session": {
      const count = await db.interviewSession.count({
        where: { userId, startedAt: { gte: startOfMonth() } },
      });
      if (count >= limits.interviewSessionsPerMonth) {
        return {
          allowed: false,
          reason: `${plan === Plan.PRO ? "Pro" : "Free"} plan allows ${limits.interviewSessionsPerMonth} interview sessions/month. ${plan === Plan.FREE ? "Upgrade to Pro for more." : "Resets next month."}`,
          upgradeRequired: plan === Plan.FREE,
        };
      }
      return { allowed: true };
    }

    case "bullet_rewrite": {
      const count = await db.bulletRewrite.count({
        where: { userId, createdAt: { gte: startOfMonth() } },
      });
      if (count >= limits.bulletRewritesPerMonth) {
        return {
          allowed: false,
          reason: `${plan === Plan.PRO ? "Pro" : "Free"} plan allows ${limits.bulletRewritesPerMonth} bullet rewrites/month. ${plan === Plan.FREE ? "Upgrade to Pro for more." : "Resets next month."}`,
          upgradeRequired: plan === Plan.FREE,
        };
      }
      return { allowed: true };
    }

    case "linkedin_optimization": {
      const count = await db.linkedinOptimization.count({
        where: { userId, createdAt: { gte: startOfMonth() } },
      });
      if (count >= limits.linkedinOptimizationsPerMonth) {
        return {
          allowed: false,
          reason: `${plan === Plan.PRO ? "Pro" : "Free"} plan allows ${limits.linkedinOptimizationsPerMonth} LinkedIn optimization${limits.linkedinOptimizationsPerMonth === 1 ? "" : "s"}/month. ${plan === Plan.FREE ? "Upgrade to Pro for more." : "Resets next month."}`,
          upgradeRequired: plan === Plan.FREE,
        };
      }
      return { allowed: true };
    }

    case "cover_letter": {
      // Tracked via ActivityLog (no dedicated CoverLetter model)
      const count = await db.activityLog.count({
        where: { userId, type: "cover_letter_generated", createdAt: { gte: startOfMonth() } },
      });
      if (count >= limits.coverLettersPerMonth) {
        return {
          allowed: false,
          reason: `${plan === Plan.PRO ? "Pro" : "Free"} plan allows ${limits.coverLettersPerMonth} cover letters/month. ${plan === Plan.FREE ? "Upgrade to Pro for more." : "Resets next month."}`,
          upgradeRequired: plan === Plan.FREE,
        };
      }
      return { allowed: true };
    }

    case "roadmap_generation": {
      // Tracked via ActivityLog (lifetime total, not monthly — roadmap is a strategic tool)
      const count = await db.activityLog.count({
        where: { userId, type: "roadmap_generated" },
      });
      if (count >= limits.roadmapGenerations) {
        return {
          allowed: false,
          reason: `${plan === Plan.PRO ? "Pro" : "Free"} plan allows ${limits.roadmapGenerations} roadmap generation${limits.roadmapGenerations === 1 ? "" : "s"}. ${plan === Plan.FREE ? "Upgrade to Pro for more." : "Contact support if you need to regenerate."}`,
          upgradeRequired: plan === Plan.FREE,
        };
      }
      return { allowed: true };
    }

    case "job_application": {
      const count = await db.jobApplication.count({ where: { userId } });
      if (count >= limits.jobApplications) {
        return {
          allowed: false,
          reason: `${plan === Plan.PRO ? "Pro" : "Free"} plan allows ${limits.jobApplications} job applications. ${plan === Plan.FREE ? "Upgrade to Pro for more." : "Contact support."}`,
          upgradeRequired: plan === Plan.FREE,
        };
      }
      return { allowed: true };
    }

    case "portfolio_public": {
      if (plan === Plan.PRO) return { allowed: true };
      return {
        allowed: false,
        reason: "Public portfolio is a Pro feature. Upgrade to share your portfolio link.",
        upgradeRequired: true,
      };
    }

    case "roadmap_full": {
      if (plan === Plan.PRO) return { allowed: true };
      return {
        allowed: false,
        reason: "Free plan shows the first 4 weeks. Upgrade to Pro for the full 12-week roadmap.",
        upgradeRequired: true,
      };
    }

    case "outreach": {
      if (plan === Plan.PRO) return { allowed: true };
      return {
        allowed: false,
        reason: "Cold Outreach Generator is a Pro feature. Upgrade to generate personalized recruiter emails.",
        upgradeRequired: true,
      };
    }

    default:
      return { allowed: true };
  }
}

// Returns a 403 NextResponse if not allowed, null if allowed — use in API routes
export async function assertPlanAllows(
  userId: string,
  feature: PlanFeature
): Promise<NextResponse | null> {
  const result = await checkPlanLimit(userId, feature);
  if (!result.allowed) {
    return NextResponse.json(
      { error: result.reason, upgradeRequired: result.upgradeRequired },
      { status: 403 }
    );
  }
  return null;
}
