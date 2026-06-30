"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import type { CompanyReadinessResult } from "@/lib/company-readiness";

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  faang:   { bg: "bg-blue-500/10",   text: "text-blue-400"   },
  ai:      { bg: "bg-violet-500/10", text: "text-violet-400" },
  product: { bg: "bg-emerald-500/10",text: "text-emerald-400"},
  fintech: { bg: "bg-amber-500/10",  text: "text-amber-400"  },
};

function scoreBarColor(score: number) {
  if (score >= 65) return "bg-emerald-500";
  if (score >= 45) return "bg-amber-500";
  return "bg-red-500";
}

function CompanyCard({ company }: { company: CompanyReadinessResult }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const tier = TIER_COLORS[company.tier] ?? TIER_COLORS.product;

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`h-8 w-8 rounded-lg ${tier.bg} flex items-center justify-center shrink-0 font-black text-sm ${tier.text}`}>
            {company.logo}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-white text-sm leading-tight">{company.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{company.interviewStyle}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-black tabular-nums text-white">{company.score}<span className="text-xs text-slate-500 font-normal">%</span></p>
          <p className={`text-[10px] font-bold ${company.statusColor}`}>{company.status}</p>
        </div>
      </div>

      {/* Score bar */}
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${scoreBarColor(company.score)}`}
          style={{ width: mounted ? `${company.score}%` : "0%" }}
        />
      </div>

      {/* Blocking gaps */}
      {company.blockingDimensions.length > 0 && (
        <p className="text-[10px] text-slate-600">
          Blocking: {company.blockingDimensions.join(", ")}
        </p>
      )}
    </div>
  );
}

interface Props {
  companies: CompanyReadinessResult[];
  hasScores: boolean;
}

export function CompanyReadiness({ companies, hasScores }: Props) {
  if (!hasScores || companies.length === 0) return null;

  const ready   = companies.filter(c => c.score >= 65).length;
  const topScore = companies[0]?.score ?? 0;

  return (
    <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
            <Building2 className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Company Readiness</p>
            <p className="text-sm text-slate-500 mt-0.5">How competitive you are right now</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-emerald-400 font-bold">{ready} ready</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">top score {topScore}%</span>
        </div>
      </div>

      {/* Company grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {companies.map((c) => (
          <CompanyCard key={c.name} company={c} />
        ))}
      </div>
    </div>
  );
}
