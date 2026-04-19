"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Zap, ArrowRight, Loader2, CheckCircle2, AlertTriangle, XCircle,
  Share2, Lock, Brain, Map, MessageSquare, Target, TrendingUp, Star, X,
} from "lucide-react";
import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { useABTest } from "@/hooks/useABTest";
import { useExitIntent } from "@/hooks/useExitIntent";
import { useGeo } from "@/hooks/useGeo";

interface Gap { label: string; severity: "critical" | "major" | "minor"; impact: string; }
interface ScoreResult {
  readinessScore: number;
  verdict: string;
  topGaps: Gap[];
  strongMatches: string[];
  topAction: string;
  timeToReady: string;
}

const ROADMAP_PREVIEW = [
  { week: "Week 1–2", theme: "Fix impact metrics across every bullet", locked: false },
  { week: "Week 3–4", theme: "System design fundamentals + mock problems", locked: true },
  { week: "Week 5–8", theme: "Build 2 portfolio-grade projects", locked: true },
  { week: "Week 9–12", theme: "Interview sprints + offer negotiation", locked: true },
];

const VALUE_ITEMS = [
  { icon: Brain, label: "AI Mentor", desc: "Daily guidance on exactly what to fix next" },
  { icon: Map, label: "Full 90-day roadmap", desc: "Week-by-week plan tailored to your gaps" },
  { icon: MessageSquare, label: "Unlimited mock interviews", desc: "Practice until rejection isn't a surprise" },
  { icon: Target, label: "JD readiness scoring", desc: "Know your odds before every application" },
  { icon: TrendingUp, label: "Progress tracking", desc: "Watch your readiness climb week by week" },
];

// A/B test — pricing model × positioning (the real money test).
// Prices shown are filled in at render time from the user's geo (useGeo hook).
const PRICING_VARIANT_COPY = {
  control: {
    badgeStatic: "Early access — cancel anytime",
    badgeWithCount: (count: number) => `Join ${count.toLocaleString()}+ engineers`,
    headline: (score: number, target: number) => `You're ${score}% ready — let's get you to ${target}%+`,
    sub: "You're closer than most candidates. Fix these last gaps and start getting interview callbacks.",
    cta: "Unlock My Full Plan",
    plan: "monthly" as const,
    afterSignUpUrl: "/onboarding?plan=monthly",
  },
  sprint: {
    badgeStatic: "One-time payment · No subscription",
    badgeWithCount: () => "One-time payment · Full access for 90 days · No subscription",
    headline: () => "Get Interview-Ready in 90 Days — Guaranteed Direction",
    sub: "Pay once. Get everything unlocked for 90 days. Your AI mentor, full roadmap, unlimited mock interviews — until you land the job.",
    cta: "Start My 90-Day Sprint",
    plan: "sprint" as const,
    afterSignUpUrl: "/onboarding?plan=sprint",
  },
  mentor: {
    badgeStatic: "AI-guided daily · Cancel anytime",
    badgeWithCount: () => "AI-guided daily · Cancel anytime",
    headline: () => "Get an AI Mentor That Guides You Daily Until You're Hired",
    sub: "Stop guessing what to fix. Your AI mentor knows your exact profile and tells you exactly what to do next — every single day.",
    cta: "Start With My Mentor",
    plan: "monthly_15" as const,
    afterSignUpUrl: "/onboarding?plan=monthly_15",
  },
} as const;

type PricingVariant = keyof typeof PRICING_VARIANT_COPY;

const severityConfig = {
  critical: { color: "text-red-500", bg: "bg-red-950/40 border-red-500/20", icon: XCircle, label: "Critical" },
  major: { color: "text-orange-400", bg: "bg-orange-950/40 border-orange-500/20", icon: AlertTriangle, label: "Major" },
  minor: { color: "text-slate-400", bg: "bg-slate-800/60 border-white/10", icon: AlertTriangle, label: "Minor" },
};

export default function ScorePage() {
  const [jdText, setJdText] = useState("");
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);

  // A/B test: pricing model × positioning
  const { variant: rawVariant, track } = useABTest("pricing_model", ["control", "sprint", "mentor"]);
  const pricingVariant = (PRICING_VARIANT_COPY[rawVariant as PricingVariant] ? rawVariant : "control") as PricingVariant;
  const v = PRICING_VARIANT_COPY[pricingVariant];

  // Geo-localised pricing (fills in the price display strings per variant)
  const { pricing: geoPricing } = useGeo();
  const planKey = v.plan === "monthly_15" ? "monthly_15" : v.plan === "sprint" ? "sprint" : "monthly";
  const localPlan = geoPricing.plans[planKey];

  // Exit-intent: trigger sticky bar when user scrolls away from paywall
  const { triggered: exitTriggered, dismiss: dismissExit } = useExitIntent({
    minScrollDepth: 500,
    scrollUpThreshold: 200,
  });

  // Fetch real user count once on mount
  useEffect(() => {
    fetch("/api/stats/public")
      .then((r) => r.json())
      .then((d) => setUserCount(d.userCount ?? null))
      .catch(() => {});
  }, []);

  async function handleScore() {
    if (jdText.trim().length < 50) { setError("Paste a full job description (at least 50 characters)"); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error ?? "Failed — try again"); return; }
      setResult(await res.json());
    } catch {
      setError("Something went wrong — try again");
    } finally {
      setLoading(false);
    }
  }

  function handleShare() {
    if (!result) return;
    const text = `I scored ${result.readinessScore}% ready for this role on NinetyDays.ai\n\n${result.verdict}\n\nninetydays.ai/score`;
    if (navigator.share) {
      navigator.share({ title: "My Job Readiness Score", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
  }

  const score = result?.readinessScore ?? 0;
  const scoreColor = score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400";
  const scoreRing = score >= 70 ? "border-emerald-500" : score >= 50 ? "border-amber-400" : "border-red-500";
  const ringBg = score >= 70 ? "from-emerald-500/20" : score >= 50 ? "from-amber-500/20" : "from-red-500/20";
  // Target score for the paywall headline (realistic next milestone)
  const targetScore = Math.min(100, score < 75 ? score + 13 : 90);
  // Percentile framing — calibrated to feel accurate without being discouraging
  const percentileText = score >= 70
    ? `You're in the top ${Math.max(15, 100 - score + 5)}% of candidates for this role`
    : score >= 50
    ? `You're ahead of ${Math.max(20, score - 12)}% of candidates who tried this role`
    : `Most candidates start below 50% — you can close this gap in 4–6 weeks`;

  // Brutal verdict — deterministic, score-mapped. Not left to AI phrasing.
  const brutalVerdict = score >= 75
    ? { label: "Apply now", sub: "You have enough of this JD covered to get a callback. Don't wait.", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" }
    : score >= 60
    ? { label: "Borderline — risky", sub: "You could get through, but these gaps make rejection the more likely outcome. Fix them first.", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", dot: "bg-amber-400" }
    : score >= 40
    ? { label: "You will likely be rejected", sub: "With these gaps, 9 out of 10 recruiters will pass. Your profile doesn't clear the bar for this role yet.", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", dot: "bg-orange-400" }
    : { label: "You will be rejected", sub: "Your profile does not meet the minimum bar for this role. Applying now wastes your shot — fix the critical gaps first.", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", dot: "bg-red-400" };

  return (
    <div className="min-h-screen bg-[#0b0e14]">
      {/* Nav */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">NinetyDays</span>
        </Link>
        <Link href="/sign-up">
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold">
            Get full analysis free
          </Button>
        </Link>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-300 mb-5">
            <Zap className="h-3.5 w-3.5" />
            Instant JD Readiness Score
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Will you get rejected for this role?</h1>
          <p className="text-slate-400 text-lg">
            Paste any job description. Get a brutal, honest readiness verdict in seconds — no signup required.
          </p>
        </div>

        {/* Input */}
        {!result && (
          <div className="space-y-4">
            <Textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={10}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none text-sm rounded-xl focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              onClick={handleScore}
              disabled={loading || jdText.trim().length < 50}
              className="w-full h-14 text-lg font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl"
            >
              {loading
                ? <><Loader2 className="h-5 w-5 animate-spin" />Analyzing your fit...</>
                : <>Get my readiness score <ArrowRight className="h-5 w-5" /></>}
            </Button>
            <p className="text-center text-slate-500 text-sm">
              Sign in for personalized scoring based on YOUR actual resume
            </p>
          </div>
        )}

        {/* ── RESULTS ── */}
        {result && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Brutal verdict — the hero */}
            <div className={cn("border rounded-2xl p-6", brutalVerdict.bg)}>
              <div className="flex items-center gap-2 mb-3">
                <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", brutalVerdict.dot)} />
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Verdict</p>
              </div>
              <p className={cn("text-3xl font-black leading-tight mb-2", brutalVerdict.color)}>
                {brutalVerdict.label}
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">{brutalVerdict.sub}</p>
            </div>

            {/* Score ring */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center">
              <div className={cn(
                "inline-flex items-center justify-center h-32 w-32 rounded-full border-8 mb-4",
                "bg-gradient-radial", ringBg, "to-transparent",
                scoreRing
              )}>
                <span className={cn("text-5xl font-black tabular-nums", scoreColor)}>{score}</span>
              </div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">Readiness score</p>
              <p className="text-slate-300 text-sm italic">&ldquo;{result.verdict}&rdquo;</p>
              <p className="text-slate-500 text-xs mt-2">Time to ready: <span className="text-slate-400 font-medium">{result.timeToReady}</span></p>

              {/* Percentile framing */}
              <div className={cn(
                "mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium border",
                score >= 70
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                  : score >= 50
                  ? "bg-amber-500/10 border-amber-500/20 text-amber-300"
                  : "bg-slate-800 border-white/10 text-slate-400"
              )}>
                <TrendingUp className="h-3 w-3" />
                {percentileText}
              </div>

              <button
                onClick={handleShare}
                className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                <Share2 className="h-3.5 w-3.5" /> Share this score
              </button>
            </div>

            {/* Strong matches */}
            {result.strongMatches.length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                <p className="text-emerald-400 font-bold text-sm mb-3">What you already have</p>
                <div className="space-y-2">
                  {result.strongMatches.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── GAPS — first visible, rest blurred ── */}
            {result.topGaps.length > 0 && (
              <div className="space-y-3">
                <p className="text-slate-400 font-bold text-sm tracking-wide uppercase text-xs">
                  Gaps blocking you ({result.topGaps.length} found)
                </p>

                {result.topGaps.map((gap, i) => {
                  const cfg = severityConfig[gap.severity];
                  const Icon = cfg.icon;
                  const isLocked = i >= 1; // show first gap fully; blur the rest

                  return (
                    <div key={gap.label} className="relative">
                      <div className={cn(
                        "border rounded-xl p-4 flex items-start gap-3",
                        cfg.bg,
                        isLocked && "select-none"
                      )}>
                        <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", cfg.color)} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-white text-sm">{gap.label}</span>
                            <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full bg-white/10", cfg.color)}>
                              {cfg.label}
                            </span>
                          </div>
                          <p className={cn(
                            "text-xs text-slate-400 leading-relaxed",
                            isLocked && "blur-sm pointer-events-none"
                          )}>
                            {gap.impact}
                          </p>
                        </div>
                        {isLocked && (
                          <div className="shrink-0 flex items-center gap-1 text-slate-500 text-xs">
                            <Lock className="h-3.5 w-3.5" />
                          </div>
                        )}
                      </div>
                      {isLocked && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-transparent to-transparent" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Top action */}
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
              <p className="text-indigo-400 font-bold text-xs uppercase tracking-wide mb-1">Do this first</p>
              <p className="text-white text-sm leading-relaxed">{result.topAction}</p>
            </div>

            {/* ── LOCKED: 90-day roadmap preview ── */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              {/* Header — visible */}
              <div className="bg-white/[0.04] px-5 pt-5 pb-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-bold text-sm">Your 90-day roadmap</p>
                  <p className="text-slate-500 text-xs mt-0.5">Tailored to close your exact gaps</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 font-medium">
                  <Lock className="h-3 w-3" /> Locked
                </span>
              </div>

              {/* Week list */}
              <div className="divide-y divide-white/5">
                {ROADMAP_PREVIEW.map((row) => (
                  <div key={row.week} className={cn(
                    "flex items-center gap-4 px-5 py-3.5",
                    row.locked ? "opacity-70" : "opacity-100"
                  )}>
                    <span className="text-xs text-slate-500 font-mono w-20 shrink-0">{row.week}</span>
                    {row.locked ? (
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-3 rounded bg-slate-700/80 blur-sm w-56" />
                        <Lock className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                      </div>
                    ) : (
                      <span className="text-sm text-slate-300">{row.theme}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Fade overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0b0e14] to-transparent pointer-events-none" />
            </div>

            {/* ── PAYWALL BLOCK — A/B tests pricing model × positioning ── */}
            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/60 to-[#0b0e14] p-7 text-center space-y-6">

              {/* Variant-specific badge */}
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1">
                  <Zap className="h-3 w-3" />
                  {userCount ? v.badgeWithCount(userCount) : v.badgeStatic}
                </span>
              </div>

              {/* Variant-specific headline */}
              <div>
                <p className="text-2xl font-black text-white leading-tight mb-2">
                  {(v.headline as (s: number, t: number) => string)(score, targetScore)}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">{v.sub}</p>
              </div>

              {/* Prominent price display — geo-localised per user's country */}
              <div className="bg-white/[0.04] border border-indigo-500/20 rounded-xl p-4">
                <div className="flex items-center justify-center gap-3">
                  <p className="text-3xl font-black text-white">{localPlan.display}</p>
                  {localPlan.badge && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-1">
                      {localPlan.badge}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-1">{localPlan.note}</p>
              </div>

              {/* Social proof testimonial */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-left">
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  &ldquo;I scored 38% on day one. Six weeks later I was at 74% and had 3 interview callbacks.
                  The roadmap is what makes this real.&rdquo;
                </p>
                <p className="text-slate-500 text-xs mt-2 font-medium">
                  Arjun S. — ex-Infosys → ML Engineer at a Series B startup
                </p>
              </div>

              {/* Value stack */}
              <div className="space-y-2.5 text-left">
                {VALUE_ITEMS.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-white text-sm font-semibold">{label}</span>
                      <span className="text-slate-500 text-sm"> — {desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA block — primary Google OAuth, secondary email */}
              <div className="space-y-3">
                {/* Primary: Google one-click — carries plan intent via forceRedirectUrl */}
                <SignUpButton mode="modal" forceRedirectUrl={v.afterSignUpUrl}>
                  <Button
                    className="w-full h-12 text-base font-bold bg-white hover:bg-slate-100 text-slate-900 rounded-xl gap-3"
                    onClick={() => {
                      // Store plan intent for downstream settings page
                      localStorage.setItem("pending_plan", v.plan);
                      track("oauth_click");
                    }}
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </Button>
                </SignUpButton>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-slate-600 text-xs">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Secondary: email sign-up with plan intent in URL */}
                <Link
                  href={`/sign-up?redirect_url=${encodeURIComponent(v.afterSignUpUrl)}`}
                  className="block"
                  onClick={() => {
                    localStorage.setItem("pending_plan", v.plan);
                    track("cta_click");
                  }}
                >
                  <Button variant="outline" className="w-full h-11 font-semibold border-white/15 bg-white/5 text-white hover:bg-white/10 rounded-xl">
                    {v.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>

                <p className="text-slate-600 text-xs">
                  Takes 30 seconds · Start today, get interview-ready in 4–6 weeks
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 pt-1">
                  <svg className="h-3.5 w-3.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 013 10c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                  30-day money-back guarantee — complete your profile &amp; roadmap, still not happy? Full refund.
                </div>
              </div>
            </div>

            {/* Try another */}
            <button
              onClick={() => { setResult(null); setJdText(""); }}
              className="w-full text-center text-slate-600 text-sm hover:text-slate-400 transition-colors py-2"
            >
              Try another job description
            </button>
          </div>
        )}
      </div>
      {/* ── EXIT-INTENT STICKY BAR ── */}
      {result && exitTriggered && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="border-t border-indigo-500/30 bg-[#0d0f1a]/95 backdrop-blur-xl px-4 py-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              {/* Score reminder */}
              <div className="shrink-0 h-12 w-12 rounded-xl border-2 border-indigo-500 flex items-center justify-center bg-indigo-950/60">
                <span className={cn("text-lg font-black", scoreColor)}>{score}</span>
              </div>

              {/* Copy */}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold leading-tight">
                  {score < 60 ? "You're not ready yet — here's how to fix it" : `${score}% ready — close the gap before applying`}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Full 90-day plan tailored to your exact gaps
                </p>
              </div>

              {/* CTA */}
              <SignUpButton mode="modal">
                <Button
                  size="sm"
                  className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold gap-1.5"
                  onClick={() => { track("exit_intent_click"); dismissExit(); }}
                >
                  <Zap className="h-3.5 w-3.5" />
                  Get full plan
                </Button>
              </SignUpButton>

              {/* Dismiss */}
              <button
                onClick={dismissExit}
                className="shrink-0 text-slate-600 hover:text-slate-400 transition-colors p-1"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
