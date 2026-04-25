import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, AlertTriangle, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "90-Day Roadmap to Get a Product Engineering Job | NinetyDays",
  description:
    "A concrete 90-day plan for software engineers to get a product company offer. Week-by-week tasks, real resources, and a readiness score to track progress.",
  openGraph: {
    title: "90-Day Roadmap to Get a Product Engineering Job",
    description:
      "Stop guessing what to fix. Here's the week-by-week plan that takes engineers from service company → product company offer in 90 days.",
  },
};

const phases = [
  {
    phase: "Phase 1 — Weeks 1–4",
    title: "Baseline & signal building",
    color: "border-blue-500/20 bg-blue-500/5",
    accent: "text-blue-400",
    weeks: [
      {
        week: "Week 1",
        theme: "Audit & gap assessment",
        tasks: [
          "Get your readiness score (paste resume on NinetyDays.ai)",
          "Read your full gap report — identify the top 3 gaps",
          "Rewrite 5 resume bullets with impact + numbers",
        ],
      },
      {
        week: "Week 2",
        theme: "Behavioral story bank",
        tasks: [
          "Write 3 STAR stories (pick your strongest moments)",
          "Add quantified outcomes to each story",
          "Record yourself telling them — 90 seconds max per story",
        ],
      },
      {
        week: "Weeks 3–4",
        theme: "DSA foundation",
        tasks: [
          "Work through Blind 75 (arrays, strings, trees first)",
          "Solve 3 problems per day, timed",
          "Review patterns, not just solutions",
        ],
      },
    ],
  },
  {
    phase: "Phase 2 — Weeks 5–8",
    title: "Portfolio & depth work",
    color: "border-indigo-500/20 bg-indigo-500/5",
    accent: "text-indigo-400",
    weeks: [
      {
        week: "Weeks 5–7",
        theme: "Production project",
        tasks: [
          "Ship one project: deployed publicly, real users possible",
          "Document decisions (why this stack, what trade-offs)",
          "Publish on GitHub with a proper README",
        ],
      },
      {
        week: "Week 8",
        theme: "System design case study",
        tasks: [
          "Write a full system design doc (URL shortener or similar)",
          "Cover: API, DB schema, caching, scaling strategy, failure modes",
          "Publish as a GitHub gist or repo",
        ],
      },
    ],
  },
  {
    phase: "Phase 3 — Weeks 9–12",
    title: "Interview readiness & applications",
    color: "border-emerald-500/20 bg-emerald-500/5",
    accent: "text-emerald-400",
    weeks: [
      {
        week: "Weeks 9–10",
        theme: "Mock interviews",
        tasks: [
          "Run 3 behavioral mock interviews — record and review",
          "Run 2 system design mock interviews",
          "Track what you stumble on; patch those gaps specifically",
        ],
      },
      {
        week: "Week 11",
        theme: "Application prep",
        tasks: [
          "Target 15–20 companies (mix of reach, match, safe)",
          "Write 2 cover letter templates, customizable",
          "Set up job tracking (NinetyDays tracker or spreadsheet)",
        ],
      },
      {
        week: "Week 12",
        theme: "Apply — when readiness ≥ 70%",
        tasks: [
          "Check your readiness score — only apply if 70%+",
          "Send 20 applications (warm intros + cold)",
          "Follow up in 7 days; iterate on what's not converting",
        ],
      },
    ],
  },
];

export default function NinetyDayRoadmapPage() {
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
              Get my personalized roadmap
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-3">Week by week</p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-5">
            90-Day Roadmap to Get a<br />
            <span className="text-indigo-400">Product Engineering Job</span>
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed mb-5">
            Stop trying to figure out what to learn next. This is the order that works — built from the specific signals product companies hire on, not what seems logical.
          </p>
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300">
              This is a generic roadmap. Your specific gaps may require different ordering. Get a personalized version by checking your readiness score first.
            </p>
          </div>
        </div>

        {/* The key insight */}
        <div className="mb-14 bg-[#0d1018] rounded-2xl border border-white/8 p-7">
          <h2 className="text-xl font-black mb-4">The insight most guides miss</h2>
          <p className="text-slate-300 leading-relaxed text-sm mb-4">
            Most 90-day career plans tell you to &quot;learn system design&quot; or &quot;do more LeetCode.&quot; That&apos;s useless unless you know which gaps are actually blocking <em>you</em>.
          </p>
          <p className="text-slate-300 leading-relaxed text-sm mb-4">
            For some engineers, the biggest blocker is a missing project portfolio. For others, it&apos;s behavioral stories. For others, it&apos;s resume framing. Doing the wrong thing in the wrong order is why engineers spend 6 months &quot;preparing&quot; and still get rejected.
          </p>
          <p className="text-slate-300 leading-relaxed text-sm">
            This roadmap gives you the general order that works for most. The personalized version (which NinetyDays generates from your actual resume) prioritizes tasks by what moves your specific readiness score the most.
          </p>
        </div>

        {/* Phase-by-phase roadmap */}
        <div className="mb-16 space-y-10">
          {phases.map((phase) => (
            <div key={phase.phase}>
              <div className={`rounded-2xl border p-7 ${phase.color}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${phase.accent}`}>{phase.phase}</p>
                <h2 className="text-xl font-black text-white mb-6">{phase.title}</h2>
                <div className="space-y-5">
                  {phase.weeks.map((w) => (
                    <div key={w.week}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`text-xs font-bold ${phase.accent}`}>{w.week}</span>
                        <span className="text-xs text-slate-500">—</span>
                        <span className="text-xs text-slate-400 font-medium">{w.theme}</span>
                      </div>
                      <div className="space-y-2 ml-2">
                        {w.tasks.map((t) => (
                          <div key={t} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" />
                            <span className="text-slate-300">{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* What makes this hard */}
        <div className="mb-16">
          <h2 className="text-2xl font-black mb-5">What makes the 90 days actually work</h2>
          <div className="space-y-4">
            {[
              { title: "Ruthless prioritization", desc: "Not all gaps are equal. Closing a critical gap moves your readiness score 3× more than closing a minor one. You don't have time to fix everything — fix the right things." },
              { title: "Visible artifacts over private study", desc: "Every week should end with something you can show. A GitHub commit, a published doc, a recorded mock. If it's not visible, it doesn't exist to a recruiter." },
              { title: "Readiness score as your guide", desc: "Apply at 70%+, not before. Applying early burns pipelines and leads to the rejection trap. Know your number." },
            ].map((item) => (
              <div key={item.title} className="p-5 bg-white/[0.03] border border-white/8 rounded-2xl">
                <h3 className="font-bold text-white mb-1">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-b from-indigo-950/60 to-[#0d1018] rounded-2xl border border-indigo-500/20 p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">Get your personalized version</p>
          <h2 className="text-2xl font-black mb-3">This roadmap is generic. Yours won&apos;t be.</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-lg mx-auto">
            Check your readiness score. NinetyDays generates a week-by-week plan built from your specific gaps — tasks ordered by what moves your readiness the most.
          </p>
          <Link href="/score">
            <Button className="h-12 px-8 text-base font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl">
              Get my personalized roadmap — free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-slate-600 text-xs mt-3">No signup · Score in 20 seconds · Roadmap requires free account</p>
        </div>
      </div>
    </div>
  );
}
