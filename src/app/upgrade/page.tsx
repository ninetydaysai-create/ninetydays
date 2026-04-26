import { headers } from "next/headers";
import { getPricingForCountry } from "@/lib/geo-pricing";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle2, ArrowRight, AlertTriangle, TrendingUp, Brain, Map, MessageSquare, Flame } from "lucide-react";
import Link from "next/link";

export default async function UpgradePage() {
  const headerPayload = await headers();
  const country = headerPayload.get("x-vercel-ip-country") ?? "US";
  const pricing = getPricingForCountry(country);
  const monthly = pricing.plans.monthly;
  const annual  = pricing.plans.annual;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">NinetyDays</span>
        </Link>
        <Link href="/dashboard" className="text-slate-400 text-sm hover:text-white transition-colors">
          Back to dashboard →
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-12">

        {/* Section 1 — Reality */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 text-sm font-semibold text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            The honest picture
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            Right now, you are<br />
            <span className="text-red-400">getting rejected.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Not because you&apos;re not good enough. Because product companies screen for signals your current profile doesn&apos;t send.
          </p>
        </div>

        {/* Section 2 — Cause */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
          <p className="text-slate-300 font-bold text-sm uppercase tracking-widest">Not luck. These specific gaps.</p>
          <div className="space-y-3">
            {[
              "No product ownership signal — reads like a delivery role",
              "Missing system design evidence recruiters expect",
              "Impact stories are vague or absent — numbers don't appear",
              "Technical skills listed, but no project depth to back them",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0 mt-2" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs pt-1">
            These are the exact patterns NinetyDays identifies in your specific resume.
          </p>
        </div>

        {/* Section 3 — Solution */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-sm font-semibold text-emerald-400">
            <TrendingUp className="h-3.5 w-3.5" />
            The fix
          </div>
          <h2 className="text-3xl font-black">
            We fix it in 90 days.
          </h2>
          <p className="text-slate-400 text-base max-w-md mx-auto leading-relaxed">
            Not a course. Not generic advice. A week-by-week execution plan built around your exact gaps and target role.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm font-semibold pt-1">
            <span className="text-red-400">Fix gaps</span>
            <span className="text-slate-600">→</span>
            <span className="text-amber-400">Reach 70%+</span>
            <span className="text-slate-600">→</span>
            <span className="text-emerald-400">Start getting callbacks</span>
          </div>
        </div>

        {/* Section 4 — What they get */}
        <div className="space-y-4">
          <h2 className="text-xl font-black">What you unlock</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Map,           title: "Personalized 90-day roadmap",   sub: "Every week mapped to your exact gaps — not a template" },
              { icon: Brain,        title: "AI Mentor — daily commands",     sub: "\"Do THIS today.\" Not options. One action, every session." },
              { icon: MessageSquare, title: "Mock interviews with scoring",   sub: "Behavioral + system design + coding — with Hire/No Hire verdict" },
              { icon: CheckCircle2,  title: "Exact tasks per gap",            sub: "Build this project. Write this story. Practice this skill." },
              { icon: TrendingUp,   title: "LinkedIn + GitHub optimizer",    sub: "Rewrite your signal for product company recruiters" },
              { icon: Flame,        title: "Streak + cohort accountability", sub: "5 engineers with the same goal, same timeline" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/8">
                <Icon className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 5 — Urgency */}
        <div className="rounded-2xl bg-red-950/30 border border-red-500/20 p-6 space-y-4">
          <p className="text-red-400 font-black text-lg">Every week you delay = missed interviews.</p>
          <div className="space-y-2.5">
            {[
              "Hiring at product companies is competitive — the bar rises every quarter",
              "Engineers who started last month are already 4–6 weeks ahead of you",
              "Your current profile gets weaker by comparison every week you wait",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 text-sm text-slate-300">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0 mt-2" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-sm font-semibold pt-1 border-t border-white/5">
            You can either stay where you are — or fix it. That decision is worth months of your career.
          </p>
        </div>

        {/* Outcome anchoring + identity shift + proof */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 space-y-3 text-center">
          <p className="text-indigo-300 font-black text-xl leading-snug">
            This isn&apos;t about fixing a resume.<br />
            It&apos;s about becoming someone who gets interview calls.
          </p>
          <p className="text-slate-400 text-sm">
            Engineers like you go from <span className="text-white font-semibold">40–50% → 70%+</span> in 6–10 weeks.
            That&apos;s the difference between ghosted and getting called back.
          </p>
          <div className="flex items-center justify-center gap-6 pt-1 text-xs text-slate-500">
            <span>1,000+ engineers analyzed</span>
            <span className="text-slate-700">·</span>
            <span>First improvement within days</span>
            <span className="text-slate-700">·</span>
            <span>80% started below 60%</span>
          </div>
        </div>

        {/* Section 6 — Pricing */}
        <div className="space-y-4" id="pricing">
          <h2 className="text-2xl font-black text-center">Start your transformation</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Monthly */}
            <div className="rounded-2xl border border-white/15 p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Monthly</p>
                <p className="text-3xl font-black">{monthly.display}</p>
                <p className="text-slate-400 text-sm mt-1">{monthly.note}</p>
              </div>
              <form action="/api/checkout" method="POST">
                <input type="hidden" name="plan" value="monthly" />
                <Button type="submit" variant="outline" className="w-full h-11 font-semibold border-white/15">
                  Start monthly
                </Button>
              </form>
            </div>

            {/* Annual — recommended */}
            <div className="rounded-2xl border-2 border-indigo-500 p-6 space-y-4 relative">
              {annual.badge && (
                <span className="absolute -top-3 left-5 bg-indigo-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">
                  {annual.badge}
                </span>
              )}
              <div>
                <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide mb-1">Annual · Best value</p>
                <div className="flex items-end gap-1.5">
                  <p className="text-3xl font-black">{annual.subDisplay ?? annual.display}</p>
                  {annual.subDisplay && <p className="text-slate-400 text-sm mb-1">/mo</p>}
                </div>
                <p className="text-emerald-400 text-xs font-semibold mt-1">{annual.display} · {annual.note}</p>
              </div>
              <form action="/api/checkout" method="POST">
                <input type="hidden" name="plan" value="annual" />
                <Button type="submit" className="w-full h-11 font-bold gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Start my 90-day transformation
                </Button>
              </form>
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.03] border border-white/8 px-5 py-4 text-center space-y-1">
            <p className="text-white text-sm font-semibold">Try it for 7 days. One week is enough to know if this works.</p>
            <p className="text-slate-500 text-xs">If it doesn&apos;t feel useful, cancel — no questions asked. 30-day money-back guarantee.</p>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-1">
            <span>✓ Cancel anytime</span>
            <span>✓ No credit card to start</span>
          </div>
        </div>

        {/* Social proof */}
        <div className="text-center space-y-2 pb-8">
          <p className="text-slate-400 text-sm">
            Engineers went from <span className="text-white font-semibold">31% → 72% readiness</span> and landed interviews in <span className="text-white font-semibold">8–10 weeks</span>
          </p>
          <p className="text-slate-600 text-xs">The gap won&apos;t close on its own.</p>
        </div>

      </div>
    </div>
  );
}
