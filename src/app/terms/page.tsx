import Link from "next/link";
import { Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "NinetyDays Terms of Service — globally compliant terms covering GDPR, CCPA, and DPDPA. Read before using the platform.",
};

const EFFECTIVE_DATE = "April 19, 2026";
const CONTACT_EMAIL = "legal@ninetydays.ai";
const PRIVACY_EMAIL = "privacy@ninetydays.ai";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0b0e14]">
      <header className="border-b border-white/10 px-6 py-4 max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-white">NinetyDays</span>
        </Link>
        <span className="text-xs text-slate-500">Global · GDPR · CCPA · DPDPA</span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Terms of Service</h1>
          <p className="text-slate-400 text-sm">Effective date: {EFFECTIVE_DATE}</p>
          <p className="text-slate-500 text-xs mt-2">
            These Terms govern your use of NinetyDays globally. Jurisdiction-specific provisions for EU/UK, California,
            and India users are marked where they apply. By using the Service, you confirm you have read, understood, and
            agree to be bound by these Terms.
          </p>
        </div>

        <Section title="1. Who We Are">
          NinetyDays (&quot;NinetyDays&quot;, &quot;we&quot;, &quot;us&quot;, &quot;our&quot;) operates the NinetyDays platform at ninetydays.ai —
          an AI-powered career transition service. For users in the EU/UK, NinetyDays acts as both the service provider
          and the data controller under GDPR. For Indian users, NinetyDays is the Data Fiduciary under the Digital
          Personal Data Protection Act 2023 (DPDPA).
          <br /><br />
          Contact for legal matters:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>
        </Section>

        <Section title="2. Eligibility and Age Requirements">
          <strong className="text-white block mb-2">Global minimum age: 18 years.</strong>
          <ul className="space-y-1 mt-2">
            <li>
              <strong className="text-slate-300">EU/UK (GDPR Article 8):</strong> You must be at least 16 years old. Users aged 16–17
              may require verifiable parental consent. We do not knowingly allow users under 16.
            </li>
            <li>
              <strong className="text-slate-300">United States (COPPA):</strong> The Service is not directed to individuals under 13.
              Users under 18 must have parental or guardian consent.
            </li>
            <li>
              <strong className="text-slate-300">India (DPDPA 2023):</strong> You must be at least 18. Use by minors requires
              verifiable consent of a parent or lawful guardian.
            </li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            If we learn that a minor has created an account without proper consent, we will immediately delete the account
            and all associated personal data.
          </p>
        </Section>

        <Section title="3. Description of Service">
          NinetyDays provides an AI-powered career transition platform including:
          <ul className="space-y-1 mt-2">
            <li>Resume analysis and scoring</li>
            <li>Skill gap identification and prioritization</li>
            <li>Personalized 12-week learning roadmaps</li>
            <li>AI-assisted mock interview coaching</li>
            <li>LinkedIn and GitHub profile optimization</li>
            <li>AI career mentorship (the &quot;AI Mentor&quot;)</li>
            <li>Public portfolio pages</li>
            <li>Job tracker and application management</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            The Service is intended for individuals seeking career transitions in software engineering and technology.
            We reserve the right to modify, suspend, or discontinue features at any time with reasonable notice.
          </p>
        </Section>

        <Section title="4. User Accounts">
          <ul className="space-y-1.5 mt-2">
            <li>You must register an account to access most features. Registration requires a valid email address.</li>
            <li>You are solely responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You must provide accurate, current, and complete information. Providing false information may result in immediate account termination.</li>
            <li>You must notify us immediately at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>{" "}
              if you suspect unauthorized access to your account.</li>
            <li>One account per person. Creating multiple accounts to circumvent usage limits is prohibited.</li>
          </ul>
        </Section>

        <Section title="5. Subscriptions, Billing, and Cancellation">
          <TableBlock rows={[
            ["Plan", "Price", "Billing"],
            ["Free", "$0", "No charge — usage limits apply as described on the pricing page"],
            ["Pro (Monthly)", "$9 / month", "Billed monthly via Stripe"],
            ["Pro (Annual)", "$84 / year", "Billed annually; equivalent to $7/month"],
          ]} />

          <strong className="text-white block mt-4 mb-2">General billing terms:</strong>
          <ul className="space-y-1.5">
            <li>All prices are in USD unless a localized price is displayed at checkout.</li>
            <li>Subscriptions renew automatically at the end of each billing period unless cancelled.</li>
            <li>You may cancel at any time via Settings → Billing. Cancellation takes effect at the end of the current paid period; you retain access until then.</li>
            <li>We reserve the right to change pricing with at least 30 days&apos; advance notice via email.</li>
          </ul>

          <strong className="text-white block mt-4 mb-2">EU / UK users — Consumer Rights Directive (2011/83/EU):</strong>
          <ul className="space-y-1.5">
            <li>
              <strong className="text-slate-300">Right of withdrawal (cooling-off period):</strong> EU/UK consumers have a 14-day
              right of withdrawal from the date of purchase. Because the Service is a digital product delivered immediately,
              by starting to use the AI features (resume analysis, roadmap generation, etc.) before the 14-day period expires,
              you expressly consent to immediate delivery and acknowledge that your right of withdrawal is thereby waived in
              accordance with Article 16(m) of Directive 2011/83/EU.
            </li>
            <li>If you have not yet used any AI features, you may withdraw within 14 days for a full refund. Contact{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>.
            </li>
          </ul>

          <strong className="text-white block mt-4 mb-2">All other users — Refund Policy:</strong>
          <ul className="space-y-1.5">
            <li>Outside the EU/UK cooling-off window, we do not issue refunds for partial billing periods.</li>
            <li>Exceptions may be granted at our sole discretion for billing errors. Contact{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>{" "}within 7 days of the charge.
            </li>
          </ul>
        </Section>

        <Section title="6. Acceptable Use">
          You agree not to:
          <ul className="space-y-1.5 mt-2">
            <li>(a) Use the Service for any unlawful purpose or in violation of any applicable law or regulation;</li>
            <li>(b) Attempt to reverse-engineer, scrape, decompile, or extract our AI models, prompts, or proprietary algorithms;</li>
            <li>(c) Resell, sublicense, or redistribute the Service or any AI-generated output as your own product without our written permission;</li>
            <li>(d) Upload malicious content, viruses, or any code designed to compromise the platform&apos;s security or other users&apos; data;</li>
            <li>(e) Use automated bots, scrapers, or scripts to access the Service beyond what our API explicitly permits;</li>
            <li>(f) Attempt to impersonate another user or misrepresent your identity;</li>
            <li>(g) Use the Service to generate content that is harmful, discriminatory, defamatory, or violates third-party rights;</li>
            <li>(h) Circumvent usage limits, rate limits, or payment requirements through any means.</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Violations may result in immediate account suspension, termination, and where required by law, reporting to authorities.
          </p>
        </Section>

        <Section title="7. AI-Generated Content and Limitations">
          <ul className="space-y-1.5 mt-2">
            <li>The Service uses the NinetyDays AI engine to generate career advice, resume feedback, roadmaps, and interview coaching. The NinetyDays AI engine is powered by large language models from leading AI research companies, including Anthropic and OpenAI, operating under their respective enterprise data agreements.</li>
            <li>AI-generated content is for <strong className="text-white">informational and educational purposes only</strong>. It does not constitute professional career counseling, legal advice, financial advice, or employment guarantees.</li>
            <li>AI outputs may contain errors, inaccuracies, or hallucinations. You should exercise independent judgment before acting on any AI-generated recommendation.</li>
            <li>We make <strong className="text-white">no guarantees of employment outcomes</strong>. Results vary based on individual effort, market conditions, and factors beyond our control.</li>
            <li>You are responsible for the accuracy of the information you provide to the Service. Garbage in, garbage out — AI quality depends on your inputs.</li>
          </ul>
        </Section>

        <Section title="8. Your Data and Content">
          <ul className="space-y-1.5 mt-2">
            <li>You retain full ownership of any resume, career information, portfolio content, or other material you upload (&quot;User Content&quot;).</li>
            <li>By uploading User Content, you grant NinetyDays a limited, non-exclusive, royalty-free license to process, store, and transmit that content solely for the purpose of providing and improving the Service.</li>
            <li>We do not sell, rent, or share your personal data with third parties for advertising purposes.</li>
            <li>We may use anonymized, aggregated insights (e.g., common skill gaps across engineers) to improve our AI models. This data cannot identify you individually.</li>
            <li>For detailed information about data collection, processing, and your rights, see our{" "}
              <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
            </li>
          </ul>

          <strong className="text-white block mt-4 mb-2">GDPR Legal Basis for Processing:</strong>
          <p className="text-sm">
            For EU/UK users, we process your personal data under: (a) contract performance — to deliver the features you
            subscribed for; (b) legitimate interests — for security, analytics, and fraud prevention; and (c) consent —
            for marketing communications and optional analytics. See our Privacy Policy for the full breakdown.
          </p>

          <strong className="text-white block mt-4 mb-2">India DPDPA Consent:</strong>
          <p className="text-sm">
            For Indian users, by creating an account you provide free, specific, informed, unconditional, and unambiguous
            consent to the processing of your personal data as described in these Terms and our Privacy Policy. You may
            withdraw consent at any time by deleting your account; withdrawal does not affect the lawfulness of processing
            before withdrawal.
          </p>
        </Section>

        <Section title="9. Intellectual Property">
          <ul className="space-y-1.5 mt-2">
            <li>The NinetyDays platform, brand, logo, AI prompts, scoring algorithms, and all original content (excluding User Content) are owned by or licensed to NinetyDays and protected by applicable intellectual property laws.</li>
            <li>You may not copy, reproduce, modify, distribute, or create derivative works from our platform, brand, or proprietary content without prior written consent.</li>
            <li>AI-generated outputs produced by the Service at your request (e.g., your roadmap, your resume feedback) are owned by you, subject to the license you grant us in Section 8. You may export and use them freely.</li>
            <li>Feedback, feature suggestions, or ideas you submit to us may be used without compensation or attribution, as we cannot track attribution across user suggestions.</li>
          </ul>
        </Section>

        <Section title="10. Third-Party Services">
          The Service integrates third-party providers including Clerk (authentication), Stripe (payments),
          UploadThing (file storage), Resend (email), and others listed in our{" "}
          <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>. Your use of the Service
          is also subject to the terms of these third-party providers where applicable (e.g., Stripe&apos;s{" "}
          <a href="https://stripe.com/legal/consumer" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Connected Account Agreement</a>{" "}
          for payment processing). We are not responsible for the acts or omissions of third-party providers.
        </Section>

        <Section title="11. Disclaimer of Warranties">
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED,
          INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          WE DO NOT WARRANT THAT THE SERVICE WILL BE ERROR-FREE, UNINTERRUPTED, SECURE, OR PRODUCE SPECIFIC CAREER OUTCOMES.
          <br /><br />
          <strong className="text-white">EU/UK consumer law carve-out:</strong> Nothing in this section limits statutory rights
          that cannot be excluded under applicable EU or UK consumer protection law, including any implied terms required by law.
        </Section>

        <Section title="12. Limitation of Liability">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NINETYDAYS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
          SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, LOSS OF EMPLOYMENT OPPORTUNITIES, DATA LOSS,
          OR GOODWILL, ARISING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE.
          <br /><br />
          OUR TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE GREATER OF: (A) THE
          AMOUNT YOU PAID TO NINETYDAYS IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) USD $100.
          <br /><br />
          <strong className="text-white">EU/UK consumer law carve-out:</strong> The above limitations do not apply to liability
          for death or personal injury caused by our negligence, fraud or fraudulent misrepresentation, or any other liability
          that cannot be limited under applicable EU or UK law (including the Consumer Rights Act 2015 (UK) and applicable
          EU consumer directives).
        </Section>

        <Section title="13. Termination">
          <ul className="space-y-1.5 mt-2">
            <li>You may delete your account at any time from Settings → Account. Deletion is permanent and irreversible. AI analysis data, roadmaps, and portfolio data are deleted within 30 days; payment records are retained for 7 years as required by law.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms, with or without notice depending on severity.</li>
            <li>Upon termination, your right to use the Service ceases immediately. Sections 7, 9, 11, 12, 14, and 15 survive termination.</li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            <strong className="text-slate-400">EU/UK users:</strong> If we terminate your account without cause, you are entitled
            to a pro-rated refund of any prepaid subscription fees for the unused portion of your current billing period.
          </p>
        </Section>

        <Section title="14. Dispute Resolution">
          <strong className="text-white block mb-2">For US users:</strong>
          <p className="mb-3">
            Any dispute arising from these Terms or the Service shall be resolved by binding arbitration administered by the
            American Arbitration Association (AAA) under its Consumer Arbitration Rules, on an individual basis. You waive
            any right to participate in a class action lawsuit or class-wide arbitration. Small claims court actions remain
            available for claims within the applicable jurisdictional limit. You and NinetyDays agree to attempt informal
            resolution by contacting{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>{" "}
            before initiating arbitration.
          </p>

          <strong className="text-white block mb-2">For EU / UK users:</strong>
          <p className="mb-3">
            EU consumers retain the right to bring claims before the courts of their member state and to use alternative
            dispute resolution (ADR) bodies. The EU Online Dispute Resolution platform is available at{" "}
            <span className="text-slate-300">ec.europa.eu/consumers/odr</span>. UK consumers may use the{" "}
            <span className="text-slate-300">CEDR</span> or other approved UK ADR schemes. Nothing in these Terms removes
            your statutory rights as an EU or UK consumer.
          </p>

          <strong className="text-white block mb-2">For India users:</strong>
          <p>
            Disputes shall be submitted to a sole arbitrator appointed by mutual consent under the Arbitration and
            Conciliation Act, 1996. The seat of arbitration shall be Bengaluru, India. Proceedings shall be conducted in English.
            Indian consumers also retain the right to approach the Consumer Disputes Redressal Commission and, once operational,
            the Data Protection Board of India for data-related grievances.
          </p>
        </Section>

        <Section title="15. Governing Law">
          <TableBlock rows={[
            ["User Location", "Governing Law", "Jurisdiction"],
            ["United States", "Laws of the State of Delaware, USA", "Courts of Delaware (subject to arbitration clause)"],
            ["European Union", "EU law + member state law (mandatory consumer protections apply)", "Courts of user's member state"],
            ["United Kingdom", "Laws of England and Wales", "Courts of England and Wales"],
            ["India", "Laws of India", "Courts of Bengaluru, Karnataka"],
            ["All other regions", "Laws of the State of Delaware, USA", "Courts of Delaware"],
          ]} />
          <p className="mt-3 text-xs text-slate-500">
            Where mandatory local consumer protection laws conflict with Delaware law, the mandatory local law prevails to
            the extent required — these Terms do not override unwaivable statutory rights.
          </p>
        </Section>

        <Section title="16. California Users — CCPA / CPRA Notice">
          If you are a California resident, you have specific rights under the California Consumer Privacy Act (CCPA) and
          California Privacy Rights Act (CPRA), including:
          <ul className="space-y-1 mt-2 mb-3">
            <li>Right to know what personal information we collect, use, disclose, and sell (we do not sell data)</li>
            <li>Right to delete your personal information</li>
            <li>Right to correct inaccurate personal information</li>
            <li>Right to opt out of the sale or sharing of personal information (not applicable — we do not sell)</li>
            <li>Right to limit use and disclosure of sensitive personal information</li>
            <li>Right to non-discrimination for exercising CCPA rights</li>
          </ul>
          To exercise these rights, email{" "}
          <a href={`mailto:${PRIVACY_EMAIL}`} className="text-indigo-400 hover:underline">{PRIVACY_EMAIL}</a>.
          We will respond within 45 days (extendable by an additional 45 days with notice). See our{" "}
          <Link href="/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link> for the full CCPA disclosure.
        </Section>

        <Section title="17. Changes to These Terms">
          We may update these Terms from time to time. We will notify you of material changes via email and in-app
          notification at least <strong className="text-white">14 days</strong> before they take effect (30 days for
          material changes affecting EU/UK consumers&apos; statutory rights). The &quot;Effective date&quot; above reflects the
          most recent version. Continued use of the Service after the effective date constitutes acceptance of the
          revised Terms.
          <br /><br />
          If you do not agree to the revised Terms, you may cancel your subscription and delete your account before
          they take effect.
        </Section>

        <Section title="18. Miscellaneous">
          <ul className="space-y-1.5 mt-2">
            <li><strong className="text-slate-300">Entire agreement:</strong> These Terms, together with our Privacy Policy and any order confirmation, constitute the entire agreement between you and NinetyDays regarding the Service.</li>
            <li><strong className="text-slate-300">Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in full force.</li>
            <li><strong className="text-slate-300">No waiver:</strong> Our failure to enforce any right or provision does not constitute a waiver of that right.</li>
            <li><strong className="text-slate-300">Assignment:</strong> You may not assign your account or rights under these Terms without our written consent. We may assign our rights in connection with a merger, acquisition, or sale of assets, with notice to you.</li>
            <li><strong className="text-slate-300">Force majeure:</strong> We are not liable for delays or failures caused by events beyond our reasonable control (natural disasters, infrastructure outages, government actions).</li>
            <li><strong className="text-slate-300">Language:</strong> These Terms are written in English. Any translated version is provided for convenience only; the English version controls.</li>
          </ul>
        </Section>

        <Section title="19. Contact">
          <div className="space-y-1">
            <p>
              <strong className="text-white">Legal enquiries:</strong>{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-indigo-400 hover:underline">{CONTACT_EMAIL}</a>
            </p>
            <p>
              <strong className="text-white">Privacy / data rights:</strong>{" "}
              <a href={`mailto:${PRIVACY_EMAIL}`} className="text-indigo-400 hover:underline">{PRIVACY_EMAIL}</a>
            </p>
            <p className="mt-3 text-xs text-slate-500">
              EU/UK users may also lodge a complaint with their national supervisory authority (e.g., ICO in the UK, CNIL in France).
              Indian users may contact the Data Protection Board of India once operational.
            </p>
          </div>
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
