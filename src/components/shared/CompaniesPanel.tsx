"use client";

import { ExternalLink } from "lucide-react";

interface Company {
  name: string;
  initials: string;
  color: string;
  role: string;
  url: string;
}

const COMPANIES_BY_ROLE: Record<string, Company[]> = {
  ml_engineer: [
    { name: "Google DeepMind", initials: "GD", color: "bg-blue-500/20 text-blue-400", role: "ML Engineer", url: "https://www.linkedin.com/jobs/search/?keywords=machine+learning+engineer&f_TPR=r86400" },
    { name: "Anthropic", initials: "AN", color: "bg-violet-500/20 text-violet-400", role: "ML Engineer", url: "https://www.anthropic.com/careers" },
    { name: "Meta AI", initials: "MA", color: "bg-indigo-500/20 text-indigo-400", role: "ML Engineer", url: "https://www.metacareers.com/jobs?q=machine+learning" },
    { name: "Cohere", initials: "CO", color: "bg-emerald-500/20 text-emerald-400", role: "ML Engineer", url: "https://cohere.com/careers" },
  ],
  ai_engineer: [
    { name: "Anthropic", initials: "AN", color: "bg-violet-500/20 text-violet-400", role: "AI Engineer", url: "https://www.anthropic.com/careers" },
    { name: "OpenAI", initials: "OA", color: "bg-emerald-500/20 text-emerald-400", role: "AI Engineer", url: "https://openai.com/careers" },
    { name: "Cohere", initials: "CO", color: "bg-blue-500/20 text-blue-400", role: "AI Engineer", url: "https://cohere.com/careers" },
    { name: "HuggingFace", initials: "HF", color: "bg-amber-500/20 text-amber-400", role: "AI Engineer", url: "https://apply.workable.com/huggingface/" },
  ],
  product_swe: [
    { name: "Stripe", initials: "ST", color: "bg-indigo-500/20 text-indigo-400", role: "Software Engineer", url: "https://stripe.com/jobs/search?q=software+engineer" },
    { name: "Notion", initials: "NO", color: "bg-slate-500/20 text-slate-300", role: "Software Engineer", url: "https://www.notion.so/careers" },
    { name: "Linear", initials: "LN", color: "bg-violet-500/20 text-violet-400", role: "Software Engineer", url: "https://linear.app/careers" },
    { name: "Figma", initials: "FG", color: "bg-rose-500/20 text-rose-400", role: "Software Engineer", url: "https://www.figma.com/careers/" },
  ],
  backend_swe: [
    { name: "Stripe", initials: "ST", color: "bg-indigo-500/20 text-indigo-400", role: "Backend Engineer", url: "https://stripe.com/jobs/search?q=backend" },
    { name: "Cloudflare", initials: "CF", color: "bg-amber-500/20 text-amber-400", role: "Backend Engineer", url: "https://www.cloudflare.com/careers/jobs/?q=backend" },
    { name: "PlanetScale", initials: "PS", color: "bg-emerald-500/20 text-emerald-400", role: "Backend Engineer", url: "https://planetscale.com/careers" },
    { name: "Vercel", initials: "VC", color: "bg-slate-500/20 text-slate-300", role: "Backend Engineer", url: "https://vercel.com/careers" },
  ],
  fullstack_swe: [
    { name: "Vercel", initials: "VC", color: "bg-slate-500/20 text-slate-300", role: "Fullstack Engineer", url: "https://vercel.com/careers" },
    { name: "Linear", initials: "LN", color: "bg-violet-500/20 text-violet-400", role: "Fullstack Engineer", url: "https://linear.app/careers" },
    { name: "Loom", initials: "LO", color: "bg-rose-500/20 text-rose-400", role: "Fullstack Engineer", url: "https://www.loom.com/careers" },
    { name: "Retool", initials: "RT", color: "bg-blue-500/20 text-blue-400", role: "Fullstack Engineer", url: "https://retool.com/careers" },
  ],
  data_engineer: [
    { name: "Databricks", initials: "DB", color: "bg-red-500/20 text-red-400", role: "Data Engineer", url: "https://www.databricks.com/company/careers/open-positions?department=Engineering" },
    { name: "Snowflake", initials: "SF", color: "bg-blue-500/20 text-blue-400", role: "Data Engineer", url: "https://careers.snowflake.com/us/en/search-results?keywords=data+engineer" },
    { name: "dbt Labs", initials: "DL", color: "bg-amber-500/20 text-amber-400", role: "Data Engineer", url: "https://www.getdbt.com/dbt-labs/open-roles" },
    { name: "Airbyte", initials: "AB", color: "bg-emerald-500/20 text-emerald-400", role: "Data Engineer", url: "https://airbyte.com/careers" },
  ],
};

const FALLBACK = COMPANIES_BY_ROLE.product_swe;

interface Props {
  targetRole?: string | null;
  roleLabel?: string;
}

export function CompaniesPanel({ targetRole, roleLabel }: Props) {
  const companies = (targetRole && COMPANIES_BY_ROLE[targetRole]) ? COMPANIES_BY_ROLE[targetRole] : FALLBACK;
  const label = roleLabel ?? "your target role";

  return (
    <div className="bg-[#161820] rounded-2xl border border-white/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-bold text-white">Companies hiring {label}</p>
          <p className="text-xs text-slate-500 mt-0.5">Open roles right now</p>
        </div>
        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>
      <div className="space-y-2">
        {companies.map((c) => (
          <a
            key={c.name}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all group"
          >
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${c.color}`}>
              {c.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">{c.name}</p>
              <p className="text-xs text-slate-500">{c.role}</p>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
          </a>
        ))}
      </div>
      <p className="text-xs text-slate-600 mt-3 text-center">
        Apply when readiness ≥ 70% for best results
      </p>
    </div>
  );
}
