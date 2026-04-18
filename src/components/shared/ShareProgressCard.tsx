"use client";

import { useState } from "react";
import { Share2, Check, Copy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareProgressCardProps {
  readinessScore: number;
  weeksOnPlatform: number;
  roleLabel: string;
  userName?: string | null;
}

export function ShareProgressCard({ readinessScore, weeksOnPlatform, roleLabel, userName }: ShareProgressCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Simulate a "before" score — approximate based on typical starting point
  const estimatedBefore = Math.max(10, readinessScore - Math.min(weeksOnPlatform * 5, 45));

  const shareText = `I went from ${estimatedBefore}% → ${readinessScore}% ${roleLabel} readiness in ${weeksOnPlatform} week${weeksOnPlatform !== 1 ? "s" : ""} using NinetyDays.ai 🚀\n\n#AICareer #NinetyDays`;

  async function copyText() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
      >
        <Share2 className="h-4 w-4" />
        Share my progress
      </button>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Card preview */}
      <div className="rounded-2xl bg-[#0a0b0f] p-6 shadow-xl max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-5">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm">NinetyDays.ai</span>
        </div>

        {/* Before / After */}
        <div className="flex items-center gap-4 mb-5">
          <div className="text-center">
            <div className="text-4xl font-black text-red-400">{estimatedBefore}%</div>
            <div className="text-slate-500 text-xs mt-1">before</div>
          </div>
          <div className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-emerald-500 transition-all"
                style={{ width: "100%" }}
              />
            </div>
            <span className="text-slate-500 text-xs">{weeksOnPlatform} week{weeksOnPlatform !== 1 ? "s" : ""}</span>
          </div>
          <div className="text-center">
            <div className="text-4xl font-black text-emerald-400">{readinessScore}%</div>
            <div className="text-slate-500 text-xs mt-1">now</div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-white font-semibold text-sm">{userName ? `${userName}'s` : "My"} {roleLabel} readiness</p>
          <p className="text-slate-400 text-xs mt-0.5">Built with AI-guided 90-day roadmap · ninetydays.ai</p>
        </div>
      </div>

      {/* Share text preview */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">LinkedIn / Twitter caption</p>
        <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{shareText}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={copyText} className="gap-2 h-10" variant={copied ? "default" : "outline"}>
          {copied ? <><Check className="h-4 w-4" />Copied!</> : <><Copy className="h-4 w-4" />Copy caption</>}
        </Button>
        <Button
          className="gap-2 h-10"
          variant="outline"
          onClick={() => {
            const params = new URLSearchParams({
              score: String(readinessScore),
              week: String(weeksOnPlatform),
              role: roleLabel,
            });
            window.open(`/api/og/share-card?${params.toString()}`, "_blank", "noopener,noreferrer");
          }}
        >
          <Share2 className="h-4 w-4" />
          View shareable card
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-slate-400 h-10"
          onClick={() => setExpanded(false)}
        >
          Close
        </Button>
      </div>
    </div>
  );
}
