"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Kanban, Plus, X, ExternalLink, Loader2, Trophy, TrendingUp, Brain, AlertTriangle, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

type JobStatus = "saved" | "applied" | "recruiter_screen" | "technical" | "final_round" | "offer" | "rejected";

interface Job {
  id: string;
  company: string;
  roleTitle: string;
  status: JobStatus;
  jobUrl: string | null;
  salary: string | null;
  location: string | null;
  appliedAt: string | null;
  createdAt: string;
  keywordMatchPct: number | null;
  rawJd: string | null;
  // V2 fields
  source: string | null;
  rejectionStage: string | null;
  aiInsight: string | null;
  notes: string | null;
}

const COLUMNS: { status: JobStatus; label: string; color: string }[] = [
  { status: "saved", label: "Saved", color: "bg-white/10 text-slate-300" },
  { status: "applied", label: "Applied", color: "bg-blue-500/15 text-blue-400" },
  { status: "recruiter_screen", label: "Recruiter", color: "bg-blue-500/15 text-blue-400" },
  { status: "technical", label: "Technical", color: "bg-yellow-500/15 text-yellow-400" },
  { status: "final_round", label: "Final Round", color: "bg-amber-500/15 text-amber-400" },
  { status: "offer", label: "Offer", color: "bg-emerald-500/15 text-emerald-400" },
  { status: "rejected", label: "Rejected", color: "bg-red-500/15 text-red-400" },
];

const SOURCES = ["LinkedIn", "Referral", "Company website", "Cold outreach", "Job board", "Other"];

function AddJobDialog({ onClose, onAdded }: { onClose: () => void; onAdded: (job: Job) => void }) {
  const [form, setForm] = useState({ company: "", roleTitle: "", jobUrl: "", salary: "", location: "", rawJd: "", source: "" });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company || !form.roleTitle) return;
    setSaving(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "saved" }),
      });
      if (!res.ok) { toast.error("Failed to add job"); return; }
      const data = await res.json();
      onAdded(data.job ?? data);
      onClose();
      toast.success("Job added");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <Card className="w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Add Job</h2>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-base font-medium text-slate-700">Company *</Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Stripe"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-base font-medium text-slate-700">Role *</Label>
                <Input
                  value={form.roleTitle}
                  onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
                  placeholder="Software Engineer"
                  required
                  className="h-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-base font-medium text-slate-700">Job URL</Label>
              <Input
                value={form.jobUrl}
                onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
                placeholder="https://..."
                type="url"
                className="h-10"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-base font-medium text-slate-700">Salary (optional)</Label>
                <Input
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="$120k–$150k"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-base font-medium text-slate-700">Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Remote, NYC..."
                  className="h-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-base font-medium text-slate-700">Where did you find it?</Label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full h-10 text-base text-slate-900 border border-slate-300 rounded-md px-3 bg-white"
              >
                <option value="">Select source…</option>
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-base font-medium text-slate-700">Job Description (optional)</Label>
              <textarea
                value={form.rawJd}
                onChange={(e) => setForm({ ...form, rawJd: e.target.value })}
                placeholder="Paste the full job description here to enable AI match scoring..."
                className="w-full min-h-[100px] text-base text-slate-900 border border-slate-300 rounded-md px-3 py-2 bg-white placeholder:text-slate-400 resize-y"
              />
            </div>
            <Separator />
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : "Add Job"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

const INTERVIEW_STAGES: JobStatus[] = ["recruiter_screen", "technical", "final_round"];

const STAGE_LABEL: Record<string, string> = {
  saved: "before applying", applied: "at resume screen",
  recruiter_screen: "at recruiter screen", technical: "at technical round", final_round: "at final round",
};
const STAGE_ACTION: Record<string, { label: string; href: string }> = {
  saved:            { label: "Improve your resume",     href: "/resume"    },
  applied:          { label: "Improve your resume",     href: "/resume"    },
  recruiter_screen: { label: "Practice communication",  href: "/interview" },
  technical:        { label: "Practice system design",  href: "/interview" },
  final_round:      { label: "Practice leadership Q&A", href: "/interview" },
};

function RejectionPatternBanner({ jobs }: { jobs: Job[] }) {
  const rejected = jobs.filter(j => j.status === "rejected" && j.rejectionStage);
  if (rejected.length < 2) return null;

  const counts: Record<string, number> = {};
  for (const j of rejected) counts[j.rejectionStage!] = (counts[j.rejectionStage!] ?? 0) + 1;
  const [topStage, topCount] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] ?? [];
  if (!topStage || topCount < 2) return null;

  const action = STAGE_ACTION[topStage] ?? { label: "Review your roadmap", href: "/roadmap" };
  const latestInsight = rejected.find(j => j.rejectionStage === topStage && j.aiInsight)?.aiInsight;

  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
          <Brain className="h-4 w-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Pattern Detected</p>
          <p className="text-sm font-bold text-white">
            {topCount} rejection{topCount > 1 ? "s" : ""} {STAGE_LABEL[topStage] ?? "at the same stage"}
          </p>
          {latestInsight ? (
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">{latestInsight}</p>
          ) : (
            <p className="text-sm text-slate-400 mt-1">
              This pattern suggests a specific skill gap — NinetyDays is generating your coaching insight.
            </p>
          )}
          <Link href={action.href} className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
            {action.label} <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function OutcomeModal({
  company, newStatus, onSave, onSkip,
}: {
  company: string;
  newStatus: "offer" | "rejected";
  onSave: (note: string) => void;
  onSkip: () => void;
}) {
  const [note, setNote] = useState("");
  const isOffer = newStatus === "offer";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onSkip}>
      <div className="w-full max-w-md bg-[#161820] border border-white/10 rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className={`h-14 w-14 rounded-2xl mx-auto mb-3 flex items-center justify-center ${isOffer ? "bg-emerald-500/15" : "bg-slate-500/15"}`}>
            {isOffer ? <Trophy className="h-7 w-7 text-emerald-400" /> : <TrendingUp className="h-7 w-7 text-slate-400" />}
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isOffer ? `You got the offer at ${company}!` : "Every rejection is data"}
          </h2>
          <p className="text-slate-400 text-base mt-1.5 leading-relaxed">
            {isOffer
              ? "Congrats! Share what clicked — this helps you repeat it."
              : `You didn't get this one at ${company}. That's okay. What did you learn?`}
          </p>
        </div>
        <div className="space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isOffer
              ? "e.g. The system design prep on NinetyDays really helped. They loved my distributed systems project..."
              : "e.g. I struggled with the behavioral questions. Need more STAR story practice..."}
            rows={3}
            className="w-full text-base text-white bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 resize-none placeholder:text-slate-500 focus:outline-none focus:border-white/20"
          />
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1 text-slate-400" onClick={onSkip}>Skip</Button>
            <Button
              className={`flex-1 font-semibold ${isOffer ? "bg-emerald-500 hover:bg-emerald-400 text-white" : "bg-indigo-500 hover:bg-indigo-400 text-white"}`}
              onClick={() => onSave(note)}
            >
              {isOffer ? "Save win" : "Save reflection"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [matchingJobId, setMatchingJobId] = useState<string | null>(null);
  const [pendingOutcome, setPendingOutcome] = useState<{ jobId: string; company: string; newStatus: "offer" | "rejected" } | null>(null);

  const loadJobs = useCallback(async () => {
    const res = await fetch("/api/jobs");
    if (res.ok) {
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : (data.jobs ?? []));
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  async function checkJobMatch(job: Job) {
    if (!job.rawJd) return;
    setMatchingJobId(job.id);
    try {
      const res = await fetch("/api/job-match/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText: job.rawJd }),
      });
      if (res.ok) {
        const data = await res.json();
        const score = data.match.matchScore;
        // Update local state
        setJobs(prev => prev.map(j => j.id === job.id ? { ...j, keywordMatchPct: score } : j));
        // Persist to DB
        await fetch(`/api/jobs/${job.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keywordMatchPct: score }),
        });
        toast.success(`Match score: ${score}%`);
      } else {
        toast.error("Failed to analyze match");
      }
    } finally {
      setMatchingJobId(null);
    }
  }

  async function moveJob(jobId: string, newStatus: JobStatus) {
    const job = jobs.find((j) => j.id === jobId);
    const previousStatus = job?.status;
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: newStatus } : j));
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        previousStatus,           // for rejection stage recording
        appliedAt: newStatus === "applied" ? new Date().toISOString() : undefined,
      }),
    });
    if (newStatus === "rejected") {
      toast.info("Analyzing rejection pattern…", { duration: 3000 });
    }
    if ((newStatus === "offer" || newStatus === "rejected") && job && INTERVIEW_STAGES.includes(job.status)) {
      setPendingOutcome({ jobId, company: job.company, newStatus });
    }
  }

  async function saveOutcome(note: string) {
    if (!pendingOutcome) return;
    if (note.trim()) {
      await fetch(`/api/jobs/${pendingOutcome.jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: note }),
      });
      setJobs((prev) => prev.map((j) => j.id === pendingOutcome.jobId ? { ...j, notes: note } : j));
    }
    setPendingOutcome(null);
  }

  const grouped = COLUMNS.map((col) => ({
    ...col,
    jobs: jobs.filter((j) => j.status === col.status),
  }));

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {showAdd && (
        <AddJobDialog
          onClose={() => setShowAdd(false)}
          onAdded={(job) => setJobs((prev) => [job, ...prev])}
        />
      )}
      {pendingOutcome && (
        <OutcomeModal
          company={pendingOutcome.company}
          newStatus={pendingOutcome.newStatus}
          onSave={saveOutcome}
          onSkip={() => setPendingOutcome(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Applications</h1>
          <p className="text-slate-300 mt-1.5 text-xl leading-relaxed">
            {jobs.length} application{jobs.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Button className="gap-2 h-10" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Add job
        </Button>
      </div>

      {/* AI rejection pattern banner */}
      <RejectionPatternBanner jobs={jobs} />

      {jobs.length === 0 ? (
        <Card className="text-center py-20">
          <CardContent className="space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Kanban className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="text-xl font-semibold">No applications tracked yet</p>
              <p className="text-slate-300 mt-1 text-xl">
                Add jobs you&apos;re interested in and track them through each stage.
              </p>
            </div>
            <Button className="gap-2" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" />
              Add your first job
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ── Mobile: vertical grouped list ── */}
          <div className="md:hidden space-y-5">
            {grouped.filter((col) => col.jobs.length > 0).map((col) => (
              <div key={col.status}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-sm text-slate-400">{col.jobs.length}</span>
                </div>
                <div className="space-y-2">
                  {col.jobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-3 pb-3 px-3">
                        <p className="font-semibold text-base leading-tight">{job.company}</p>
                        <p className="text-base text-slate-300 mt-0.5 leading-tight">{job.roleTitle}</p>
                        {job.location && <p className="text-base text-slate-300 mt-1">{job.location}</p>}
                        {job.salary && <p className="text-sm font-medium text-primary mt-1">{job.salary}</p>}
                        {job.appliedAt && (
                          <p className="text-sm text-slate-400 mt-1">Applied {format(new Date(job.appliedAt), "MMM d")}</p>
                        )}
                        {job.keywordMatchPct !== null && job.keywordMatchPct !== undefined && (
                          <span className={`inline-block text-sm font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                            job.keywordMatchPct >= 70 ? "bg-emerald-500/15 text-emerald-400" :
                            job.keywordMatchPct >= 50 ? "bg-amber-500/15 text-amber-400" :
                            "bg-red-500/15 text-red-400"
                          }`}>
                            {job.keywordMatchPct}% match
                          </span>
                        )}
                        {!job.keywordMatchPct && job.rawJd && (
                          <button
                            onClick={(e) => { e.stopPropagation(); checkJobMatch(job); }}
                            disabled={matchingJobId === job.id}
                            className="text-sm text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1 mt-1.5"
                          >
                            {matchingJobId === job.id ? <><Loader2 className="h-3 w-3 animate-spin" />Analyzing...</> : "Check match →"}
                          </button>
                        )}
                        {job.status === "rejected" && job.aiInsight && (
                          <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <div className="flex items-start gap-1.5">
                              <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                              <p className="text-[10px] text-amber-300 leading-snug">{job.aiInsight}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          {job.jobUrl && (
                            <a href={job.jobUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </a>
                          )}
                          <select
                            value={job.status}
                            onChange={(e) => moveJob(job.id, e.target.value as JobStatus)}
                            className="text-sm border rounded px-1 py-0.5 bg-background flex-1 min-w-0"
                          >
                            {COLUMNS.map((c) => (
                              <option key={c.status} value={c.status}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Desktop: kanban ── */}
          <div className="hidden md:block overflow-x-auto -mx-4 px-4">
            <div className="flex gap-4 min-w-max pb-4">
              {grouped.map((col) => (
                <div key={col.status} className="w-56 shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="text-sm text-slate-400">{col.jobs.length}</span>
                  </div>
                  <div className="space-y-2">
                    {col.jobs.map((job) => (
                      <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-3 pb-3 px-3">
                          <p className="font-semibold text-base leading-tight">{job.company}</p>
                          <p className="text-base text-slate-300 mt-0.5 leading-tight">{job.roleTitle}</p>
                          {job.location && (
                            <p className="text-base text-slate-300 mt-1">{job.location}</p>
                          )}
                          {job.salary && (
                            <p className="text-sm font-medium text-primary mt-1">{job.salary}</p>
                          )}
                          {job.appliedAt && (
                            <p className="text-sm text-slate-400 mt-1">
                              Applied {format(new Date(job.appliedAt), "MMM d")}
                            </p>
                          )}
                          {job.keywordMatchPct !== null && job.keywordMatchPct !== undefined && (
                            <span className={`inline-block text-sm font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                              job.keywordMatchPct >= 70 ? "bg-emerald-500/15 text-emerald-400" :
                              job.keywordMatchPct >= 50 ? "bg-amber-500/15 text-amber-400" :
                              "bg-red-500/15 text-red-400"
                            }`}>
                              {job.keywordMatchPct}% match
                            </span>
                          )}
                          {!job.keywordMatchPct && job.rawJd && (
                            <button
                              onClick={(e) => { e.stopPropagation(); checkJobMatch(job); }}
                              disabled={matchingJobId === job.id}
                              className="text-sm text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1 mt-1.5"
                            >
                              {matchingJobId === job.id ? <><Loader2 className="h-3 w-3 animate-spin" />Analyzing...</> : "Check match →"}
                            </button>
                          )}
                          {job.status === "rejected" && job.aiInsight && (
                            <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                              <div className="flex items-start gap-1.5">
                                <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-300 leading-snug">{job.aiInsight}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                            {job.jobUrl && (
                              <a href={job.jobUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              </a>
                            )}
                            <select
                              value={job.status}
                              onChange={(e) => moveJob(job.id, e.target.value as JobStatus)}
                              className="text-sm border rounded px-1 py-0.5 bg-background flex-1 min-w-0"
                            >
                              {COLUMNS.map((c) => (
                                <option key={c.status} value={c.status}>{c.label}</option>
                              ))}
                            </select>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {col.jobs.length === 0 && (
                      <div className="border-2 border-dashed rounded-lg h-20 flex items-center justify-center">
                        <p className="text-sm text-slate-400">Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
