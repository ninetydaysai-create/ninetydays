"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  FileEdit,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

type Tone = "formal" | "confident" | "story";

interface CoverLetterResult {
  coverLetter: string;
  highlights: string[];
}

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "formal", label: "Formal" },
  { value: "confident", label: "Confident" },
  { value: "story", label: "Story-driven" },
];

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className={`gap-1.5 h-9 text-sm ${className ?? ""}`}
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-4 w-4" />
          Copy letter
        </>
      )}
    </Button>
  );
}

export default function CoverLetterPage() {
  const [jdText, setJdText] = useState("");
  const [tone, setTone] = useState<Tone>("confident");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<CoverLetterResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!jdText.trim() || jdText.trim().length < 50) {
      setError("Please paste a job description (at least 50 characters).");
      return;
    }
    setError(null);
    setGenerating(true);
    setResult(null);

    try {
      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, tone }),
      });

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "Generation failed. Please try again.");
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function regenerate() {
    setResult(null);
    generate();
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Cover Letter Generator</h1>
        <p className="text-slate-500 mt-1 text-base">
          Paste a job description and get a tailored, non-generic cover letter in seconds.
        </p>
      </div>

      {/* Input card */}
      <div className="bg-[#1a1b23] rounded-2xl border border-white/10 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <FileEdit className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <p className="font-bold text-white">Paste job description</p>
            <p className="text-xs text-slate-400">
              The more detail you include, the more targeted your letter will be
            </p>
          </div>
        </div>

        <Textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full job description here..."
          className="min-h-[160px] text-sm resize-none rounded-xl border-slate-200 focus:border-indigo-300"
          disabled={generating}
        />

        {/* Tone selector */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Tone</p>
          <div className="flex gap-2 flex-wrap">
            {TONE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTone(value)}
                disabled={generating}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  tone === value
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
                    : "bg-white/5 text-slate-400 border-white/10 hover:border-indigo-500/30 hover:text-indigo-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-slate-400">
            {jdText.length > 0
              ? `${jdText.length} characters`
              : "Tip: include the full JD for best results"}
          </p>
          <Button
            onClick={generate}
            disabled={generating || jdText.trim().length < 10}
            className="gap-2 h-11 px-6 bg-indigo-500 hover:bg-indigo-400"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileEdit className="h-4 w-4" />
                Generate letter
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="bg-[#1a1b23] rounded-2xl border border-white/10 shadow-sm p-6 space-y-5">
          {/* Key highlights */}
          <div className="bg-indigo-500/10 rounded-xl border border-indigo-500/20 p-4 space-y-2">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
              Key highlights
            </p>
            {result.highlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-indigo-300">
                <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                {highlight}
              </div>
            ))}
          </div>

          {/* Letter */}
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Your cover letter
            </p>
            <div className="bg-white/5 rounded-xl border border-white/10 px-5 py-5">
              <p className="text-base text-slate-300 leading-relaxed whitespace-pre-wrap">
                {result.coverLetter}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <CopyButton text={result.coverLetter} />
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 h-9 text-sm text-slate-500"
              onClick={regenerate}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Regenerate
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
