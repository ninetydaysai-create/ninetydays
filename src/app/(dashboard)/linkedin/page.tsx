"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Sparkles, Copy, CheckCircle2, Users, TrendingUp, Search, PenLine } from "lucide-react";
import { toast } from "sonner";
import { LinkedInPostGenerator } from "@/components/shared/LinkedInPostGenerator";

interface OptimizationResult {
  outputHeadline: string;
  outputSummary: string;
  alternatives: string[];
  keywordsAdded: string[];
}

const benefits = [
  { icon: Search, title: "Keyword-optimized", desc: "Surfaces in recruiter searches for product roles" },
  { icon: Users, title: "Network-ready tone", desc: "Professional but human — not corporate jargon" },
  { icon: TrendingUp, title: "Conversion-focused", desc: "Designed to get profile visits turned into outreach" },
];

export default function LinkedInPage() {
  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  async function handleOptimize() {
    if (!headline.trim()) {
      toast.error("Enter your current headline first");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/linkedin/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ headline, summary }),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? "Optimization failed");
      setLoading(false);
      return;
    }
    setResult(await res.json());
    setLoading(false);
  }

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#161820] rounded-2xl border border-white/10 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-2xl bg-[#0077b5] flex items-center justify-center shadow-lg">
            <ExternalLink className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">LinkedIn Optimizer</h1>
            <p className="text-slate-400 text-sm mt-0.5">AI rewrites your headline and About section for product company hiring</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
              <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                <Icon className="h-4 w-4 text-[#0077b5]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-[#161820] rounded-2xl border border-white/10 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-1">Your current LinkedIn profile</h2>
        <p className="text-slate-400 text-base mb-6">Paste what you currently have. The AI will improve it for product company recruiters.</p>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-300">Current headline <span className="text-red-400">*</span></Label>
            <Textarea
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Senior Software Engineer at TCS | Java | Spring Boot | 7 Years Experience"
              rows={2}
              className="text-sm bg-white/5 border-white/10 focus:bg-white/8 transition-colors resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-300">Current About section <span className="text-slate-400 font-normal">(optional)</span></Label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Paste your current LinkedIn summary / About section here..."
              rows={7}
              className="text-sm bg-white/5 border-white/10 focus:bg-white/8 transition-colors resize-none"
            />
          </div>
          <Button
            onClick={handleOptimize}
            disabled={loading}
            className="h-12 px-8 text-base font-semibold rounded-xl bg-[#0077b5] hover:bg-[#006097] shadow-lg shadow-blue-500/25 transition-all w-full sm:w-auto"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Optimizing your profile...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Optimize my LinkedIn
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold text-sm">Your optimized profile is ready — copy and paste into LinkedIn</span>
          </div>

          {/* Headline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Optimized Headline</h3>
              <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={() => copy(result.outputHeadline, "Headline")}>
                <Copy className="h-3 w-3" /> Copy
              </Button>
            </div>
            <div className="px-6 py-5">
              <p className="text-base font-semibold text-slate-900">{result.outputHeadline}</p>
              {result.alternatives.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Alternatives</p>
                  {result.alternatives.map((alt, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                      <span className="text-sm text-slate-700">{alt}</span>
                      <button className="shrink-0 text-slate-500 hover:text-slate-700 transition-colors" onClick={() => copy(alt, "Alternative")}>
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Optimized About Section</h3>
              <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={() => copy(result.outputSummary, "About section")}>
                <Copy className="h-3 w-3" /> Copy
              </Button>
            </div>
            <div className="px-6 py-5">
              <p className="text-base text-slate-700 whitespace-pre-wrap leading-relaxed">{result.outputSummary}</p>
            </div>
          </div>

          {/* Keywords */}
          {result.keywordsAdded.length > 0 && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 px-6 py-5">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-3">Keywords added to improve visibility</p>
              <div className="flex flex-wrap gap-2">
                {result.keywordsAdded.map((kw) => (
                  <Badge key={kw} className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 text-xs">{kw}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Post Generator ── */}
      <div>
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <PenLine className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Post Generator</h2>
            <p className="text-slate-400 text-sm">Turn your career wins into 3 ready-to-post LinkedIn updates</p>
          </div>
        </div>
        <LinkedInPostGenerator />
      </div>
    </div>
  );
}
