"use client";

import { useState } from "react";
import { X, Share2, MessageSquare, Briefcase, Copy, CheckCircle2, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Gap {
  label: string;
  severity: "critical" | "major" | "minor";
}

interface ScoreShareCardProps {
  score: number;
  verdict: string;
  topGaps: Gap[];
  onClose: () => void;
}

function buildCopy(variant: "twitter" | "linkedin" | "roast", score: number, verdict: string, gaps: Gap[]) {
  const gapLines = gaps
    .slice(0, 3)
    .map((g) => `• ${g.label} (${g.severity})`)
    .join("\n");
  const rejectionPct = 100 - score;

  if (variant === "roast") {
    return `I just got roasted by an AI 🔥\n\n${rejectionPct}% of product companies will reject me.\n\nGaps that are killing me:\n${gapLines}\n\nApparently I need ${score < 40 ? "a lot of work" : score < 60 ? "a few months" : "a few tweaks"} before I'm ready.\n\nCheck how badly YOUR resume gets roasted → ninetydays.ai/score`;
  }

  if (variant === "twitter") {
    return `Just scored my resume on NinetyDays.ai 👇\n\nReadiness score: ${score}/100\n\n${verdict}\n\nGaps holding me back:\n${gapLines}\n\n90-day fix plan available.\n\nCheck yours free → ninetydays.ai/score`;
  }

  return `I ran my resume through an AI readiness check for product company roles.\n\nScore: ${score}/100 — ${verdict}\n\nKey gaps I'm working on:\n${gapLines}\n\nIf you're targeting product companies and not sure where you stand, worth trying — it's free.\n\nninetydays.ai/score`;
}

export function ScoreShareCard({ score, verdict, topGaps, onClose }: ScoreShareCardProps) {
  const [tab, setTab] = useState<"twitter" | "linkedin" | "roast">("roast");
  const [copied, setCopied] = useState(false);

  const rejectionPct = 100 - score;
  const isRoast = tab === "roast";

  const scoreColor =
    score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";

  const cardGradient =
    isRoast
      ? "from-red-950/80 via-[#0d1018] to-[#0d1018] border-red-500/40"
      : score >= 70
      ? "from-emerald-950/80 via-[#0d1018] to-[#0d1018] border-emerald-500/30"
      : score >= 50
      ? "from-amber-950/60 via-[#0d1018] to-[#0d1018] border-amber-500/30"
      : "from-red-950/70 via-[#0d1018] to-[#0d1018] border-red-500/30";

  const scoreBorder =
    isRoast ? "border-red-500" : score >= 70 ? "border-emerald-500" : score >= 50 ? "border-amber-400" : "border-red-500";

  const accentColor =
    score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";

  const copyText = buildCopy(tab, score, verdict, topGaps);

  function handleCopy() {
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleNativeShare() {
    if (navigator.share) {
      navigator
        .share({
          title: `My job readiness score: ${score}/100`,
          text: copyText,
          url: "https://ninetydays.ai/score",
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#0d1018] rounded-2xl border border-white/10 overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <p className="text-white font-semibold text-sm">{isRoast ? "Share your roast 🔥" : "Share your score"}</p>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Visual share card — designed to be screenshot-worthy */}
        <div className={cn(
          "mx-5 mt-5 rounded-2xl border bg-gradient-to-b p-6",
          cardGradient
        )}>
          {/* Watermark */}
          <div className="flex items-center gap-1.5 mb-5">
            <div className="h-5 w-5 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-bold text-slate-500">NinetyDays.ai</span>
          </div>

          {/* Big score */}
          <div className="text-center mb-5">
            {isRoast ? (
              <>
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full border-4 border-red-500 mb-3 bg-red-950/30">
                  <span className="text-4xl font-black tabular-nums text-red-400">{rejectionPct}%</span>
                </div>
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest">
                  Rejection Rate
                </p>
                <p className="text-slate-300 text-sm mt-1 font-medium">
                  {rejectionPct}% of product companies will reject this resume
                </p>
                <p className="text-red-300 text-xs font-bold mt-1.5 tracking-wide">Brutal. But fixable.</p>
              </>
            ) : (
              <>
                <div className={cn(
                  "inline-flex items-center justify-center h-24 w-24 rounded-full border-4 mb-3",
                  scoreBorder
                )}>
                  <span className={cn("text-4xl font-black tabular-nums", scoreColor)}>{score}</span>
                </div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  Job Readiness Score
                </p>
                <p className="text-slate-300 text-sm mt-1 font-medium">{verdict}</p>
              </>
            )}
          </div>

          {/* Gap bullets */}
          {topGaps.length > 0 && (
            <div className="space-y-2 mb-5">
              {topGaps.slice(0, 3).map((gap) => (
                <div key={gap.label} className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    gap.severity === "critical" ? "bg-red-400" :
                    gap.severity === "major" ? "bg-amber-400" : "bg-slate-400"
                  )} />
                  <span className="text-slate-300 font-medium">{gap.label}</span>
                  <span className={cn(
                    "ml-auto text-xs font-bold",
                    gap.severity === "critical" ? "text-red-400" :
                    gap.severity === "major" ? "text-amber-400" : "text-slate-500"
                  )}>{gap.severity}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA line */}
          <div className={cn("text-xs font-bold text-center pt-3 border-t border-white/5", isRoast ? "text-red-400" : accentColor)}>
            {isRoast ? "Can you do better? → ninetydays.ai/score" : "90-day fix plan available at NinetyDays.ai"}
          </div>
        </div>

        {/* Copy variant tabs */}
        <div className="px-5 mt-4">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTab("roast")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                tab === "roast"
                  ? "bg-red-900/60 text-red-300 border border-red-500/30"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Flame className="h-3 w-3" /> Roast me
            </button>
            <button
              onClick={() => setTab("twitter")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                tab === "twitter"
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <MessageSquare className="h-3 w-3" /> Twitter/X
            </button>
            <button
              onClick={() => setTab("linkedin")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                tab === "linkedin"
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <Briefcase className="h-3 w-3" /> LinkedIn
            </button>
          </div>

          <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3 text-xs text-slate-400 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
            {copyText}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 px-5 py-4">
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className="flex-1 border-white/15 bg-white/5 text-white hover:bg-white/10 gap-1.5"
          >
            {copied ? (
              <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Copied!</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy text</>
            )}
          </Button>
          <Button
            onClick={handleNativeShare}
            size="sm"
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}
