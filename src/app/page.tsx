import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingMobileMenu } from "@/components/layout/LandingMobileMenu";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Star,
  ChevronRight,
  Target,
  TrendingUp,
  AlertTriangle,
  XCircle,
  MessageSquare,
  BarChart3,
  Flame,
  Trophy,
  Bell,
  Bot,
  Share2,
  Sparkles,
} from "lucide-react";

const gapExamples = [
  { skill: "System Design", severity: "critical", hours: 18, impact: "Present in 87% of senior interviews" },
  { skill: "ML Project Experience", severity: "critical", hours: 24, impact: "Top blocker for AI role rejections" },
  { skill: "LLM API Usage", severity: "major", hours: 8, impact: "Required at 90% of AI startups" },
  { skill: "Behavioral Stories", severity: "major", hours: 6, impact: "Causes 40% of offer drops post-screen" },
];

const testimonials = [
  {
    quote: "I had 9 years of experience and kept getting ghosted. The gap engine showed me I was missing production ML projects — not skills. Fixed it in 6 weeks, got 3 interviews.",
    name: "Backend Engineer",
    from: "IT services → AI startup",
    score: { before: 28, after: 74 },
  },
  {
    quote: "The readiness score was brutal — 31%. But it gave me a clear target. I followed the roadmap, hit 73% in 8 weeks, and landed a senior product role.",
    name: "Senior Developer",
    from: "Consulting firm → Series B",
    score: { before: 31, after: 73 },
  },
  {
    quote: "What I needed wasn't more learning. I needed to know what to fix, in what order, and why. That's exactly what this gives you.",
    name: "Full-stack Engineer",
    from: "Outsourcing agency → ML team",
    score: { before: 35, after: 71 },
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b0e14]">
      {/* Beta Banner */}
      <div className="bg-indigo-600 text-white text-center py-2.5 px-4 text-sm font-semibold tracking-wide">
        🚀 You&apos;re using an early beta version of NinetyDays — expect rough edges and share your feedback!
      </div>
      {/* Nav */}
      <header className="border-b border-white/8 sticky top-0 z-50 bg-[#0b0e14]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">NinetyDays</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#gap-engine" className="hover:text-white transition-colors">Gap Engine</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="hidden md:block">
              <Button variant="ghost" className="text-base font-medium">Sign in</Button>
            </Link>
            <Link href="/sign-up" className="hidden md:block">
              <Button className="h-10 px-5 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/25">
                Get started free
              </Button>
            </Link>
            <LandingMobileMenu />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0b0e14] text-white">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-300 mb-8">
            <Flame className="h-3.5 w-3.5" />
            For engineers stuck in service companies
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-[4.25rem] font-black tracking-tight leading-[1.06] mb-6">
            You&apos;re not failing interviews.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              You&apos;re not ready yet.
            </span>
          </h1>

          <p className="text-base text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
            Find out exactly what&apos;s blocking you — not generic advice, but the specific gaps that make product companies reject you. Fix them in 90 days.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link href="/score">
              <Button
                size="lg"
                className="h-14 px-9 text-lg font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/30 rounded-xl transition-all hover:-translate-y-0.5"
              >
                Check my score — free
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-7 text-lg font-semibold gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 rounded-xl"
              >
                Get full analysis free
              </Button>
            </Link>
          </div>
          <p className="text-sm text-slate-500">No credit card · Paste your resume · Score in 20 seconds</p>
          <p className="text-xs text-slate-600 mt-2">Built for engineers with 5–12 years experience trying to break into product companies</p>
        </div>

        {/* Flow preview */}
        <div className="relative max-w-3xl mx-auto px-6 pb-20">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {[
              { icon: Target, label: "Upload resume" },
              { icon: AlertTriangle, label: "See your gaps" },
              { icon: TrendingUp, label: "Get 90-day plan" },
              { icon: Trophy, label: "Land the offer" },
            ].map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-4 py-2.5">
                  <step.icon className="h-4 w-4 text-indigo-400" />
                  <span className="text-sm font-medium text-slate-300">{step.label}</span>
                </div>
                {i < 3 && <ChevronRight className="h-4 w-4 text-slate-600 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-24 bg-[#0d1018] border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-red-400 mb-4">Why you keep getting rejected</p>
          <h2 className="text-4xl font-black text-white mb-6">
            You&apos;ve done everything &ldquo;right&rdquo;...
          </h2>
          <p className="text-base text-slate-400 leading-relaxed mb-10">
            Years of experience. Dozens of applications. Still no callbacks from product companies.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {[
              { icon: XCircle, text: "You're optimizing for the wrong signals — service company work doesn't translate 1:1 to product company expectations" },
              { icon: XCircle, text: "Your resume has years of experience but none of the evidence product companies care about" },
              { icon: XCircle, text: "You're taking random courses with no idea which gaps actually move the needle at interview" },
              { icon: XCircle, text: "You don't know what \"good enough\" means for your target role — so you keep applying and keep losing" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-left">
                <Icon className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 font-medium">{text}</p>
              </div>
            ))}
          </div>
          <div className="bg-white/10 rounded-2xl px-8 py-6 inline-block border border-white/10">
            <p className="text-white text-lg font-bold">The problem isn&apos;t effort. It&apos;s direction.</p>
          </div>
        </div>
      </section>

      {/* Solution Pillars */}
      <section className="py-24 bg-[#0b0e14] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">The solution</p>
            <h2 className="text-4xl font-black text-white">
              NinetyDays gives you a clear path from<br />where you are → where you want to be
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                number: "01",
                title: "Know what's holding you back",
                desc: "Upload your resume and get a readiness score with a detailed gap analysis. Not generic advice — the exact competencies missing for your target role.",
                color: "from-blue-500 to-indigo-500",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20",
              },
              {
                number: "02",
                title: "Follow a proven 90-day plan",
                desc: "Get a week-by-week roadmap built from your specific gaps. Every task maps to a real blocker — ordered by what moves your score the most.",
                color: "from-indigo-500 to-violet-500",
                bg: "bg-indigo-500/10",
                border: "border-indigo-500/20",
              },
              {
                number: "03",
                title: "Practice like real interviews",
                desc: "Run AI mock interviews in behavioral, system design, ML concepts, and product sense. Get scored with specific strengths and improvements.",
                color: "from-indigo-500 to-blue-500",
                bg: "bg-indigo-500/10",
                border: "border-indigo-500/20",
              },
            ].map((item) => (
              <div key={item.number} className={`${item.bg} border ${item.border} rounded-2xl p-7`}>
                <div className={`h-1 w-10 rounded-full bg-gradient-to-r ${item.color} mb-5`} />
                <p className="text-4xl font-black text-white/20 mb-2">{item.number}</p>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before / After */}
      <section className="py-20 bg-[#0d1018] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">The transformation</p>
            <h2 className="text-4xl font-black text-white">From rejected to interview-ready</h2>
            <p className="text-slate-400 mt-4 text-base max-w-xl mx-auto">
              The gap between rejection and an offer isn&apos;t talent — it&apos;s clarity. See what changes in 90 days.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-10">
            {/* Before */}
            <div className="bg-[#161820] rounded-2xl border-2 border-red-500/20 p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm font-bold text-red-400 uppercase tracking-widest">Before NinetyDays</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Readiness score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/10 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-red-400 transition-all" style={{ width: "32%" }} />
                    </div>
                    <span className="font-black text-2xl text-red-400">32%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {["Missing ML production experience", "No system design portfolio", "Generic resume bullets", "No STAR stories prepared"].map((g) => (
                    <div key={g} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-red-400 font-bold mt-0.5">✕</span> {g}
                    </div>
                  ))}
                </div>
                <div className="bg-red-500/10 rounded-xl p-3 text-center">
                  <p className="text-sm font-bold text-red-400">If you apply today → Likely rejected</p>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="bg-[#161820] rounded-2xl border-2 border-emerald-500/20 p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-bold text-emerald-400 uppercase tracking-widest">After 90 days</span>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Readiness score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-white/10 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-emerald-500 transition-all" style={{ width: "74%" }} />
                    </div>
                    <span className="font-black text-2xl text-emerald-400">74%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {["2 ML projects on GitHub", "System design case study written", "Resume bullets rewritten with impact", "5 STAR stories ready"].map((g) => (
                    <div key={g} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      {g}
                    </div>
                  ))}
                </div>
                <div className="bg-emerald-500/10 rounded-xl p-3 text-center">
                  <p className="text-sm font-bold text-emerald-400">Interview-ready → Apply confidently</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm">
            Average user goes from <strong className="text-slate-300">31% → 72% readiness</strong> in 8–10 weeks following their personalized plan
          </p>
        </div>
      </section>

      {/* Gap Engine */}
      <section id="gap-engine" className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">The core engine</p>
          <h2 className="text-4xl font-black text-white">Your gap report — brutal, specific, actionable</h2>
          <p className="text-slate-400 mt-4 text-base max-w-xl mx-auto">
            Not &ldquo;improve your skills.&rdquo; Exactly what&apos;s missing, why it&apos;s blocking you, and how many hours to fix it.
          </p>
        </div>

        <div className="bg-[#0b0e14] rounded-2xl p-8 space-y-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-white font-bold text-lg">Your Gap Report</p>
              <p className="text-slate-400 text-sm">Target role: ML Engineer · Readiness: 32%</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-red-400">32</div>
              <div className="text-xs text-slate-500">/ 100</div>
            </div>
          </div>

          {gapExamples.map((gap, i) => (
            <div key={i} className="bg-white/5 border border-white/8 rounded-xl p-5 flex items-start gap-4">
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ${gap.severity === "critical" ? "bg-red-500" : "bg-amber-400"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-semibold text-white">{gap.skill}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gap.severity === "critical" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>
                    {gap.severity}
                  </span>
                </div>
                <p className="text-sm text-indigo-400 font-medium">{gap.impact}</p>
                <p className="text-xs text-slate-500 mt-1">~{gap.hours}h to close</p>
              </div>
            </div>
          ))}

          <div className="pt-2 text-center">
            <p className="text-slate-500 text-sm">+ skill gaps, project gaps, and story gaps — all personalized to your resume</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-[#0d1018] border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">The system</p>
            <h2 className="text-4xl font-black text-white">One pipeline. From resume to offer.</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Upload resume", desc: "PDF upload. AI scores it 0–100 against your target role in 60 seconds.", color: "from-blue-500 to-indigo-500" },
              { step: "02", title: "See your gaps", desc: "Skill gaps, project gaps, story gaps — each with severity, hours to close, and why it matters.", color: "from-indigo-500 to-indigo-600" },
              { step: "03", title: "Get your plan", desc: "12-week roadmap built from your gaps. Every task mapped to a specific blocker in your profile.", color: "from-indigo-600 to-indigo-700" },
              { step: "04", title: "Execute & track", desc: "Check off tasks. Practice interviews. Watch readiness climb. Apply when you hit 70%.", color: "from-indigo-700 to-blue-700" },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-[4rem] font-black text-white/10 leading-none mb-3 select-none">{item.step}</div>
                <div className={`h-1 w-10 rounded-full bg-gradient-to-r ${item.color} mb-4`} />
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiation */}
      <section className="py-24 bg-[#0b0e14] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">Why NinetyDays</p>
            <h2 className="text-4xl font-black text-white">This isn&apos;t another AI chatbot.</h2>
            <p className="text-slate-400 mt-4 text-base">You don&apos;t just get answers. You get a system.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                bad: "Generic career advice",
                good: "Role-specific gap analysis",
                desc: "Every gap, every task, every interview question is specific to your target role — not a template.",
                icon: Target,
              },
              {
                bad: "Random learning paths",
                good: "Ordered action plan",
                desc: "Tasks are ranked by impact on your readiness score. You always know what to fix next.",
                icon: BarChart3,
              },
              {
                bad: "Guesswork on applications",
                good: "Measurable readiness score",
                desc: "A single number that moves as you do the work. You know exactly when you're ready to apply.",
                icon: TrendingUp,
              },
            ].map(({ bad, good, desc, icon: Icon }) => (
              <div key={good} className="bg-[#161820] rounded-2xl border border-white/10 p-6">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs line-through text-slate-500">{bad}</span>
                </div>
                <h3 className="font-bold text-white mb-2">{good}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Mentor */}
      <section className="py-24 bg-[#0b0e14] text-white border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-300 mb-5">
                <Bot className="h-3.5 w-3.5" />
                New: AI Mentor
              </div>
              <h2 className="text-4xl font-black text-white mb-5">
                Your personal mentor.<br />
                <span className="bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                  Knows everything about you.
                </span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-6">
                Unlike generic AI tools, your mentor knows your resume, your exact gaps, and where you are in your roadmap. Ask it what to do next — it gives one specific answer, not 10 vague suggestions.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "\"What should I focus on this week?\" → Get your single highest-impact next task",
                  "\"Am I ready to apply?\" → Honest answer based on your actual score",
                  "\"Which gap will hurt most in interviews?\" → Calibrated to your target company",
                ].map((q) => (
                  <div key={q} className="flex items-start gap-3 text-sm text-slate-300">
                    <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                    {q}
                  </div>
                ))}
              </div>
              <Link href="/sign-up">
                <Button className="h-12 px-7 font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl gap-2">
                  Get your AI mentor free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            {/* Chat preview */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/8 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">AI Mentor</p>
                  <p className="text-slate-500 text-xs">Knows your resume · gaps · progress</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                {[
                  { role: "user", text: "What should I work on this week?" },
                  { role: "assistant", text: "Your System Design gap is critical and untouched. This week: build one system design doc for a URL shortener — write the full design (API, DB schema, scaling strategy). That single deliverable closes your Week 4 roadmap task and gives you something to discuss in interviews. Don't start anything else until that's done." },
                  { role: "user", text: "Should I apply to Google now?" },
                  { role: "assistant", text: "Not yet. You're at 58% — Google's bar sits around 75%. The gap: no production ML project on your GitHub. Apply in 5–6 weeks after you ship the RAG pipeline from Week 7. I'll tell you when you're ready." },
                ].map((m, i) => (
                  <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${m.role === "assistant" ? "bg-indigo-500/20 text-indigo-400" : "bg-white/10 text-slate-400"}`}>
                      {m.role === "assistant" ? "M" : "U"}
                    </div>
                    <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed max-w-[80%] ${m.role === "assistant" ? "bg-white/8 text-slate-300" : "bg-indigo-600 text-white"}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JD Readiness Score */}
      <section className="py-24 bg-[#0b0e14] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Score preview */}
            <div className="bg-[#0b0e14] rounded-2xl p-7 border border-white/5">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-5">Job Readiness Score</p>
              <div className="flex items-end gap-4 mb-5">
                <div className="text-6xl font-black text-amber-400 leading-none">71</div>
                <div>
                  <div className="text-white font-bold mb-1">ML Engineer · Stripe</div>
                  <div className="text-slate-500 text-sm">3 gaps to close before applying</div>
                </div>
              </div>
              <div className="bg-white/5 rounded-full h-2.5 mb-6 overflow-hidden">
                <div className="h-full rounded-full bg-amber-400" style={{ width: "71%" }} />
              </div>
              <div className="space-y-2.5">
                {[
                  { label: "RAG / LLM experience", sev: "critical" },
                  { label: "Production ML deployment", sev: "major" },
                  { label: "System design case study", sev: "major" },
                ].map((g) => (
                  <div key={g.label} className="flex items-center gap-3 text-sm">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${g.sev === "critical" ? "bg-red-500" : "bg-amber-400"}`} />
                    <span className="text-slate-300">{g.label}</span>
                    <span className={`ml-auto text-xs font-bold ${g.sev === "critical" ? "text-red-400" : "text-amber-400"}`}>{g.sev}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-300 mb-5">
                <Target className="h-3.5 w-3.5" />
                Viral feature — no login required
              </div>
              <h2 className="text-4xl font-black text-white mb-5">
                Paste any job description.<br />
                <span className="text-indigo-400">Know if you&apos;re ready.</span>
              </h2>
              <p className="text-slate-400 text-base leading-relaxed mb-6">
                No guessing. Paste any JD and get your readiness score instantly — with the exact gaps blocking you and the single most impactful thing to do next.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Works for any company, any role",
                  "Personalized if you're signed in",
                  "Shareable — one click to post on LinkedIn",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
              <Link href="/score">
                <Button className="h-12 px-7 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
                  Try free — no signup <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Share Cards */}
      <section className="py-20 bg-[#0d1018] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">Your progress = your marketing</p>
          <h2 className="text-4xl font-black text-white mb-5">
            Share your readiness. Stay accountable.
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-10">
            Every week, your progress card updates. One click to share on LinkedIn or Twitter. Your network sees your journey — and keeps you moving.
          </p>
          {/* Sample card */}
          <div className="inline-block bg-[#12141c] rounded-2xl p-8 border border-white/10 shadow-2xl text-left max-w-sm mx-auto">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">NinetyDays.ai</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-3 py-1 text-xs font-semibold text-indigo-300 mb-4">
              Week 8 of 12 · My 90-day journey
            </div>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-6xl font-black text-emerald-400 leading-none">74</span>
              <div className="text-slate-400 text-sm mb-1">/ 100<br />readiness</div>
            </div>
            <div className="text-white font-bold mb-4">ML Engineer readiness</div>
            <div className="bg-white/8 rounded-full h-2 overflow-hidden mb-6">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: "74%" }} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-xs">Track your readiness daily</span>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium cursor-pointer">
                <Share2 className="h-3 w-3" /> Share
              </div>
            </div>
          </div>
          <div className="mt-8">
            <Link href="/sign-up">
              <Button className="h-12 px-7 font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
                Start tracking your progress <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Progress System */}
      <section className="py-24 bg-[#0b0e14] text-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">Built for consistency</p>
            <h2 className="text-4xl font-black text-white">See your progress. Stay motivated.</h2>
            <p className="text-slate-400 mt-4 text-base max-w-xl mx-auto">
              Most career tools give you a report and leave you guessing. NinetyDays keeps you moving every week.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Flame,
                title: "Weekly mission system",
                desc: "Each week: 2–3 focused tasks tied to your biggest gaps. Complete them. Watch your score rise.",
                preview: [
                  { label: "Build a RAG pipeline", done: true },
                  { label: "Write system design case study", done: true },
                  { label: "Record 2 STAR stories", done: false },
                ],
              },
              {
                icon: Trophy,
                title: "Readiness milestones",
                desc: "Track where you stand against the real hiring bar. Know when you're ready — not when you feel ready.",
                milestones: [
                  { pct: 40, label: "Getting started", done: true },
                  { pct: 60, label: "Interview ready", done: true },
                  { pct: 70, label: "Apply now", done: false },
                ],
              },
              {
                icon: Bell,
                title: "Weekly progress digest",
                desc: "Every Monday: tasks completed, readiness delta, what to tackle this week. Your score, delivered.",
                stats: [
                  { label: "Tasks done this week", value: "4" },
                  { label: "Readiness change", value: "+6%" },
                  { label: "Next priority", value: "System design" },
                ],
              },
            ].map(({ icon: Icon, title, desc, preview, milestones, stats }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
                {preview && (
                  <div className="space-y-2 mt-1">
                    {preview.map((t) => (
                      <div key={t.label} className="flex items-center gap-2 text-sm">
                        {t.done
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          : <div className="h-4 w-4 rounded-full border-2 border-slate-600 shrink-0" />
                        }
                        <span className={t.done ? "text-slate-400 line-through" : "text-slate-200"}>{t.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {milestones && (
                  <div className="space-y-2 mt-1">
                    {milestones.map((m) => (
                      <div key={m.pct} className="flex items-center gap-3">
                        <span className={`text-xs font-bold w-8 shrink-0 ${m.done ? "text-emerald-400" : "text-slate-500"}`}>{m.pct}%</span>
                        <div className="flex-1 bg-white/10 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${m.done ? "bg-emerald-400" : "bg-white/20"}`} style={{ width: m.done ? "100%" : "0%" }} />
                        </div>
                        <span className={`text-xs ${m.done ? "text-slate-400" : "text-slate-600"}`}>{m.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {stats && (
                  <div className="space-y-2 mt-1">
                    {stats.map((s) => (
                      <div key={s.label} className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">{s.label}</span>
                        <span className="font-bold text-white">{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#0b0e14] border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">Results</p>
            <h2 className="text-4xl font-black text-white">Engineers who closed the gap</h2>
            <p className="text-slate-400 mt-3 text-base">Built on real patterns from engineers stuck in service companies — and who got out.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-[#161820] rounded-2xl border border-white/10 p-7">
                <div className="flex items-center gap-4 mb-5">
                  <div className="text-center">
                    <div className="text-2xl font-black text-red-400">{t.score.before}%</div>
                    <div className="text-xs text-slate-400">before</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-400">{t.score.after}%</div>
                    <div className="text-xs text-slate-400">after</div>
                  </div>
                  <div className="flex-1 ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400 inline" />
                    ))}
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5 italic">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-bold text-sm text-white">{t.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-indigo-400" />{t.from}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature credibility strip */}
      <section className="py-16 bg-[#0d1018] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">Everything you need to go from &ldquo;confused&rdquo; to &ldquo;interview-ready&rdquo;</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              "AI Mentor — context-aware daily guidance",
              "Resume analyzer with signal depth scoring",
              "AI bullet rewriter (before → after)",
              "Job description readiness score (instant)",
              "Mock interview engine with feedback",
              "12-week personalized roadmap",
              "Readiness score that updates as you work",
              "Progress share cards (LinkedIn/Twitter)",
              "Job application tracker",
              "LinkedIn + GitHub optimizer",
              "Public portfolio page",
              "Cold outreach + cover letter generator",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-24 bg-[#0b0e14] border-b border-white/5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-[#161820] rounded-2xl border border-white/10 p-10">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-6">Why I built this</p>
            <div className="flex items-start gap-6 mb-8">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
                <span className="text-white font-black text-xl">G</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg">The Founder</p>
                <p className="text-slate-400 text-sm mt-0.5">ex-IT services engineer → product company</p>
              </div>
            </div>

            <blockquote className="text-lg text-slate-300 leading-relaxed mb-8 border-l-2 border-indigo-500/40 pl-6">
              &ldquo;I spent 10 years at IT services companies thinking I was building the right skills. Then I applied to product companies — and got rejected. Repeatedly.
              <br /><br />
              40+ applications. 3 first-round interviews. 0 offers. Not because I wasn&apos;t good enough. Because I didn&apos;t know what &ldquo;good enough&rdquo; meant for a product company.
              <br /><br />
              I spent 90 days fixing the right things in the right order — and got hired. NinetyDays is the system I wish I had.&rdquo;
            </blockquote>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: "10+", label: "Years in IT services" },
                { value: "40+", label: "Rejections before cracking it" },
                { value: "90", label: "Days to get hired" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center bg-white/5 rounded-xl p-4">
                  <div className="text-3xl font-black text-indigo-400">{value}</div>
                  <div className="text-sm text-slate-400 mt-1">{label}</div>
                </div>
              ))}
            </div>

            <p className="text-slate-300 text-base leading-relaxed">
              I built this for the engineers who are exactly where I was — talented, hard-working, and invisible to the companies they want to join.
              The system works. It worked for me. It&apos;s built from that experience, not from generic career advice.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-[#0b0e14] border-t border-white/8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">Pricing</p>
            <h2 className="text-4xl font-black text-white">Start free. Upgrade when you&apos;re ready.</h2>
            <p className="text-slate-400 mt-3 text-base">Early access pricing — locked in forever when you join now.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="bg-[#161820] rounded-2xl border border-white/10 p-8 shadow-sm">
              <h3 className="text-2xl font-black text-white">Free</h3>
              <div className="mt-4 mb-1">
                <span className="text-5xl font-black text-white">$0</span>
              </div>
              <p className="text-slate-400 text-sm mb-8">Forever free · No card needed</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Resume analysis + readiness score",
                  "Full gap report (all gaps visible)",
                  "Phase 1 roadmap — first 4 weeks",
                  "3 mock interviews / month",
                  "Rejection risk score",
                  "\"If you apply today\" assessment",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up">
                <Button variant="outline" className="w-full h-12 text-base font-semibold rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10">
                  Get my readiness score — free
                </Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="relative bg-indigo-600 rounded-2xl p-8 shadow-xl shadow-indigo-500/30 overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-2xl font-black text-white">Pro</h3>
                  <span className="bg-amber-400 text-amber-900 text-xs font-black px-3 py-1 rounded-full">Most popular</span>
                </div>
                <div className="mt-3 mb-1 flex items-end gap-2">
                  <span className="text-5xl font-black text-white">$19</span>
                  <span className="text-white/70 text-base mb-1">/month</span>
                </div>
                <p className="text-white/60 text-sm mb-8">Or $149/yr — save $79. One role change = 6-figure salary bump.</p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Free",
                    "AI Mentor — daily personalized guidance",
                    "Full 12-week roadmap (all 3 phases)",
                    "Unlimited mock interviews + scoring",
                    "AI resume bullet rewrites",
                    "Job readiness score for any JD",
                    "Progress share cards",
                    "LinkedIn + GitHub optimizer",
                    "Public portfolio page",
                    "Weekly progress digest email",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-white/90">
                      <CheckCircle2 className="h-4 w-4 text-white/60 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  <Button className="w-full h-12 text-base font-bold rounded-xl bg-white text-indigo-700 hover:bg-white/90 shadow-lg">
                    Get started — $19/mo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <p className="text-center text-white/40 text-xs mt-3 flex items-center justify-center gap-1.5">
                  <svg className="h-3.5 w-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 013 10c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  30-day money-back guarantee
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-400 text-sm mt-8">
            One role change = 6-figure salary bump. The $19/mo math writes itself.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0b0e14] py-28 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4">You're closer than you think</p>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-5">
            You don&apos;t need more courses.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              You need direction.
            </span>
          </h2>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            Check your score in 20 seconds. Find out exactly what&apos;s blocking you. Free.
          </p>
          <Link href="/score">
            <Button
              size="lg"
              className="h-16 px-12 text-xl font-black gap-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-2xl shadow-indigo-500/40 transition-all hover:-translate-y-0.5"
            >
              Check my score →
              <ArrowRight className="h-6 w-6" />
            </Button>
          </Link>
          <p className="text-slate-600 text-sm mt-5">No credit card · Paste your resume · Score in 20 seconds</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0b0e14] border-t border-white/5 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-white">NinetyDays</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link href="/sign-in" className="hover:text-slate-300 transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-slate-300 transition-colors">Sign up</Link>
            <a href="#pricing" className="hover:text-slate-300 transition-colors">Pricing</a>
          </div>
          <p className="text-sm text-slate-600">© 2026 NinetyDays · Built for engineers worldwide</p>
        </div>
      </footer>
    </div>
  );
}
