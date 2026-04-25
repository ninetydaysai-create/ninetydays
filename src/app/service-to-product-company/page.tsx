import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, XCircle, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Switch from Service Company to Product Company | NinetyDays",
  description:
    "A practical guide for engineers at Infosys, TCS, Wipro, Accenture, and similar firms who want to move to product companies. What actually works — and what doesn't.",
  openGraph: {
    title: "How to Switch from Service Company to Product Company",
    description:
      "Most service engineers try the wrong things. Here's what actually gets you a product company offer — based on what hiring managers actually look for.",
  },
};

const myths = [
  {
    myth: "\"I need a Master's degree first\"",
    truth: "Hiring managers care about production evidence and interview performance, not credentials. A relevant project ships faster than a 2-year degree.",
  },
  {
    myth: "\"I need to switch to a known startup first\"",
    truth: "Direct transitions from service companies happen regularly. You don't need a stepping-stone company — you need the right gaps closed.",
  },
  {
    myth: "\"More LeetCode will fix it\"",
    truth: "DSA is only one signal. Missing ML projects, system design artifacts, and story gaps kill far more candidates than bad LeetCode scores.",
  },
  {
    myth: "\"I just need to network my way in\"",
    truth: "Referrals get you past resume screening. They don't save you in interviews. You still need to close the actual gaps.",
  },
];

const whatActuallyWorks = [
  {
    title: "Ship one production project",
    desc: "Not a tutorial clone. A project deployed publicly with real users (even if 5). Write up the decisions you made. This single item changes how your profile reads to a product engineer.",
  },
  {
    title: "Write one system design doc",
    desc: "Pick a real system (URL shortener, notification service, payment flow). Write the full design: API, DB schema, scaling strategy, failure modes. Publish it on GitHub. This is what product engineers do — and it signals immediately.",
  },
  {
    title: "Reframe every bullet with impact",
    desc: "\"Led migration to microservices\" → \"Led 4-engineer migration from monolith to microservices, reducing p95 latency from 800ms → 120ms.\" Same work. Completely different signal.",
  },
  {
    title: "Build 5 STAR stories with numbers",
    desc: "Every behavioral question is the same question: \"Can you handle ambiguity, conflict, and scale?\" Prepare 5 real stories that prove this. If you can't measure the impact, you don't own the story.",
  },
];

export default function ServiceToProductCompanyPage() {
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
              Check my readiness free
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">The real guide</p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-5">
            How to switch from a service company<br />
            <span className="text-indigo-400">to a product company</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-5">
            You&apos;ve been at Infosys, TCS, Wipro, Capgemini, or a similar firm for years. You&apos;re good at your job. But you can&apos;t seem to get past the first screen at product companies.
          </p>
          <p className="text-base text-slate-300 leading-relaxed">
            This isn&apos;t about your skills being bad. It&apos;s about a translation problem — the work you do in services doesn&apos;t map cleanly to the signals product companies hire on. This guide explains exactly what those signals are and how to build them.
          </p>
        </div>

        {/* Why it's harder than it looks */}
        <div className="mb-16">
          <h2 className="text-2xl font-black mb-5">Why service-to-product is harder than it looks</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: "Service company", items: ["Delivery focus — hit milestones for clients", "Tech decisions made for you", "Limited ownership over full stack", "Success = on-time, on-budget delivery"] },
              { label: "Product company", items: ["Impact focus — move metrics for the business", "Engineers drive technical decisions", "Full ownership expected", "Success = measurable user/business impact"] },
            ].map((col) => (
              <div key={col.label} className={`rounded-2xl border p-6 ${col.label === "Service company" ? "border-red-500/20 bg-red-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${col.label === "Service company" ? "text-red-400" : "text-emerald-400"}`}>{col.label}</p>
                <div className="space-y-2">
                  {col.items.map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-slate-300">
                      {col.label === "Service company"
                        ? <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                        : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />}
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-slate-400 leading-relaxed">
            Product companies don&apos;t hold this against you — they just need evidence that you can operate with ownership and impact. The gap isn&apos;t who you are, it&apos;s what your resume and portfolio signals.
          </p>
        </div>

        {/* Myths */}
        <div className="mb-16">
          <h2 className="text-2xl font-black mb-2">4 myths that keep service engineers stuck</h2>
          <p className="text-slate-400 text-sm mb-6">Stop doing these. They waste months.</p>
          <div className="space-y-4">
            {myths.map((m) => (
              <div key={m.myth} className="bg-white/[0.03] border border-white/8 rounded-2xl p-5">
                <p className="font-bold text-red-400 text-sm mb-2">{m.myth}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{m.truth}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What actually works */}
        <div className="mb-16">
          <h2 className="text-2xl font-black mb-2">What actually works</h2>
          <p className="text-slate-400 text-sm mb-6">Four things. In this order. No fluff.</p>
          <div className="space-y-5">
            {whatActuallyWorks.map((item, i) => (
              <div key={item.title} className="flex gap-5">
                <span className="text-3xl font-black text-white/10 shrink-0 w-8 text-right leading-none mt-1">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-bold text-white mb-1.5">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-16 bg-indigo-950/40 border border-indigo-500/20 rounded-2xl p-7">
          <h2 className="text-xl font-black mb-4">Realistic timeline</h2>
          <div className="space-y-3">
            {[
              { period: "Weeks 1–3", action: "Identify your specific gaps (readiness score + gap report)" },
              { period: "Weeks 4–8", action: "Build production project + write system design doc" },
              { period: "Weeks 7–10", action: "Structured DSA + behavioral story prep" },
              { period: "Weeks 9–12", action: "Interview practice + applications + outreach" },
            ].map((row) => (
              <div key={row.period} className="flex gap-4 items-start text-sm">
                <span className="font-bold text-indigo-400 shrink-0 w-20">{row.period}</span>
                <span className="text-slate-300">{row.action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#0d1018] rounded-2xl border border-white/8 p-8 text-center">
          <h2 className="text-2xl font-black mb-3">Find your specific gaps in 20 seconds</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-lg mx-auto">
            Paste your resume. We&apos;ll score it and show you the exact gaps between where you are and what product companies require — no signup needed.
          </p>
          <Link href="/score">
            <Button className="h-12 px-8 text-base font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl">
              Check my readiness — free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-slate-600 text-xs mt-3">No credit card · No signup required</p>
        </div>
      </div>
    </div>
  );
}
