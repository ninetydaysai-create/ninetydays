"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowRight, Upload, FileText, Loader2, Sparkles, CheckCircle2, Copy, RotateCcw, Zap } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { toast } from "sonner";

interface WeakBullet { original: string; rewrite: string; reason: string; }
interface Analysis {
  id: string;
  overallScore: number;
  impactScore: number;
  keywordDensityScore: number;
  projectComplexity: number;
  starStoriesCount: number;
  skillsFound: string[];
  weakBullets: WeakBullet[];
  resume: { fileName: string; createdAt: string; id: string; };
  createdAt: string;
}
interface Resume { id: string; fileName: string; fileSize: number; createdAt: string; }

export default function ResumePage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [plan, setPlan] = useState<"FREE" | "PRO">("FREE");
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploadStep, setUploadStep] = useState<"idle" | "uploading" | "analyzing" | "done">("idle");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [latestScore, setLatestScore] = useState<number | null>(null);

  // Tab state
  const [tab, setTab] = useState<"analyze" | "rewrite">("analyze");

  // Bullet rewriter state
  const [bulletInput, setBulletInput] = useState("");
  const [bulletResult, setBulletResult] = useState<{
    impactScoreBefore: number;
    impactScoreAfter: number;
    rewrites: { text: string; impactScore: number; reasoning: string }[];
  } | null>(null);
  const [bulletLoading, setBulletLoading] = useState(false);
  const [bulletError, setBulletError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    const [aRes, pRes] = await Promise.all([
      fetch("/api/resume/analyses"),
      fetch("/api/user/plan"),
    ]);
    if (aRes.ok) {
      const d = await aRes.json();
      setAnalyses(d.analyses ?? []);
      setResumes(d.resumes ?? []);
    }
    if (pRes.ok) {
      const d = await pRes.json();
      setPlan(d.plan ?? "FREE");
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.type !== "application/pdf") { toast.error("Please upload a PDF file"); return; }
    if (f.size > 10 * 1024 * 1024) { toast.error("File must be under 10MB"); return; }
    setFile(f);
  }

  async function handleUploadAndAnalyze() {
    if (!file) return;
    setUploadStep("uploading");
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await fetch("/api/resume/upload", { method: "POST", body: formData });
    if (!uploadRes.ok) {
      const errData = await uploadRes.json().catch(() => ({}));
      toast.error(errData.error ?? `Upload failed (${uploadRes.status})`);
      setUploadStep("idle");
      return;
    }
    const { resumeId } = await uploadRes.json();
    setUploadStep("analyzing");
    const analyzeRes = await fetch("/api/resume/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId }),
    });
    if (!analyzeRes.ok) {
      const errData = await analyzeRes.json().catch(() => ({}));
      toast.error(errData.error ?? `Analysis failed (${analyzeRes.status})`);
      setUploadStep("idle");
      return;
    }
    const { score } = await analyzeRes.json();
    setUploadStep("done");
    setLatestScore(score ?? null);
    setFile(null);
    await loadData();
  }

  async function handleAnalyze(resumeId: string) {
    setAnalyzingId(resumeId);
    const res = await fetch("/api/resume/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeId }),
    });
    if (res.ok) {
      const { score } = await res.json();
      setLatestScore(score ?? null);
      await loadData();
      setUploadStep("done");
    } else {
      const errData = await res.json().catch(() => ({}));
      toast.error(errData.error ?? `Analysis failed (${res.status})`);
    }
    setAnalyzingId(null);
  }

  async function rewriteBullet() {
    if (!bulletInput.trim()) return;
    setBulletLoading(true);
    setBulletError(null);
    setBulletResult(null);
    try {
      const res = await fetch("/api/resume/rewrite-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original: bulletInput }),
      });
      if (res.ok) {
        const data = await res.json();
        setBulletResult(data);
      } else {
        const err = await res.json().catch(() => ({}));
        setBulletError(err.error ?? "Rewrite failed. Please try again.");
      }
    } catch {
      setBulletError("Network error — please try again.");
    } finally {
      setBulletLoading(false);
    }
  }

  async function copyBullet(text: string, idx: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  }

  const busy = uploadStep === "uploading" || uploadStep === "analyzing";
  const analyzedResumeIds = new Set(analyses.map((a) => a.resume.id));
  const unanalyzed = resumes.filter((r) => !analyzedResumeIds.has(r.id));

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Resume Analyzer</h1>
        <p className="text-slate-400 mt-2 text-base">Upload your resume and get an honest AI score against your target role.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("analyze")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "analyze" ? "bg-[#1a1b23] shadow-sm text-white" : "text-slate-400 hover:text-slate-300"}`}
        >
          Upload & Analyze
        </button>
        <button
          onClick={() => setTab("rewrite")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "rewrite" ? "bg-[#1a1b23] shadow-sm text-white" : "text-slate-400 hover:text-slate-300"}`}
        >
          ✦ Rewrite Bullets
        </button>
      </div>

      {tab === "rewrite" && (
        <div className="space-y-6">
          <div className="bg-[#161820] rounded-2xl border border-white/10 p-6 space-y-4">
            <div>
              <p className="font-bold text-white text-base">Paste a weak resume bullet</p>
              <p className="text-base text-slate-400 mt-0.5">Get 3 AI-rewritten versions with impact scores — copy the best one</p>
            </div>
            <Textarea
              value={bulletInput}
              onChange={(e) => setBulletInput(e.target.value)}
              placeholder="e.g. 'Worked on backend services for client application using Java and Spring Boot'"
              className="min-h-[100px] text-sm resize-none rounded-xl"
              disabled={bulletLoading}
            />
            {bulletError && (
              <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{bulletError}</p>
            )}
            <div className="flex justify-end">
              <Button onClick={rewriteBullet} disabled={bulletLoading || !bulletInput.trim()} className="gap-2 h-11 px-6">
                {bulletLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Rewriting...</> : <><Sparkles className="h-4 w-4" />Rewrite bullet</>}
              </Button>
            </div>
          </div>

          {bulletResult && (
            <div className="space-y-4">
              {/* Before / After score bar */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Impact score improvement</p>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700">Original</span>
                      <span className="text-sm font-bold text-red-600">{bulletResult.impactScoreBefore}/10</span>
                    </div>
                    <div className="h-2.5 bg-slate-50 border border-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${bulletResult.impactScoreBefore * 10}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-700">Best rewrite</span>
                      <span className="text-sm font-bold text-emerald-600">{bulletResult.impactScoreAfter}/10</span>
                    </div>
                    <div className="h-2.5 bg-slate-50 border border-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${bulletResult.impactScoreAfter * 10}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Original bullet */}
              <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">Before</p>
                <p className="text-sm text-slate-700 italic">&quot;{bulletInput}&quot;</p>
              </div>

              {/* Rewrites */}
              <div className="space-y-3">
                {bulletResult.rewrites.map((r, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-400 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Option {i + 1}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                            {r.impactScore}/10
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 leading-relaxed">&quot;{r.text}&quot;</p>
                        <p className="text-xs text-indigo-600 font-medium mt-2 flex items-start gap-1">
                          <Zap className="h-3 w-3 mt-0.5 shrink-0" />
                          {r.reasoning}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={copiedIdx === i ? "default" : "outline"}
                        className="shrink-0 h-8 gap-1.5"
                        onClick={() => copyBullet(r.text, i)}
                      >
                        {copiedIdx === i ? <><CheckCircle2 className="h-3.5 w-3.5" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="ghost" size="sm" className="text-slate-400" onClick={() => { setBulletResult(null); setBulletInput(""); }}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Rewrite another bullet
              </Button>
            </div>
          )}
        </div>
      )}

      {tab === "analyze" && (
        <>
      {/* Upload section — shows success card when done, form otherwise */}
      {uploadStep === "done" ? (
        <div className="bg-[#161820] rounded-2xl border border-emerald-500/20 p-8 shadow-sm text-center space-y-5">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">Analysis complete!</p>
            {latestScore !== null && (
              <p className="text-slate-400 mt-1 text-base">
                Your resume scored <span className={`font-bold ${latestScore >= 70 ? "text-emerald-400" : latestScore >= 50 ? "text-amber-400" : "text-red-400"}`}>{latestScore}/100</span> against your target role.
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
            <Link href="/gaps">
              <Button className="h-11 px-6 gap-2 font-semibold">
                View your gap report <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" className="h-11 px-6" onClick={() => { setUploadStep("idle"); setLatestScore(null); }}>
              Analyze another resume
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-[#161820] rounded-2xl border border-white/10 p-7 shadow-sm">
          <h2 className="text-lg font-bold mb-1">Upload a new resume</h2>
          <p className="text-sm text-slate-400 mb-5">PDF only · max 10MB · we extract the text and analyze it</p>
          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all mb-5 ${file ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"} ${busy ? "pointer-events-none opacity-60" : ""}`} htmlFor="resume-file">
            {file ? (
              <><FileText className="h-9 w-9 text-primary mb-2" /><span className="font-semibold">{file.name}</span><span className="text-sm text-slate-400 mt-1">{(file.size / 1024).toFixed(0)} KB · click to change</span></>
            ) : (
              <><Upload className="h-9 w-9 text-slate-400 mb-2" /><span className="font-semibold">Click to upload your resume</span><span className="text-sm text-slate-400 mt-1">PDF · max 10MB</span></>
            )}
            <input id="resume-file" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={busy} />
          </label>
          {busy && (
            <div className="flex items-center gap-2 text-sm mb-4 px-4 py-3 rounded-lg bg-indigo-50 text-indigo-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              {uploadStep === "uploading" ? "Uploading..." : "Analyzing with AI — this takes ~30 seconds..."}
            </div>
          )}
          <Button className="w-full h-11 gap-2 font-semibold" disabled={!file || busy} onClick={handleUploadAndAnalyze}>
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" />Processing...</> : <><Sparkles className="h-4 w-4" />Upload &amp; Analyze</>}
          </Button>
        </div>
      )}

      {/* Unanalyzed resumes */}
      {unanalyzed.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-slate-400">Uploaded but not analyzed</h2>
          {unanalyzed.map((r) => (
            <div key={r.id} className="bg-[#161820] rounded-xl border border-white/10 p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-sm">{r.fileName}</p>
                  <p className="text-xs text-slate-400">{(r.fileSize / 1024).toFixed(0)} KB</p>
                </div>
              </div>
              <Button size="sm" onClick={() => handleAnalyze(r.id)} disabled={analyzingId === r.id} className="gap-1.5 shrink-0">
                {analyzingId === r.id ? <><Loader2 className="h-3 w-3 animate-spin" />Analyzing...</> : <><Sparkles className="h-3 w-3" />Analyze</>}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Analysis results */}
      {analyses.length === 0 && unanalyzed.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent className="space-y-4">
            <Upload className="h-12 w-12 mx-auto text-slate-400" />
            <div>
              <p className="font-semibold text-lg">No resume uploaded yet</p>
              <p className="text-sm text-slate-400 mt-1">Upload your PDF above to see how you score against your target role.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{analysis.resume.fileName}</p>
                    <p className="text-sm text-slate-500">Analyzed {new Date(analysis.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-4xl font-black ${analysis.overallScore >= 70 ? "text-emerald-600" : analysis.overallScore >= 50 ? "text-amber-600" : "text-red-600"}`}>
                      {analysis.overallScore}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">/ 100</div>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6 space-y-6">
                <Progress value={analysis.overallScore} className="h-2" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  {[
                    { label: "Impact", value: analysis.impactScore },
                    { label: "Signal", value: analysis.keywordDensityScore },
                    { label: "Projects", value: analysis.projectComplexity },
                    { label: "Stories", value: Math.min(analysis.starStoriesCount * 10, 100) },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-slate-50 border border-slate-200 py-4">
                      <div className="text-2xl font-bold text-slate-900">{s.value}</div>
                      <div className="text-xs text-slate-500 font-medium mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 mb-2">Skills detected</p>
                  <div className="flex flex-wrap gap-2">
                    {(analysis.skillsFound as string[]).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>
                {plan === "PRO" && (analysis.weakBullets as WeakBullet[])?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-3">Top bullet rewrites</p>
                    <div className="space-y-3">
                      {(analysis.weakBullets as WeakBullet[]).slice(0, 3).map((b, i) => (
                        <div key={i} className="rounded-xl border border-slate-200 p-4 text-sm space-y-2 bg-slate-50">
                          <div className="text-slate-500 line-through">{b.original}</div>
                          <div className="text-emerald-600 font-medium">{b.rewrite}</div>
                          <div className="text-xs text-slate-500">Why: {b.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {plan === "FREE" && (
                  <div className="rounded-xl border border-dashed border-indigo-300 bg-indigo-50 p-5 text-center">
                    <p className="font-semibold text-sm text-indigo-700">Upgrade to see AI bullet rewrites</p>
                    <p className="text-xs text-indigo-600 mt-1">Pro unlocks full rewrites, unlimited analyses, and more.</p>
                    <Link href="/settings"><Button size="sm" className="mt-3 bg-indigo-600 hover:bg-indigo-700">Upgrade to Pro</Button></Link>
                  </div>
                )}
                <Link href="/gaps">
                  <Button className="w-full gap-2">View your gap report <ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}
