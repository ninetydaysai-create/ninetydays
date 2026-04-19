"use client";

import { useState } from "react";
import { Share2, Check, Copy, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ShareTrigger =
  | "week_complete"
  | "interview_scored"
  | "milestone_50"
  | "milestone_70"
  | "day_30"
  | "day_60"
  | "day_90"
  | "default";

interface ShareProgressCardProps {
  readinessScore: number;
  weeksOnPlatform: number;
  roleLabel: string;
  userName?: string | null;
  trigger?: ShareTrigger;
  weekNumber?: number;
  interviewScore?: number;
  onDismiss?: () => void;
  // When true, shows as an inline celebration banner (not a collapsed link)
  expanded?: boolean;
}

function getTriggerHeadline(
  trigger: ShareTrigger,
  opts: { weekNumber?: number; interviewScore?: number; readinessScore: number }
): string {
  switch (trigger) {
    case "week_complete":
      return `Just completed Week ${opts.weekNumber ?? "?"} of my 90-day career plan 🎯`;
    case "interview_scored":
      return `Scored ${opts.interviewScore ?? "?"}/100 in my AI mock interview today 💪`;
    case "milestone_50":
      return `Hit 50% job readiness — I'm halfway there 🚀`;
    case "milestone_70":
      return `Hit ${opts.readinessScore}% readiness — officially in the "apply now" zone 🎉`;
    case "day_30":
      return `30 days into my 90-day career transformation 📈`;
    case "day_60":
      return `60 days in — 2/3 through my career transition plan 🔥`;
    case "day_90":
      return `Completed my 90-day career transformation journey ✅`;
    default:
      return `I'm ${opts.readinessScore}% ready for my next role 🚀`;
  }
}

export function ShareProgressCard({
  readinessScore,
  weeksOnPlatform,
  roleLabel,
  userName,
  trigger = "default",
  weekNumber,
  interviewScore,
  onDismiss,
  expanded: defaultExpanded = false,
}: ShareProgressCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const estimatedBefore = Math.max(10, readinessScore - Math.min(weeksOnPlatform * 5, 45));
  const headline = getTriggerHeadline(trigger, { weekNumber, interviewScore, readinessScore });

  const shareText = `${headline}

${estimatedBefore}% → ${readinessScore}% ${roleLabel} readiness in ${weeksOnPlatform} week${weeksOnPlatform !== 1 ? "s" : ""}

Tracking my career transition with NinetyDays.ai 👇
https://ninetydays.ai

#CareerGrowth #NinetyDays #ProductCompany`;

  async function copyText() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function shareLinkedIn() {
    const url = encodeURIComponent("https://ninetydays.ai");
    const summary = encodeURIComponent(shareText);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${summary}`,
      "_blank",
      "noopener,noreferrer,width=600,height=600"
    );
  }

  function shareTwitter() {
    const text = encodeURIComponent(shareText);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}`,
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        Share my progress
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Milestone headline */}
      {trigger !== "default" && (
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">
              {trigger === "week_complete" ? "Week complete 🎉" :
               trigger === "interview_scored" ? "Session scored ✓" :
               trigger === "milestone_70" ? "Apply zone reached!" :
               trigger === "milestone_50" ? "Halfway milestone!" :
               `Day ${trigger === "day_30" ? 30 : trigger === "day_60" ? 60 : 90} milestone!`}
            </p>
            <p className="font-bold text-white text-base">{headline}</p>
          </div>
          {onDismiss && (
            <button onClick={onDismiss} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 mt-0.5">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Card preview — screenshot-worthy */}
      <div className="rounded-2xl overflow-hidden border border-white/10 max-w-md">
        {/* Card header */}
        <div className="bg-gradient-to-br from-[#1a1f35] to-[#0f1420] px-6 pt-6 pb-4 border-b border-white/8">
          <div className="flex items-center gap-2 mb-5">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm">NinetyDays.ai</span>
            <span className="text-slate-600 text-xs ml-auto">career execution system</span>
          </div>

          {/* Score transformation */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="text-4xl font-black text-slate-500 leading-none">{estimatedBefore}<span className="text-2xl">%</span></div>
              <div className="text-slate-600 text-xs mt-1">started</div>
            </div>
            <div className="flex-1">
              {/* Progress bar */}
              <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-400" style={{ width: "100%" }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-slate-600 text-xs">Week {weeksOnPlatform}</span>
                <span className="text-slate-500 text-xs">90 days</span>
              </div>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-black leading-none ${readinessScore >= 70 ? "text-emerald-400" : readinessScore >= 50 ? "text-amber-400" : "text-indigo-400"}`}>
                {readinessScore}<span className="text-2xl">%</span>
              </div>
              <div className="text-slate-400 text-xs mt-1">now</div>
            </div>
          </div>
        </div>

        {/* Card footer */}
        <div className="bg-[#0f1420] px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">{userName ? `${userName}'s` : "My"} {roleLabel} journey</p>
            <p className="text-slate-500 text-xs mt-0.5">
              {readinessScore >= 70 ? "In the apply zone ✓" :
               readinessScore >= 50 ? "Interview prep phase" :
               "Building momentum"}
            </p>
          </div>
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-lg ${
            readinessScore >= 70 ? "bg-emerald-500/20 text-emerald-400" :
            readinessScore >= 50 ? "bg-amber-500/20 text-amber-400" :
            "bg-indigo-500/20 text-indigo-400"
          }`}>
            {readinessScore >= 70 ? "✓" : readinessScore >= 50 ? "→" : "↑"}
          </div>
        </div>
      </div>

      {/* Share text preview */}
      <div className="bg-white/5 rounded-xl border border-white/8 p-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Caption</p>
        <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{shareText}</p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={shareLinkedIn}
          className="gap-2 h-10 bg-[#0077b5] hover:bg-[#006097] text-white font-semibold text-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          Share on LinkedIn
        </Button>
        <Button
          onClick={shareTwitter}
          className="gap-2 h-10 bg-[#1DA1F2] hover:bg-[#1a91da] text-white font-semibold text-sm"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Post on X
        </Button>
        <Button
          onClick={copyText}
          variant="outline"
          className={`gap-2 h-10 text-sm border-white/15 ${copied ? "text-emerald-400 border-emerald-500/30" : "text-slate-300"}`}
        >
          {copied ? <><Check className="h-4 w-4" />Copied!</> : <><Copy className="h-4 w-4" />Copy text</>}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-500 h-10 hover:text-slate-300"
          onClick={() => { setExpanded(false); onDismiss?.(); }}
        >
          Close
        </Button>
      </div>
    </div>
  );
}

// ── Inline milestone celebration (shown after week completion / interview score) ──
export function MilestoneShareBanner({
  readinessScore,
  weeksOnPlatform,
  roleLabel,
  userName,
  trigger,
  weekNumber,
  interviewScore,
  onDismiss,
}: Omit<ShareProgressCardProps, "expanded">) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const headline = getTriggerHeadline(trigger ?? "default", { weekNumber, interviewScore, readinessScore });

  return (
    <div className="bg-gradient-to-r from-indigo-500/15 to-violet-500/10 border border-indigo-500/25 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">
            {trigger === "week_complete" ? `Week ${weekNumber} Complete 🎉` :
             trigger === "interview_scored" ? "Session Scored ✓" :
             trigger === "milestone_70" ? "Apply Zone Reached! 🎉" :
             trigger === "milestone_50" ? "Halfway Milestone! 🚀" :
             "Progress Milestone!"}
          </p>
          <p className="font-bold text-white">{headline}</p>
        </div>
        <button onClick={handleDismiss} className="text-slate-500 hover:text-slate-300 shrink-0 mt-0.5">
          <X className="h-4 w-4" />
        </button>
      </div>
      <ShareProgressCard
        readinessScore={readinessScore}
        weeksOnPlatform={weeksOnPlatform}
        roleLabel={roleLabel}
        userName={userName}
        trigger={trigger}
        weekNumber={weekNumber}
        interviewScore={interviewScore}
        onDismiss={handleDismiss}
        expanded
      />
    </div>
  );
}
