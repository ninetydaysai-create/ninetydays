import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Sparkles, Crown, Users } from "lucide-react";
import { ReferralCard } from "@/components/shared/ReferralCard";
import { getPricingForCountry } from "@/lib/geo-pricing";
import { format } from "date-fns";

const proFeatures = [
  "Unlimited resume analyses",
  "Full 12-week roadmap (all weeks)",
  "Unlimited AI mock interviews",
  "Public portfolio page with custom URL",
  "Unlimited job application tracking",
  "LinkedIn + GitHub AI optimizer",
  "Priority AI processing",
  "Weekly progress digest emails",
];

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const headerPayload = await headers();
  const country = headerPayload.get("x-vercel-ip-country") ?? "US";
  const pricing = getPricingForCountry(country);
  const monthly = pricing.plans.monthly;
  const annual  = pricing.plans.annual;
  const sprint  = pricing.plans.sprint;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      plan: true,
      stripeCurrentPeriodEnd: true,
      stripeSubscriptionId: true,
      name: true,
      targetRole: true,
      currentRole: true,
      yearsExperience: true,
    },
  });

  if (!user) redirect("/sign-in");

  const isPro = user.plan === "PRO";
  // Sprint users have Pro plan but no subscription ID (one-time payment)
  const isSprint = isPro && !user.stripeSubscriptionId;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-slate-400 mt-2 text-base">Manage your account and subscription.</p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "Email", value: user.email },
            { label: "Name", value: user.name ?? "—" },
            { label: "Target role", value: user.targetRole?.replace(/_/g, " ") ?? "—" },
            { label: "Current role", value: user.currentRole ?? "—" },
            { label: "Experience", value: user.yearsExperience ? `${user.yearsExperience} years` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center py-1">
              <span className="text-slate-400">{label}</span>
              <span className="font-medium">{value}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-400">Plan</span>
            <Badge
              variant={isPro ? "default" : "secondary"}
              className="gap-1.5 px-3 py-1"
            >
              {isPro && <Crown className="h-3 w-3" />}
              {isPro ? "Pro" : "Free"}
            </Badge>
          </div>
          {isPro && user.stripeCurrentPeriodEnd && (
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Renews</span>
              <span className="font-medium">{format(user.stripeCurrentPeriodEnd, "MMM d, yyyy")}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription */}
      {!isPro ? (
        <Card className="border-primary/30 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-violet-500" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Upgrade to Pro</CardTitle>
            </div>
            <CardDescription className="text-base">
              Unlock everything you need to land your product company role.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {proFeatures.map((f) => (
                <div key={f} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <Separator />

            {/* 3-option pricing grid: Sprint · Monthly · Annual */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Sprint — one-time */}
              <div className="rounded-xl border border-border p-5 space-y-3">
                <div>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wide">90-Day Sprint</p>
                  <div className="mt-1">
                    <span className="text-2xl font-bold">{sprint.display}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{sprint.note}</p>
                </div>
                <form action="/api/checkout" method="POST">
                  <input type="hidden" name="plan" value="sprint" />
                  <Button type="submit" variant="outline" className="w-full h-9 font-semibold text-sm">
                    Get Sprint
                  </Button>
                </form>
              </div>

              {/* Monthly */}
              <div className="rounded-xl border border-border p-5 space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Monthly</p>
                  <div className="mt-1">
                    <span className="text-2xl font-bold">{monthly.display}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{monthly.note}</p>
                </div>
                <form action="/api/checkout" method="POST">
                  <input type="hidden" name="plan" value="monthly" />
                  <Button type="submit" variant="outline" className="w-full h-9 font-semibold text-sm">
                    Start monthly
                  </Button>
                </form>
              </div>

              {/* Annual — recommended */}
              <div className="rounded-xl border-2 border-primary p-5 space-y-3 relative">
                {annual.badge && (
                  <span className="absolute -top-3 left-4 bg-primary text-white text-xs font-bold px-3 py-0.5 rounded-full">
                    {annual.badge}
                  </span>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Annual</p>
                  <div className="mt-1 flex items-end gap-1.5">
                    <span className="text-2xl font-bold">{annual.subDisplay ?? annual.display}</span>
                    {annual.subDisplay && (
                      <span className="text-slate-400 text-xs mb-0.5">/mo</span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-400 font-medium mt-1">{annual.display} · {annual.note}</p>
                </div>
                <form action="/api/checkout" method="POST">
                  <input type="hidden" name="plan" value="annual" />
                  <Button type="submit" className="w-full h-9 font-semibold text-sm">
                    Best value
                  </Button>
                </form>
              </div>
            </div>

            {/* Money-back guarantee */}
            <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <svg className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 013 10c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-emerald-400">30-day money-back guarantee</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete your profile and generate your roadmap. If you don&apos;t find value within 30 days, email us for a full refund — no questions asked.
                </p>
              </div>
            </div>

            {/* Team plan teaser */}
            <div className="rounded-xl border border-dashed border-border p-5 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-indigo-500" />
                  <p className="font-semibold text-sm">Team plan — coming soon</p>
                </div>
                <p className="text-xs text-slate-400">5 seats · $29/mo · Perfect for bootcamps, college placement cells, and study groups</p>
              </div>
              <a href="mailto:team@ninetydays.ai?subject=Team Plan Interest" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="shrink-0">Join waitlist</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg">
                {isSprint ? "90-Day Sprint" : "Pro subscription"}
              </CardTitle>
            </div>
            <CardDescription>
              {isSprint
                ? `Sprint access until ${user.stripeCurrentPeriodEnd ? format(user.stripeCurrentPeriodEnd, "MMM d, yyyy") : "—"} — upgrade to Pro to continue after.`
                : "Manage your billing and subscription."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSprint ? (
              // Sprint users: offer to convert to subscription before expiry
              <div className="space-y-3">
                <p className="text-base text-slate-400">
                  Continue your progress with a full subscription when your sprint ends.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <form action="/api/checkout" method="POST">
                    <input type="hidden" name="plan" value="monthly" />
                    <Button type="submit" variant="outline" className="w-full h-9 text-sm font-semibold">
                      {monthly.display} — monthly
                    </Button>
                  </form>
                  <form action="/api/checkout" method="POST">
                    <input type="hidden" name="plan" value="annual" />
                    <Button type="submit" className="w-full h-9 text-sm font-semibold">
                      {annual.display} — best value
                    </Button>
                  </form>
                </div>
              </div>
            ) : (
              <form action="/api/billing/portal" method="POST">
                <Button type="submit" variant="outline" className="h-10">
                  Manage billing
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
      {/* Referral */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-lg">Refer a friend</CardTitle>
          </div>
          <CardDescription>
            Share your link — each friend who joins and upgrades earns you 1 free month.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ReferralCard />
        </CardContent>
      </Card>
    </div>
  );
}
