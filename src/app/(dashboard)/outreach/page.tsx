"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UpgradeGate } from "@/components/shared/UpgradeGate";
import {
  Loader2,
  Mail,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";

type Tone = "professional" | "warm" | "direct";

interface EmailVariant {
  variant: string;
  content: string;
}

interface OutreachResult {
  subject: string;
  emails: EmailVariant[];
}

const TONE_OPTIONS: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "warm", label: "Warm" },
  { value: "direct", label: "Direct" },
];

function CopyButton({ text }: { text: string }) {
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
      className="gap-1.5 h-8 text-xs"
      onClick={handleCopy}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-500" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          Copy
        </>
      )}
    </Button>
  );
}

export default function OutreachPage() {
  const [jdText, setJdText] = useState("");
  const [recruiterName, setRecruiterName] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<OutreachResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  async function generate() {
    if (!jdText.trim() || jdText.trim().length < 50) {
      setError("Please paste a job description (at least 50 characters).");
      return;
    }
    setError(null);
    setUpgradeRequired(false);
    setGenerating(true);
    setResult(null);

    try {
      const res = await fetch("/api/outreach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jdText,
          recruiterName: recruiterName.trim() || undefined,
          tone,
        }),
      });

      if (res.status === 403) {
        setUpgradeRequired(true);
        return;
      }

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

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Cold Outreach Generator</h1>
        <p className="text-slate-500 mt-1 text-base">
          Paste a JD &rarr; get a personalized recruiter email in seconds
        </p>
      </div>

      {/* Upgrade gate */}
      {upgradeRequired && (
        <UpgradeGate
          feature="Cold Outreach Generator"
          description="Generate personalized cold emails to recruiters and hiring managers at product companies."
        />
      )}

      {/* Input card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-9 w-9 rounded-xl bg-red-100 flex items-center justify-center">
            <Mail className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-bold text-slate-900">Paste job description</p>
            <p className="text-xs text-slate-400">
              Include role title, company, and requirements for the most targeted email
            </p>
          </div>
        </div>

        <Textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full job description here..."
          className="min-h-[160px] text-sm resize-none rounded-xl border-slate-200 focus:border-red-300"
          disabled={generating}
        />

        <Input
          value={recruiterName}
          onChange={(e) => setRecruiterName(e.target.value)}
          placeholder="Recruiter / hiring manager name (optional)"
          className="rounded-xl border-slate-200 text-sm focus:border-red-300"
          disabled={generating}
        />

        {/* Tone selector */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Tone</p>
          <div className="flex gap-2">
            {TONE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTone(value)}
                disabled={generating}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  tone === value
                    ? "bg-red-500 text-white border-red-500 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-red-300 hover:text-red-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
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
            className="gap-2 h-11 px-6 bg-red-500 hover:bg-red-400"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating (~10s)...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Generate email
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Subject line */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
              Subject line
            </p>
            <div className="flex items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-sm font-semibold text-slate-900 flex-1">{result.subject}</p>
              <CopyButton text={result.subject} />
            </div>
          </div>

          {/* Email variants */}
          <div className="space-y-4">
            {result.emails.map((email) => (
              <div
                key={email.variant}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    {email.variant}
                  </span>
                  <CopyButton text={`Subject: ${result.subject}\n\n${email.content}`} />
                </div>
                <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {email.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
