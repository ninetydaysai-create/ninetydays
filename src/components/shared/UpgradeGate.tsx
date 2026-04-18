"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, CheckCircle2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Feature-specific unlock copy — what each gate unlocks that matters
const FEATURE_UNLOCKS: Record<string, { bullets: string[]; nudge: string }> = {
  "Full 12-week roadmap": {
    bullets: ["Weeks 5–12 unlocked (the interview sprint phase)", "Priority task ordering by impact score", "Deliverable tracking per week"],
    nudge: "Most users reach 70%+ readiness in week 8 when they follow this.",
  },
  "AI Mentor": {
    bullets: ["Daily personalized advice on your exact gaps", "Ask anything — career, tech, or prep strategy", "Remembers your context across every session"],
    nudge: "Engineers who use the mentor daily prep 2× faster.",
  },
  "Mock interviews": {
    bullets: ["Unlimited sessions across behavioral, system design, coding", "Scored feedback on every answer", "Cross-referenced against your actual resume gaps"],
    nudge: "Average user goes from 3/10 → 7/10 response quality in 2 weeks.",
  },
  "LinkedIn optimizer": {
    bullets: ["Headline and summary rewrite using your signal depth", "Keyword gap analysis vs top hiring managers' searches", "3 alternative headline variants"],
    nudge: "Strong LinkedIn = inbound recruiter messages while you prep.",
  },
  "Public portfolio": {
    bullets: ["Shareable link with your projects and skills", "Auto-synced from your GitHub via our scanner", "AI-written bio tailored to your target role"],
    nudge: "Portfolios with project evidence get 40% more recruiter views.",
  },
  "Bullet rewriter": {
    bullets: ["3 rewrite angles: conservative, impact-first, ownership-first", "Before/after impact score so you know which is stronger", "JD-aware — rewrites target the specific role"],
    nudge: "Weak bullets are the #1 reason strong candidates get screened out.",
  },
  "Cover letter": {
    bullets: ["Calibrated to your actual signal depth — no overselling", "3-paragraph structure tested on real hiring managers", "Personalized to each job's specific requirements"],
    nudge: "A calibrated cover letter outperforms a generic one 3:1.",
  },
};

const DEFAULT_UNLOCKS = {
  bullets: ["Full access to this feature", "Tailored to your resume and gaps", "Integrated with your 90-day plan"],
  nudge: "Pro users reach interview-ready status 2× faster.",
};

interface UpgradeGateProps {
  feature: string;
  description?: string;
  className?: string;
  inline?: boolean;
}

export function UpgradeGate({ feature, description, className, inline = false }: UpgradeGateProps) {
  const { bullets, nudge } = FEATURE_UNLOCKS[feature] ?? DEFAULT_UNLOCKS;

  if (inline) {
    return (
      <div className={cn(
        "rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4",
        className
      )}>
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{feature} is a Pro feature</p>
            {description
              ? <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
              : <p className="text-xs text-muted-foreground mt-0.5">{bullets[0]}</p>
            }
          </div>
          <Link href="/settings" className="shrink-0">
            <Button size="sm" className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white">
              <Sparkles className="h-3.5 w-3.5" />
              Unlock
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 to-transparent p-8 flex flex-col items-center text-center gap-6",
      className
    )}>
      {/* Icon */}
      <div className="h-14 w-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
        <Lock className="h-6 w-6 text-indigo-400" />
      </div>

      {/* Headline */}
      <div>
        <p className="text-lg font-bold text-foreground">{feature}</p>
        <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
          {description ?? `Unlock this to close your gaps faster.`}
        </p>
      </div>

      {/* What you unlock */}
      <div className="w-full max-w-xs text-left space-y-2">
        {bullets.map((b) => (
          <div key={b} className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <span className="text-sm text-muted-foreground">{b}</span>
          </div>
        ))}
      </div>

      {/* Nudge stat */}
      <div className="flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-3 py-1.5">
        <TrendingUp className="h-3 w-3" />
        {nudge}
      </div>

      {/* CTA */}
      <div className="w-full max-w-xs space-y-2">
        <Link href="/settings" className="block">
          <Button className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
            <Sparkles className="h-4 w-4" />
            Unlock with Pro — $9/mo
          </Button>
        </Link>
        <p className="text-xs text-muted-foreground">Cancel anytime · Instant access</p>
      </div>
    </div>
  );
}
