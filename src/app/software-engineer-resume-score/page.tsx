import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertTriangle, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Software Engineer Resume Score — Free AI Analysis | NinetyDays",
  description:
    "Get your software engineer resume scored instantly. Find out exactly why product companies reject your resume and what to fix. Free, no signup required.",
  openGraph: {
    title: "Software Engineer Resume Score — Free AI Analysis",
    description:
      "Paste your resume and get a score 0–100. See the gaps blocking you at product companies, with specific fixes. Free in 20 seconds.",
  },
};

const whatWeScore = [
  { label: "Technical breadth & depth", desc: "Are you current? Do you have the stack product companies actually run?" },
  { label: "Project impact evidence", desc: "Not just 'built X' — did you ship it? Did it scale? Do you have numbers?" },
  { label: "System design signals", desc: "Have you designed anything at scale? Recruiters look for this even on SWE resumes." },
  { label: "Story quality", desc: "Are your bullets ownership-framed? Do they show decisions, tradeoffs, and outcomes?" },
  { label: "Gap severity", desc: "Which gaps will kill you in the first screen vs the final round?" },
];

const resumeMistakes = [
  "Responsibility bullets instead of impact bullets (\"responsible for\" vs \"reduced latency by 40%\")",
  "Tech stack laundry list with no depth signal",
  "Projects that were tutorial builds, not shipped products",
  "No mention of scale, users, or business context",
  "Generic soft skills (\"strong communicator\", \"team player\")",
  "Education-heavy when experience should lead",
];

export default function SoftwareEngineerResumeScorePage() {
  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      {/* Nav */}
      <header className="border-b border-white/8 sticky top-0 z-50 bg-[#0b0e14]/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-white">NinetyDays</span>
          </Link>
          <Link href="/score">
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold">
              Score my resume free
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="mb-14 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Free Tool</p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-5">
            Software Engineer Resume Score
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-8 max-w-2xl mx-auto">
            Find out instantly if your resume will pass a product company screen — and exactly what&apos;s holding it back. Not generic feedback. The specific gaps that get you rejected.
          </p>
          <Link href="/score">
            <Button className="h-14 px-10 text-lg font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xl shadow-indigo-500/25">
              Score my resume — free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-slate-600 text-sm mt-3">Paste resume · No signup · Score in 20 seconds</p>
        </div>

        {/* Sample score preview */}
        <div className="mb-16 bg-[#0d1018] rounded-2xl border border-white/8 p-7">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5">Example result</p>
          <div className="flex items-end gap-5 mb-5">
            <div>
              <span className="text-7xl font-black text-amber-400 leading-none">47</span>
            </div>
            <div className="mb-2">
              <p className="text-white font-bold text-lg">Borderline — risky to apply</p>
              <p className="text-slate-400 text-sm">Target: Senior SWE at a Series B+ company</p>
            </div>
          </div>
          <div className="bg-white/5 rounded-full h-2 mb-6 overflow-hidden">
            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: "47%" }} />
          </div>
          <div className="space-y-3">
            {[
              { label: "System design case study", sev: "critical", time: "~20h to close" },
              { label: "Production project on GitHub", sev: "critical", time: "~30h to close" },
              { label: "Impact-framed resume bullets", sev: "major", time: "~4h to close" },
            ].map((g) => (
              <div key={g.label} className="flex items-center gap-3 text-sm">
                <span className={`h-2 w-2 rounded-full shrink-0 ${g.sev === "critical" ? "bg-red-500" : "bg-amber-400"}`} />
                <span className="text-slate-300 flex-1">{g.label}</span>
                <span className={`text-xs font-bold ${g.sev === "critical" ? "text-red-400" : "text-amber-400"}`}>{g.sev}</span>
                <span className="text-slate-600 text-xs">{g.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* What we score */}
        <div className="mb-16">
          <h2 className="text-2xl font-black mb-5">What the score measures</h2>
          <div className="space-y-4">
            {whatWeScore.map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/8 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white text-sm">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common resume mistakes */}
        <div className="mb-16">
          <h2 className="text-2xl font-black mb-2">Why most SWE resumes fail</h2>
          <p className="text-slate-400 text-sm mb-6">These are the patterns that get resumes screened out in under 30 seconds.</p>
          <div className="space-y-3">
            {resumeMistakes.map((m) => (
              <div key={m} className="flex items-start gap-3 p-3 bg-red-500/[0.05] border border-red-500/10 rounded-xl text-sm text-slate-300">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                {m}
              </div>
            ))}
          </div>
        </div>

        {/* How scoring works */}
        <div className="mb-16">
          <h2 className="text-2xl font-black mb-5">How the scoring works</h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "Paste your resume", desc: "Plain text is fine. No formatting required. Full resume works best." },
              { step: "02", title: "Add a job description (optional)", desc: "If you add a JD, the score is calibrated to that specific role. Leave it blank for a general product company assessment." },
              { step: "03", title: "Get your score + gap report", desc: "Score 0–100, verdict, top gaps with severity and time-to-fix, strongest existing matches." },
              { step: "04", title: "See exactly what to fix", desc: "Sign up to get a full 90-day roadmap built from your gaps — ordered by what moves your score the most." },
            ].map((item) => (
              <div key={item.step} className="flex gap-5">
                <span className="text-3xl font-black text-white/10 shrink-0 w-8 text-right">{item.step}</span>
                <div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-b from-indigo-950/60 to-[#0d1018] rounded-2xl border border-indigo-500/20 p-8 text-center">
          <h2 className="text-2xl font-black mb-3">Check your resume score now</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-lg mx-auto">
            Paste your resume below and get your readiness score with the exact gaps blocking product company interviews — free, no account needed.
          </p>
          <Link href="/score">
            <Button className="h-12 px-8 text-base font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl">
              Score my resume — free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-slate-600 text-xs mt-3">No credit card · No signup required · Takes 20 seconds</p>
        </div>
      </div>
    </div>
  );
}
