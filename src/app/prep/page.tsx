import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Zap, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANIES } from "@/lib/companies";

export const metadata: Metadata = {
  title: "Interview Prep Guides — NinetyDays.ai",
  description:
    "Role-specific interview prep for Google, Meta, Amazon, Apple, Stripe, and more. Real questions, real patterns, and what actually gets candidates rejected.",
  openGraph: {
    title: "Company Interview Prep Guides — NinetyDays.ai",
    description:
      "Real questions, interview patterns, and rejection reasons for top product companies. Prepare in 90 days.",
    type: "website",
  },
};

const difficultyColor = (d: string) => {
  if (d === "Extreme") return "text-red-600 bg-red-50 border-red-200";
  if (d === "Very High") return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-yellow-700 bg-yellow-50 border-yellow-200";
};

export default function PrepIndexPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#0b0e14] border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight">NinetyDays</span>
          </Link>
          <Link href="/sign-up">
            <Button
              size="sm"
              className="h-9 px-5 font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-sm shadow-indigo-500/30"
            >
              Get your readiness score — free
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0b0e14] text-white">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.6) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-16 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-300 mb-8">
            10 companies · Real questions · No fluff
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            Company Interview{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Prep Guides
            </span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Role-specific prep for top product companies — real questions, real patterns, and what actually gets
            candidates rejected.
          </p>
        </div>
      </section>

      {/* Company grid */}
      <section className="py-16 bg-slate-50 border-b">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-5">
            {COMPANIES.map((company) => (
              <Link
                key={company.id}
                href={`/prep/${company.id}`}
                className="group bg-white border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/10 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {company.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full border ${difficultyColor(
                          company.difficulty
                        )}`}
                      >
                        {company.difficulty}
                      </span>
                      <span className="text-xs text-slate-400">{company.interviewRounds} rounds</span>
                    </div>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors shrink-0">
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  {company.interviewFocus.slice(0, 3).map((area) => (
                    <div key={area} className="flex items-center gap-2 text-sm text-slate-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                      {area}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                  View guide
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value prop strip */}
      <section className="py-14 bg-white border-b">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">
            What each guide covers
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: "🎯",
                title: "What they actually look for",
                desc: "Specific hiring signals beyond the job description — the criteria that separate offers from rejections.",
              },
              {
                icon: "❓",
                title: "Real sample questions",
                desc: "Behavioral, system design, and technical questions drawn from real interview reports.",
              },
              {
                icon: "🚩",
                title: "What gets candidates rejected",
                desc: "The exact mistakes that cost candidates offers — specific to each company's culture and bar.",
              },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rejection warning */}
      <section className="py-14 bg-slate-50 border-b">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <AlertTriangle className="h-3.5 w-3.5" />
            Common prep mistake
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">
            Generic prep doesn&apos;t work for top companies.
          </h2>
          <p className="text-lg text-slate-500 leading-relaxed">
            Google doesn&apos;t interview like Amazon. Stripe doesn&apos;t hire like Meta. Each company has a distinct bar,
            a distinct culture filter, and specific patterns interviewers follow. Preparing with general LeetCode
            grind and STAR stories leaves major gaps — especially for the signals each company weighs most heavily.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0b0e14]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4">Go beyond the guide</p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Practice with AI. Get scored.{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Know when you&apos;re ready.
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Upload your resume, get a readiness score against your target company, and follow a 90-day plan that
            closes your exact gaps.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-14 px-9 text-lg font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/30 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Get my readiness score — free
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-slate-600 text-sm mt-4">No credit card · 60-second setup · instant results</p>
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
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            {COMPANIES.map((c) => (
              <Link key={c.id} href={`/prep/${c.id}`} className="hover:text-slate-300 transition-colors">
                {c.name}
              </Link>
            ))}
          </div>
          <p className="text-sm text-slate-600">© 2026 NinetyDays</p>
        </div>
      </footer>
    </div>
  );
}
