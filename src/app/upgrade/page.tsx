import { headers } from "next/headers";
import { getPricingForCountry } from "@/lib/geo-pricing";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle2, X, ArrowRight } from "lucide-react";
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

      <div className="max-w-2xl mx-auto px-6 py-16 space-y-14">

        {/* Section 1 — Emotional hook */}
        <div className="text-center space-y-4">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest">One decision away</p>
          <h1 className="text-4xl font-black leading-tight">
            You&apos;re not far —<br />but you&apos;re not ready yet
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
            Most engineers stay stuck for years because they don&apos;t know what to fix.
            <span className="text-white font-semibold"> You now do.</span>
          </p>
        </div>

        {/* Section 2 — Before / After */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Without NinetyDays</p>
            <div className="space-y-3">
              {[
                "Random tutorials, no clear direction",
                "Months wasted with no real results",
                "No idea what recruiters actually want",
                "Resume still reads like an IT support role",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-slate-400">
                  <X className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6 space-y-4">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest">With NinetyDays</p>
            <div className="space-y-3">
              {[
                "Clear 90-day roadmap, week by week",
                "Focused skill building on exact gaps",
                "Interview-ready positioning",
                "Resume that passes the 6-second scan",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5 text-sm text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3 — What they get */}
        <div className="space-y-5">
          <h2 className="text-2xl font-black text-center">Your upgrade includes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: "Personalized 90-day roadmap",      sub: "Every week mapped to your exact gaps" },
              { title: "Gap-based task system",             sub: "Fix what matters, skip what doesn't" },
              { title: "AI Mentor — daily guidance",        sub: "Answers questions, keeps you accountable" },
              { title: "Real interview prep",               sub: "DSA + system design + behavioral" },
              { title: "Project recommendations",          sub: "Based on your profile and target company" },
              { title: "GitHub + resume optimization",     sub: "Look like a product engineer on paper" },
            ].map(({ title, sub }) => (
              <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/8">
                <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-slate-500 text-sm">
            This is not a course. This is a system to make you job-ready.
          </p>
        </div>

        {/* Section 4 — Urgency */}
        <div className="rounded-2xl bg-red-950/30 border border-red-500/20 p-6 space-y-3">
          <p className="text-red-400 font-bold text-sm uppercase tracking-widest">Every month you delay</p>
          <div className="space-y-2">
            {[
              "More competition enters the market",
              "Hiring bar at product companies keeps rising",
              "Your current profile gets weaker by comparison",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <p className="text-slate-400 text-sm pt-1">
            You can either stay where you are — or fix it.
          </p>
        </div>

        {/* Section 5 — Pricing */}
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

          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-2">
            <span>✓ 7-day free trial</span>
            <span>✓ Cancel anytime</span>
            <span>✓ 30-day money-back guarantee</span>
          </div>
        </div>

        {/* Social proof */}
        <div className="text-center space-y-2 pb-8">
          <p className="text-slate-400 text-sm">
            Engineers went from <span className="text-white font-semibold">31% → 72% readiness</span> and landed interviews in <span className="text-white font-semibold">8–10 weeks</span>
          </p>
          <p className="text-slate-600 text-xs">No credit card required to start</p>
        </div>

      </div>
    </div>
  );
}
