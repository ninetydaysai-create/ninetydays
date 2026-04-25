import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, XCircle, AlertTriangle, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Am I Ready for FAANG? (Be Honest With Yourself) | NinetyDays",
  description:
    "Find out if you're actually ready for FAANG interviews. Not what you think — what the data says. Check your readiness score free in 20 seconds.",
  openGraph: {
    title: "Am I Ready for FAANG? (Be Honest With Yourself)",
    description:
      "Most engineers who think they're ready for FAANG aren't — not because they're not smart, but because they're missing specific signals. Find out where you stand.",
  },
};

const faangGaps = [
  {
    area: "System Design",
    bar: "Design distributed systems at scale — not CRUD apps. Expect questions like 'Design Twitter feed at 500M users'.",
    typical: "Most service engineers haven't thought beyond monolith + DB at scale.",
  },
  {
    area: "LeetCode Hard",
    bar: "Medium isn't enough. Senior roles at Google/Meta expect Hard in 35 minutes under pressure.",
    typical: "Most engineers have done some Mediums but haven't timed themselves under interview conditions.",
  },
  {
    area: "ML/AI Literacy",
    bar: "For ML roles: production deployment, model evaluation, real datasets. For SWE roles: working knowledge of ML pipelines.",
    typical: "Most don't have production ML projects on their resume.",
  },
  {
    area: "Behavioral Depth",
    bar: "STAR stories with measurable impact, ambiguity handled, cross-team leadership. Vague answers fail.",
    typical: "Engineers often describe what they did — not impact, decisions, or tradeoffs.",
  },
];

const signals = [
  { label: "Solved 150+ LeetCode (20+ Hard)", faang: true },
  { label: "System design case study on GitHub", faang: true },
  { label: "Production project with scale metrics", faang: true },
  { label: "5+ STAR stories memorized with numbers", faang: true },
  { label: "Open source contribution or public code", faang: true },
  { label: "Resume bullets with quantified impact", faang: true },
];

export default function AmIReadyForFAANGPage() {
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
              Check my score free
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">The honest answer</p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-5">
            Am I ready for FAANG?<br />
            <span className="text-slate-400">(Probably not. Here&apos;s why.)</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-8">
            Most engineers who think they&apos;re ready for Google, Meta, or Amazon aren&apos;t — and that&apos;s not an insult. The bar is specific, measurable, and almost nobody tells you what it actually is.
          </p>
          <p className="text-base text-slate-300 leading-relaxed">
            The engineers who get offers aren&apos;t necessarily smarter. They hit the specific signals that FAANG interviewers are trained to look for. This page breaks down exactly what those are — and how to know if you have them.
          </p>
        </div>

        {/* What FAANG actually screens for */}
        <div className="mb-16">
          <h2 className="text-2xl font-black mb-2">What FAANG actually screens for</h2>
          <p className="text-slate-400 text-sm mb-8">Not what you think. This is what gets people rejected at each round.</p>
          <div className="space-y-5">
            {faangGaps.map((gap) => (
              <div key={gap.area} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">{gap.area}</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1.5">FAANG bar</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{gap.bar}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1.5">Most engineers</p>
                    <p className="text-sm text-slate-400 leading-relaxed">{gap.typical}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Self-assessment checklist */}
        <div className="mb-16">
          <h2 className="text-2xl font-black mb-2">The honest checklist</h2>
          <p className="text-slate-400 text-sm mb-6">Check these off truthfully. Most people miss 3–4.</p>
          <div className="space-y-3">
            {signals.map((s) => (
              <div key={s.label} className="flex items-center gap-3 p-4 bg-white/[0.03] border border-white/8 rounded-xl">
                <div className="h-5 w-5 rounded border-2 border-slate-600 shrink-0" />
                <span className="text-slate-300 text-sm font-medium">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">
              If you checked fewer than 4 of these, you will likely be screened out before reaching final rounds — regardless of your years of experience.
            </p>
          </div>
        </div>

        {/* How to actually get ready */}
        <div className="mb-16">
          <h2 className="text-2xl font-black mb-5">How to actually get ready (in 90 days)</h2>
          <div className="space-y-4">
            {[
              { step: "01", title: "Know exactly what you're missing", desc: "Check your readiness score — it tells you specifically which FAANG signals are absent from your profile, ranked by severity." },
              { step: "02", title: "Build the right portfolio", desc: "1 system design case study + 1 production-deployed project with scale metrics. These two things close the portfolio gap for 80% of engineers." },
              { step: "03", title: "Do structured DSA — not random LeetCode", desc: "Work through patterns, not random problems. Blind 75 → Neetcode 150 → Hard practice. Timed, every session." },
              { step: "04", title: "Write your STAR stories now", desc: "5 stories, 5 metrics each, covering: leadership, ambiguity, conflict, failure, impact. Memorize them. Not in the interview — now." },
            ].map((item) => (
              <div key={item.step} className="flex gap-5">
                <span className="text-3xl font-black text-white/10 shrink-0 w-10 text-right">{item.step}</span>
                <div>
                  <h3 className="font-bold text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The real question */}
        <div className="mb-16 bg-[#0d1018] rounded-2xl border border-white/8 p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">The real question</p>
          <h2 className="text-2xl font-black mb-4">Don&apos;t guess — get your actual score</h2>
          <p className="text-slate-400 text-base leading-relaxed mb-6 max-w-lg mx-auto">
            Paste your resume. We&apos;ll score it against FAANG-level expectations and tell you exactly which gaps are blocking you — not generic advice.
          </p>
          <Link href="/score">
            <Button className="h-12 px-8 text-base font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl">
              Check my FAANG readiness — free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-slate-600 text-xs mt-3">No signup · Paste resume · Score in 20 seconds</p>
        </div>

        {/* Bottom signal */}
        <div className="border-t border-white/5 pt-8">
          <p className="text-slate-500 text-sm text-center">
            Engineers who follow a structured 90-day plan move from ~30% → 70%+ readiness.{" "}
            <Link href="/score" className="text-indigo-400 hover:underline">Check where you are →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
