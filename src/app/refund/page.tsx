import Link from "next/link";
import { Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — NinetyDays",
  description: "NinetyDays refund and cancellation policy.",
};

const EFFECTIVE_DATE = "April 19, 2026";
const CONTACT_EMAIL = "support@ninetydays.ai";

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0b0e14]">
      <header className="border-b border-white/10 px-6 py-4 max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">NinetyDays</span>
        </Link>
        <span className="text-xs text-slate-500">Effective {EFFECTIVE_DATE}</span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Refund Policy</h1>
          <p className="text-slate-400 text-sm">Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <Section title="Overview">
          NinetyDays offers a subscription-based SaaS product. Because our service delivers instant digital
          value (AI resume analysis, roadmaps, interview coaching) upon subscription, our refund policy
          reflects the nature of digital goods delivery.
        </Section>

        <Section title="Free Plan">
          The Free plan is available at no cost and requires no payment. No refunds are applicable.
        </Section>

        <Section title="Pro Monthly Subscription">
          <ul className="space-y-2 mt-2">
            <li>
              <strong className="text-white">Cancellation:</strong> You may cancel at any time from
              Settings → Billing. Your access continues until the end of the current billing period.
              You will not be charged again after cancellation.
            </li>
            <li>
              <strong className="text-white">Refunds:</strong> We do not issue prorated refunds for
              unused days in a billing period. Once a billing cycle has started and AI features have
              been accessed, the charge is non-refundable.
            </li>
            <li>
              <strong className="text-white">Exception — billing errors:</strong> If you were charged
              incorrectly (e.g., double-charged, charged after cancellation), contact us within 7 days
              and we will issue a full refund for the erroneous charge.
            </li>
          </ul>
        </Section>

        <Section title="Pro Annual Subscription">
          <ul className="space-y-2 mt-2">
            <li>
              <strong className="text-white">Within 14 days of purchase (unused):</strong> If you have
              not accessed any AI features (resume analysis, roadmap generation, interview sessions),
              you may request a full refund within 14 days of purchase.
            </li>
            <li>
              <strong className="text-white">After 14 days or after using AI features:</strong> Annual
              subscriptions are non-refundable. You retain access for the full annual period.
            </li>
            <li>
              <strong className="text-white">Cancellation:</strong> You may cancel auto-renewal at any
              time. Access continues until the annual period ends.
            </li>
          </ul>
        </Section>

        <Section title="EU / UK Consumers — Statutory Right of Withdrawal">
          If you are located in the EU or UK, you have a statutory 14-day right of withdrawal from the
          date of purchase under the Consumer Rights Directive (2011/83/EU).
          <br /><br />
          However, by accessing AI features (uploading a resume, generating a roadmap, starting an
          interview session) before the 14-day period expires, you expressly consent to immediate
          digital delivery and acknowledge that your right of withdrawal is thereby waived in accordance
          with Article 16(m) of Directive 2011/83/EU.
          <br /><br />
          If you have <strong className="text-white">not</strong> used any AI features, you may
          exercise your right of withdrawal within 14 days for a full refund by contacting{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">
            {CONTACT_EMAIL}
          </a>.
        </Section>

        <Section title="How to Request a Refund">
          Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">
            {CONTACT_EMAIL}
          </a>{" "}
          with:
          <ul className="space-y-1 mt-2">
            <li>Your account email address</li>
            <li>The date of the charge</li>
            <li>The reason for your refund request</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            We aim to respond within 2 business days. Approved refunds are processed within 5–10
            business days depending on your payment provider.
          </p>
        </Section>

        <Section title="Contact">
          For billing questions or refund requests:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">
            {CONTACT_EMAIL}
          </a>
          <br /><br />
          For our full legal terms, see our{" "}
          <Link href="/terms" className="text-indigo-400 hover:underline">Terms of Service</Link> and{" "}
          <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-white mb-3">{title}</h2>
      <div className="text-slate-400 text-sm leading-relaxed">{children}</div>
    </div>
  );
}
