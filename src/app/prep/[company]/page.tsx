import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Users,
  Target,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { COMPANIES, COMPANY_MAP } from "@/lib/companies";

type Props = {
  params: Promise<{ company: string }>;
};

export async function generateStaticParams() {
  return COMPANIES.map((c) => ({ company: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { company: companyId } = await params;
  const company = COMPANY_MAP[companyId];

  if (!company) {
    return { title: "Not Found" };
  }

  return {
    title: `${company.name} Interview Prep — NinetyDays.ai`,
    description: `How to prepare for ${company.name} interviews in 90 days. Real questions, what they look for, and common rejection reasons.`,
    openGraph: {
      title: `${company.name} Interview Prep Guide — NinetyDays.ai`,
      description: `Real questions, interview patterns, and what gets candidates rejected at ${company.name}. Prepare in 90 days.`,
      type: "website",
    },
  };
}

export default async function CompanyPrepPage({ params }: Props) {
  const { company: companyId } = await params;
  const company = COMPANY_MAP[companyId];

  if (!company) {
    notFound();
  }

  const otherCompanies = COMPANIES.filter((c) => c.id !== company.id);

  const difficultyColor =
    company.difficulty === "Extreme"
      ? "text-red-400 bg-red-500/15 border-red-500/30"
      : company.difficulty === "Very High"
      ? "text-orange-400 bg-orange-500/15 border-orange-500/30"
      : "text-yellow-400 bg-yellow-500/15 border-yellow-500/30";

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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-16">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-8">
            <Link href="/prep" className="hover:text-slate-400 transition-colors">
              Prep guides
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-slate-300">{company.name}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4">
            {company.name}{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              Interview Prep Guide
            </span>
          </h1>
          <p className="text-xl text-slate-400 leading-relaxed max-w-2xl">
            What {company.name} actually looks for — and how to prepare in 90 days.
          </p>
        </div>
      </section>

      {/* Quick stats bar */}
      <section className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Users className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Interview Rounds</p>
                <p className="text-white font-bold">{company.interviewRounds} rounds</p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Target className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Focus Areas</p>
                <p className="text-white font-bold">{company.interviewFocus.length} key areas</p>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-700 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Difficulty</p>
                <span
                  className={`inline-block text-sm font-bold px-2.5 py-0.5 rounded-full border ${difficultyColor}`}
                >
                  {company.difficulty}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What they look for */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-2">The signal that matters</p>
            <h2 className="text-3xl font-black text-slate-900">What {company.name} actually looks for</h2>
            <p className="text-slate-500 mt-2">Beyond the job description — the real hiring criteria.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {company.whatTheyLookFor.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-xl p-5"
              >
                <CheckCircle2 className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interview format */}
      <section className="py-16 bg-slate-50 border-b">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-2">The process</p>
            <h2 className="text-3xl font-black text-slate-900">Interview format</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                <Target className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-3">What makes it unique</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{company.uniquePattern}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="h-10 w-10 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                <Shield className="h-5 w-5 text-violet-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-3">Technical emphasis</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{company.technicalEmphasis}</p>
            </div>
          </div>
          <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 text-lg mb-4">Focus areas</h3>
            <div className="flex flex-wrap gap-2">
              {company.interviewFocus.map((area) => (
                <span
                  key={area}
                  className="inline-block bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-full"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sample questions */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600 mb-2">Real questions</p>
            <h2 className="text-3xl font-black text-slate-900">Sample questions by type</h2>
            <p className="text-slate-500 mt-2">Questions drawn from real {company.name} interview reports.</p>
          </div>

          <div className="space-y-10">
            {/* Behavioral */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Behavioral</h3>
                <span className="text-xs font-medium text-slate-400 border border-slate-200 rounded-full px-2.5 py-0.5">
                  {company.sampleQuestions.behavioral.length} questions
                </span>
              </div>
              <div className="space-y-3">
                {company.sampleQuestions.behavioral.map((q, i) => (
                  <div
                    key={i}
                    className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-4"
                  >
                    <span className="text-xs font-black text-blue-400 bg-blue-100 rounded-lg px-2 py-1 shrink-0 mt-0.5">
                      Q{i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* System Design */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="h-7 w-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Target className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">System Design</h3>
                <span className="text-xs font-medium text-slate-400 border border-slate-200 rounded-full px-2.5 py-0.5">
                  {company.sampleQuestions.system_design.length} questions
                </span>
              </div>
              <div className="space-y-3">
                {company.sampleQuestions.system_design.map((q, i) => (
                  <div
                    key={i}
                    className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex items-start gap-4"
                  >
                    <span className="text-xs font-black text-indigo-400 bg-indigo-100 rounded-lg px-2 py-1 shrink-0 mt-0.5">
                      Q{i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Shield className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Technical / Coding</h3>
                <span className="text-xs font-medium text-slate-400 border border-slate-200 rounded-full px-2.5 py-0.5">
                  {company.sampleQuestions.technical.length} questions
                </span>
              </div>
              <div className="space-y-3">
                {company.sampleQuestions.technical.map((q, i) => (
                  <div
                    key={i}
                    className="bg-violet-50 border border-violet-100 rounded-xl p-5 flex items-start gap-4"
                  >
                    <span className="text-xs font-black text-violet-400 bg-violet-100 rounded-lg px-2 py-1 shrink-0 mt-0.5">
                      Q{i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{q}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Red flags */}
      <section className="py-16 bg-slate-50 border-b">
        <div className="max-w-4xl mx-auto px-6">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-widest text-red-500 mb-2">Avoid these</p>
            <h2 className="text-3xl font-black text-slate-900">What gets candidates rejected at {company.name}</h2>
            <p className="text-slate-500 mt-2">These are the real reasons offers are declined — not just "poor culture fit".</p>
          </div>
          <div className="space-y-4">
            {company.redFlags.map((flag, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-white border border-red-100 rounded-xl p-5"
              >
                <div className="h-7 w-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-red-600 mb-1">Red flag {i + 1}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{flag}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#0b0e14]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 rounded-2xl p-10 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-indigo-600/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative">
              <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-3">Ready to prepare?</p>
              <h2 className="text-3xl font-black text-white mb-3">
                Practice {company.name} interviews with AI.
              </h2>
              <p className="text-slate-400 text-lg mb-8 max-w-xl mx-auto">
                Get your readiness score, see your exact gaps, and follow a 90-day plan built for {company.name}.
              </p>
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="h-13 px-9 text-lg font-bold gap-2 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/30 rounded-xl transition-all hover:-translate-y-0.5"
                >
                  Start preparing — free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <p className="text-slate-600 text-sm mt-4">No credit card · 60-second setup · instant gap report</p>
            </div>
          </div>
        </div>
      </section>

      {/* Other company links */}
      <section className="py-12 bg-[#0b0e14] border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-5">More prep guides</p>
          <div className="flex flex-wrap gap-2">
            {otherCompanies.map((c) => (
              <Link
                key={c.id}
                href={`/prep/${c.id}`}
                className="text-sm text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-1.5 transition-colors"
              >
                {c.name}
              </Link>
            ))}
          </div>
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
            <Link href="/prep" className="hover:text-slate-300 transition-colors">
              All prep guides
            </Link>
            <Link href="/sign-in" className="hover:text-slate-300 transition-colors">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-slate-300 transition-colors">
              Sign up
            </Link>
          </div>
          <p className="text-sm text-slate-600">© 2026 NinetyDays</p>
        </div>
      </footer>
    </div>
  );
}
