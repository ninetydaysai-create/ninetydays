import Link from "next/link";
import { Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "NinetyDays Privacy Policy — GDPR, CCPA, and DPDPA compliant. How we collect, use, and protect your data.",
};

const EFFECTIVE_DATE = "April 19, 2026";
const CONTACT_EMAIL = "privacy@ninetydays.ai";
const DPO_EMAIL = "dpo@ninetydays.ai"; // Data Protection Officer

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0b0e14]">
      <header className="border-b border-white/10 px-6 py-4 max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">NinetyDays</span>
        </Link>
        <span className="text-xs text-slate-500">GDPR · CCPA · DPDPA Compliant</span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-400 text-sm">Effective date: {EFFECTIVE_DATE}</p>
          <p className="text-slate-500 text-xs mt-2">
            This policy applies to all users globally and addresses requirements under GDPR (EU/UK),
            CCPA/CPRA (California), DPDPA (India), and other applicable privacy laws.
          </p>
        </div>

        <Section title="1. Who We Are">
          NinetyDays AI (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the NinetyDays platform at ninetydays.ai — an AI-powered career transition service.
          For the purposes of GDPR, NinetyDays is the <strong className="text-white">data controller</strong> of your personal data.
          <br /><br />
          <strong className="text-white">Data Protection Officer (DPO):</strong>{" "}
          <a href={`mailto:${DPO_EMAIL}`} className="text-indigo-400 hover:underline">{DPO_EMAIL}</a>
        </Section>

        <Section title="2. What Data We Collect">
          <TableBlock rows={[
            ["Category", "Examples", "Legal Basis (GDPR)"],
            ["Identity & Account", "Name, email address, profile photo", "Contract performance"],
            ["Career & Resume Data", "Resume text, work history, skills, job descriptions you upload", "Contract performance / Legitimate interest"],
            ["AI Interaction Data", "Messages to AI Mentor, interview answers", "Contract performance"],
            ["Usage & Analytics", "Pages visited, features used, session duration (anonymized)", "Legitimate interest / Consent"],
            ["Payment Data", "Billing name, last 4 digits (card details handled by Stripe, not stored by us)", "Contract performance"],
            ["Device & Technical", "IP address, browser type, operating system", "Legitimate interest (security)"],
            ["Communications", "Emails you send us, support requests", "Legitimate interest / Consent"],
          ]} />
          <p className="mt-3 text-xs text-slate-500">We do not collect special category data (health, biometric, religious, political information).</p>
        </Section>

        <Section title="3. How We Use Your Data">
          <ul className="space-y-1.5 mt-2">
            <li>✓ Provide career analysis, roadmap generation, interview coaching, and AI mentorship</li>
            <li>✓ Personalize your experience based on your profile and progress</li>
            <li>✓ Process payments and manage subscriptions</li>
            <li>✓ Send transactional emails (welcome, progress digests, alerts)</li>
            <li>✓ Improve product features using anonymized analytics</li>
            <li>✓ Detect fraud, abuse, and ensure platform security</li>
            <li>✓ Comply with legal obligations</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">We do NOT use your data for advertising, profiling for third parties, or selling to data brokers.</p>
        </Section>

        <Section title="4. Third-Party Processors">
          We share data only with processors under strict data processing agreements (DPAs):
          <TableBlock rows={[
            ["Processor", "Purpose", "Location", "Privacy Policy"],
            ["NinetyDays AI Engine", "Resume and career AI analysis", "USA", "ninetydays.ai/privacy"],
            ["Clerk", "Authentication & user management", "USA (EU servers available)", "clerk.com/privacy"],
            ["Stripe", "Payment processing", "USA/EU", "stripe.com/privacy"],
            ["UploadThing", "Secure file storage (resumes)", "USA", "uploadthing.com/privacy"],
            ["Resend", "Transactional email delivery", "USA", "resend.com/privacy"],
            ["PostHog", "Product analytics (anonymized)", "EU (EU Cloud)", "posthog.com/privacy"],
            ["Upstash", "Rate limiting (anonymized keys)", "USA/EU", "upstash.com/privacy"],
            ["Vercel", "Hosting & CDN", "USA/EU", "vercel.com/legal/privacy-policy"],
            ["Sentry", "Error monitoring (PII stripped)", "USA", "sentry.io/privacy"],
          ]} />
          <p className="mt-3 text-xs text-slate-500">
            Our AI infrastructure providers do not train on API-submitted data by default. Your career data is used only to generate your personalized results — never for model training.
          </p>
        </Section>

        <Section title="5. International Data Transfers">
          Your data may be transferred to and processed in countries outside your jurisdiction, including the United States.
          For transfers from the EU/UK, we rely on:
          <ul className="space-y-1 mt-2">
            <li>EU Standard Contractual Clauses (SCCs) with our US processors</li>
            <li>Adequacy decisions where applicable</li>
          </ul>
          For Indian users under DPDPA, we ensure processors maintain equivalent protection standards.
          You consent to these transfers by using the Service.
        </Section>

        <Section title="6. Your Rights">
          <strong className="text-white block mb-2">EU / UK users (GDPR / UK GDPR):</strong>
          <ul className="space-y-1 mb-4">
            <li>Right of access (Article 15)</li>
            <li>Right to rectification (Article 16)</li>
            <li>Right to erasure / &quot;right to be forgotten&quot; (Article 17)</li>
            <li>Right to restriction of processing (Article 18)</li>
            <li>Right to data portability (Article 20)</li>
            <li>Right to object to processing (Article 21)</li>
            <li>Right to lodge a complaint with your supervisory authority</li>
          </ul>

          <strong className="text-white block mb-2">California users (CCPA / CPRA):</strong>
          <ul className="space-y-1 mb-4">
            <li>Right to know what personal information is collected and shared</li>
            <li>Right to delete personal information</li>
            <li>Right to opt out of sale or sharing (we do not sell data)</li>
            <li>Right to correct inaccurate information</li>
            <li>Right to limit use of sensitive personal information</li>
            <li>Right to non-discrimination for exercising your rights</li>
          </ul>

          <strong className="text-white block mb-2">India users (DPDPA 2023):</strong>
          <ul className="space-y-1 mb-4">
            <li>Right to access personal data</li>
            <li>Right to correction and erasure</li>
            <li>Right to grievance redressal</li>
            <li>Right to nominate a representative</li>
          </ul>

          <p>To exercise any right, email <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>. We will respond within 30 days (GDPR: within 1 month, extendable by 2 months for complex requests).</p>
        </Section>

        <Section title="7. Data Retention">
          <TableBlock rows={[
            ["Data Type", "Retention Period"],
            ["Account data", "Until account deletion + 30 days"],
            ["Resume & analysis data", "Until account deletion + 30 days"],
            ["AI mentor conversations", "Until account deletion + 30 days"],
            ["Payment records", "7 years (legal/tax requirement)"],
            ["Anonymized analytics", "Up to 2 years"],
            ["Security / access logs", "90 days"],
          ]} />
          <p className="mt-3 text-xs text-slate-500">Account deletion can be requested from the Settings page or by emailing us. Deletion is permanent and irreversible.</p>
        </Section>

        <Section title="8. Cookies & Tracking">
          <TableBlock rows={[
            ["Cookie Type", "Purpose", "Can Opt Out"],
            ["Essential (Clerk session)", "Authentication — required for login", "No (required)"],
            ["Analytics (PostHog)", "Product usage analytics", "Yes — see browser settings"],
            ["Payment (Stripe)", "Fraud prevention on checkout", "No (required for payments)"],
          ]} />
          <p className="mt-3 text-xs text-slate-500">We do not use advertising, tracking, or third-party marketing cookies.</p>
        </Section>

        <Section title="9. Security">
          We implement: TLS 1.2+ encryption in transit, AES-256 encryption for stored files, role-based access controls, automated error monitoring (Sentry — PII stripped before transmission), and rate limiting on all endpoints. We conduct periodic security reviews.
          <br /><br />
          In the event of a data breach affecting your rights, we will notify you and relevant supervisory authorities within 72 hours as required by GDPR.
        </Section>

        <Section title="10. Children's Privacy">
          The Service is not directed to individuals under 18. We do not knowingly collect data from minors. If you believe a minor has provided data, contact us immediately at {CONTACT_EMAIL} and we will delete it promptly.
        </Section>

        <Section title="11. Changes to This Policy">
          We will notify you of material changes via email and in-app notification at least 14 days before they take effect. The &quot;effective date&quot; above reflects the most recent version. Continued use after changes constitutes acceptance.
        </Section>

        <Section title="12. Contact & Complaints">
          <strong className="text-white">Privacy enquiries:</strong>{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>
          <br />
          <strong className="text-white">Data Protection Officer:</strong>{" "}
          <a href={`mailto:${DPO_EMAIL}`} className="text-indigo-400 hover:underline">{DPO_EMAIL}</a>
          <br /><br />
          EU/UK users may also lodge a complaint with their national supervisory authority (e.g., ICO in the UK, CNIL in France).
          Indian users may contact the Data Protection Board of India once operational.
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

function TableBlock({ rows }: { rows: string[][] }) {
  const [header, ...body] = rows;
  return (
    <div className="overflow-x-auto mt-3 rounded-xl border border-white/10">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.03]">
            {header.map((h) => (
              <th key={h} className="text-left px-4 py-2.5 font-semibold text-slate-300">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 text-slate-400">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
