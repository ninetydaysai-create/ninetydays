"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Upload, FileText, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Step = "idle" | "uploading" | "analyzing" | "done";

export default function OnboardingUpload() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("idle");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = "." + (f.name.split(".").pop() ?? "").toLowerCase();
    if (![".pdf", ".doc", ".docx"].includes(ext)) {
      toast.error("Please upload a PDF or Word document (.pdf, .doc, .docx)");
      return;
    }
    if (f.size > 10 * 1024 * 1024) { toast.error("File must be under 10MB"); return; }
    setFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setStep("uploading");

    // Step 1: upload PDF
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/api/resume/upload", { method: "POST", body: formData });
    if (!uploadRes.ok) {
      const errData = await uploadRes.json().catch(() => ({}));
      toast.error(errData.error ?? "Upload failed. Please try again.");
      setStep("idle");
      return;
    }
    const { resumeId } = await uploadRes.json();

    // Step 2: analyze with AI
    setStep("analyzing");
    const analyzeRes = await fetch("/api/resume/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId }),
    });
    if (!analyzeRes.ok) {
      toast.error("Analysis failed — you can retry from the Resume page.");
      router.push("/onboarding/goals");
      return;
    }
    const { analysisId } = await analyzeRes.json();

    // Step 3: generate gap report
    await fetch("/api/gaps/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    });

    setStep("done");
    setTimeout(() => router.push("/onboarding/goals"), 800);
  }

  const busy = step === "uploading" || step === "analyzing";

  const statusLabel = {
    idle: null,
    uploading: "Uploading your resume...",
    analyzing: "Analyzing with AI — this takes ~15 seconds...",
    done: "Analysis complete! Redirecting...",
  }[step];

  return (
    <div className="w-full max-w-lg">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              s === 2 ? "bg-primary text-white shadow-md shadow-primary/30" : s < 2 ? "bg-primary/30 text-primary" : "bg-border text-muted-foreground"
            }`}>{s}</div>
            {s < 3 && <div className={`h-px w-8 ${s < 2 ? "bg-primary/40" : "bg-border"}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">Step 2 of 3</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold">Upload your resume</h1>
          <p className="text-base text-muted-foreground mt-2">
            We&apos;ll analyze it with AI and generate your personalized gap report automatically.
          </p>
        </div>

        {/* Drop zone */}
        <label
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all mb-6 ${
            file ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
          } ${busy ? "pointer-events-none opacity-70" : ""}`}
          htmlFor="resume-upload"
        >
          {file ? (
            <>
              <FileText className="h-10 w-10 text-primary mb-3" />
              <span className="font-semibold text-base">{file.name}</span>
              <span className="text-sm text-muted-foreground mt-1">
                {(file.size / 1024).toFixed(0)} KB · Click to change
              </span>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <span className="font-semibold text-base">Click to upload your resume</span>
              <span className="text-sm text-muted-foreground mt-1">PDF or Word (.pdf, .doc, .docx) · max 10MB</span>
            </>
          )}
          <input id="resume-upload" type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleFileChange} disabled={busy} />
        </label>

        {/* Status */}
        {statusLabel && (
          <div className={`flex items-center gap-2 text-sm mb-5 px-4 py-3 rounded-lg ${step === "done" ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"}`}>
            {step === "done" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin shrink-0" />
            )}
            {statusLabel}
          </div>
        )}

        <Button
          className="w-full h-12 gap-2 font-semibold text-base shadow-md shadow-primary/25"
          disabled={!file || busy}
          onClick={handleUpload}
        >
          {busy ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> {step === "uploading" ? "Uploading..." : "Analyzing..."}</>
          ) : (
            <><ArrowRight className="h-4 w-4" /> Analyze my resume</>
          )}
        </Button>

        <Button variant="ghost" className="w-full mt-3 text-sm" onClick={() => router.push("/onboarding/goals")} disabled={busy}>
          Skip for now
        </Button>
      </div>
    </div>
  );
}
