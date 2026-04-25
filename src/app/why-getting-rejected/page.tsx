import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, XCircle, CheckCircle2, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Why You're Getting Rejected from Product Companies | NinetyDays",
  description:
    "The real reasons engineers with strong experience keep getting rejected from Google, Meta, Stripe, and similar product companies — and what to do about it.",
  openGraph: {
    title: "Why You're Getting Rejected from Product Companies",
    description:
      "It's not your skills. It's specific missing signals that product company recruiters and engineers look for. Here's exactly what they are.",
  },
};

const rejectionReasons = [
  {
    reason: "Your resume tells the wrong story",
    detail: "Service company resumes list responsibilities. Product company resumes prove impact. \"Led backend migration\" loses to \"Led 3-engineer migration that cut API latency 60%, handling 2M req/day.\" You probably have the impact — you're just not saying it.",
    fix: "Reframe every bullet: [verb] [what] → [result with number]",
  },
  {
    reason: "You have experience but no evidence",
    detail: "Years of experience means nothing without artifacts. Product companies look for: public repos, system design docs, deployed projects, written case studies. If none of your work is publicly visible, you have no evidence — regardless of how good you actually are.",
    fix: "Ship one project publicly. Write one system design doc on GitHub.",
  },
  {
    reason: "You're missing the specific stack signals",
    detail: "Product companies hire for specific tech patterns: distributed systems, ML pipelines, real-time infra, CI/CD ownership. If those words don't appear on your resume with context, automated screening removes you before a human sees it.",
    fix: "Check your role's actual job descriptions. Match the signal language explicitly.",
  },
  {
    reason: "Your behavioral stories are too vague",
    detail: "\"Tell me about a conflict you resolved\" is not a social question — it's a filter for leadership and ownership. If your answer is vague, it signals you haven't operated with real ownership. Product engineers make decisions, own tradeoffs, and quantify outcomes.",
    fix: "Write 5 STAR stories now. Each needs: situation, decision made, measurable outcome.",
  },
  {
    reason: "You applied before you were ready",
    detail: "Applying at 40% readiness doesn't just fail — it burns the company pipeline. Most large product companies track your interview history. Multiple failed rounds can lock you out for 6–12 months. Timing matters.",
    fix: "Know your readiness score. Apply at 70%+, not before.",
  },
];

export default function WhyGettingRejectedPage() {
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
              Find my gaps free
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3">The honest breakdown</p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-5">
            Why you&apos;re getting rejected<br />
            <span className="text-red-400">from product companies</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-5">
            You&apos;re not getting rejected because you&apos;re not good enough. You&apos;re getting rejected because your profile is missing specific signals that product company interviewers are trained to look for.
          </p>
          <p className="text-base text-slate-300 leading-relaxed">
            This isn&apos;t guesswork — these are the patterns that come up repeatedly in how engineers fail to make it from application to offer at product companies.
          </p>
        </div>

        {/* The real stat */}
        <div className="mb-14 grid sm:grid-cols-3 gap-4">
          {[
            { value: "80%", label: "of rejections happen at resume screen — before any human reads it" },
            { value: "3–4", label: "specific gaps account for most product company rejections" },
            { value: "90 days", label: "is enough time to close those gaps if you're systematic" },
          ].map(({ value, label }) => (
            <div key={value} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-indigo-400 mb-1">{value}</div>
              <p className="text-sm text-slate-400 leading-relaxed">{label}</p>
            </div>
          ))}
        </div>

        {/* Rejection reasons */}
        <div className="mb-16 space-y-6">
          <h2 className="text-2xl font-black">The 5 real reasons (and fixes)</h2>
          {rejectionReasons.map((r, i) => (
            <div key={r.reason} className="bg-white/[0.03] border border-white/8 rounded-2xl p-6">
              <div className="flex gap-3 mb-3">
                <span className="text-2xl font-black text-white/10 shrink-0 w-7 text-right">{i + 1}</span>
                <h3 className="text-lg font-bold text-white">{r.reason}</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-4 ml-10">{r.detail}</p>
              <div className="ml-10 flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-300 font-medium">{r.fix}</p>
              </div>
            </div>
          ))}
        </div>

        {/* What to do now */}
        <div className="mb-16">
          <h2 className="text-2xl font-black mb-5">What to do right now</h2>
          <div className="space-y-3">
            {[
              "Find out your specific gaps — not generic ones, but what's missing from your actual resume",
              "Prioritize by what moves the needle most (hint: it's usually one big project + story gaps)",
              "Build a 90-day plan that closes gaps in the right order, not whatever seems urgent",
              "Apply when you hit 70% readiness, not before",
            ].map((s, i) => (
              <div key={s} className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/8 rounded-xl text-sm">
                <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
                <span className="text-slate-300">{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-b from-red-950/30 to-[#0d1018] rounded-2xl border border-red-500/20 p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-red-400 mb-3">Step 1</p>
          <h2 className="text-2xl font-black mb-3">Find your specific rejection reasons</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-lg mx-auto">
            Paste your resume. We&apos;ll show you the specific gaps that are causing rejections, ranked by severity — not generic advice, the exact signals you&apos;re missing.
          </p>
          <Link href="/score">
            <Button className="h-12 px-8 text-base font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl">
              Find my rejection reasons — free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-slate-600 text-xs mt-3">No signup · 20 seconds · brutally honest</p>
        </div>
      </div>
    </div>
  );
}
