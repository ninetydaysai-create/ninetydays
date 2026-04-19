"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Kanban, Plus, X, ExternalLink, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

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

function AddJobDialog({ onClose, onAdded }: { onClose: () => void; onAdded: (job: Job) => void }) {
  const [form, setForm] = useState({ company: "", roleTitle: "", jobUrl: "", salary: "", location: "", rawJd: "" });
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
            <h2 className="text-xl font-semibold">Add Job</h2>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Company *</Label>
                <Input
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="Stripe"
                  required
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Role *</Label>
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
              <Label className="text-sm font-medium">Job URL</Label>
              <Input
                value={form.jobUrl}
                onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
                placeholder="https://..."
                type="url"
                className="h-10"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Salary (optional)</Label>
                <Input
                  value={form.salary}
                  onChange={(e) => setForm({ ...form, salary: e.target.value })}
                  placeholder="$120k–$150k"
                  className="h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Location</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Remote, NYC..."
                  className="h-10"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Job Description (optional)</Label>
              <textarea
                value={form.rawJd}
                onChange={(e) => setForm({ ...form, rawJd: e.target.value })}
                placeholder="Paste the full job description here to enable AI match scoring..."
                className="w-full min-h-[100px] text-sm border rounded-md px-3 py-2 bg-background resize-y"
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [matchingJobId, setMatchingJobId] = useState<string | null>(null);

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
    setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, status: newStatus } : j));
    await fetch(`/api/jobs/${jobId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, appliedAt: newStatus === "applied" ? new Date().toISOString() : undefined }),
    });
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

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Tracker</h1>
          <p className="text-slate-400 mt-1.5 text-base leading-relaxed">
            {jobs.length} application{jobs.length !== 1 ? "s" : ""} tracked
          </p>
        </div>
        <Button className="gap-2 h-10" onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" />
          Add job
        </Button>
      </div>

      {jobs.length === 0 ? (
        <Card className="text-center py-20">
          <CardContent className="space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Kanban className="h-8 w-8 text-slate-400" />
            </div>
            <div>
              <p className="text-lg font-semibold">No applications tracked yet</p>
              <p className="text-slate-400 mt-1 text-base">
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
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-4 min-w-max pb-4">
            {grouped.map((col) => (
              <div key={col.status} className="w-56 shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="text-xs text-slate-400">{col.jobs.length}</span>
                </div>
                <div className="space-y-2">
                  {col.jobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-3 pb-3 px-3">
                        <p className="font-semibold text-sm leading-tight">{job.company}</p>
                        <p className="text-xs text-slate-400 mt-0.5 leading-tight">{job.roleTitle}</p>
                        {job.location && (
                          <p className="text-xs text-slate-400 mt-1">{job.location}</p>
                        )}
                        {job.salary && (
                          <p className="text-xs font-medium text-primary mt-1">{job.salary}</p>
                        )}
                        {job.appliedAt && (
                          <p className="text-xs text-slate-400 mt-1">
                            Applied {format(new Date(job.appliedAt), "MMM d")}
                          </p>
                        )}
                        {/* Match score badge */}
                        {job.keywordMatchPct !== null && job.keywordMatchPct !== undefined && (
                          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-1.5 ${
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
                            className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1 mt-1.5"
                          >
                            {matchingJobId === job.id ? <><Loader2 className="h-3 w-3 animate-spin" />Analyzing...</> : "Check match →"}
                          </button>
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
                            className="text-xs border rounded px-1 py-0.5 bg-background flex-1 min-w-0"
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
                      <p className="text-xs text-slate-400">Empty</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
