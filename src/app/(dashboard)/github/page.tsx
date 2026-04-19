"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GitFork, Sparkles, Copy, Eye, Code2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const benefits = [
  { icon: Code2, title: "Product-company framing", desc: "Positions you for SaaS and product roles, not service delivery" },
  { icon: Sparkles, title: "AI-generated project summary", desc: "Highlights impact metrics and tech stack intelligently" },
  { icon: CheckCircle2, title: "ATS & recruiter optimized", desc: "Keyword-rich without being spammy" },
];

export default function GitHubPage() {
  const [currentReadme, setCurrentReadme] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  async function handleOptimize() {
    setLoading(true);
    const res = await fetch("/api/github/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentReadme }),
    });
    if (!res.ok) {
      toast.error("Optimization failed. Try again.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setResult(data.outputReadme);
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#161820] rounded-2xl border border-white/10 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
            <GitFork className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">GitHub Profile Optimizer</h1>
            <p className="text-slate-300 text-sm mt-0.5">AI rewrites your README to impress product company recruiters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          {benefits.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 bg-white/5 rounded-xl p-4">
              <div className="h-8 w-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                <Icon className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="text-sm text-slate-300 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="bg-[#161820] rounded-2xl border border-white/10 p-8 shadow-sm">
        <h2 className="text-lg font-bold text-white mb-1">Paste your current README</h2>
        <p className="text-slate-300 text-base mb-6">Leave blank to generate a professional README from scratch based on your profile.</p>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-300">README.md content</Label>
          <Textarea
            value={currentReadme}
            onChange={(e) => setCurrentReadme(e.target.value)}
            placeholder="# Hi, I'm Gaurav 👋&#10;&#10;Paste your current GitHub profile README here, or leave empty to generate from scratch..."
            rows={10}
            className="font-mono text-sm bg-white/5 border-white/10 resize-none focus:bg-white/8 transition-colors"
          />
        </div>
        <Button
          onClick={handleOptimize}
          disabled={loading}
          className="mt-5 h-12 px-8 text-base font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Generating your README...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate optimized README
            </span>
          )}
        </Button>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-8 py-5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Your optimized README is ready</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-lg text-xs font-semibold"
                onClick={() => setPreview(!preview)}
              >
                <Eye className="h-3 w-3 mr-1" />
                {preview ? "Raw" : "Preview"}
              </Button>
              <Button
                size="sm"
                className="rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800"
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  toast.success("README copied to clipboard");
                }}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy README
              </Button>
            </div>
          </div>
          <div className="p-8">
            {preview ? (
              <div className="prose prose-slate max-w-none text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            ) : (
              <Textarea
                value={result}
                onChange={(e) => setResult(e.target.value)}
                rows={24}
                className="font-mono text-sm bg-slate-50 border-slate-200 resize-none w-full text-slate-700"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
