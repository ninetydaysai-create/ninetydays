"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { MilestoneShareBanner } from "@/components/shared/ShareProgressCard";
import {
  ArrowRight,
  Lock,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  TrendingUp,
  Zap,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  Target,
  BookOpen,
} from "lucide-react";

interface Task {
  id: string;
  label: string;
  description: string;
  whyItMatters: string | null;
  resourceUrls: string[];
  hours: number;
  impactScore: number;
  completed: boolean;
}

interface Week {
  id: string;
  weekNumber: number;
  theme: string;
  deliverable: string;
  deliverableDone: boolean;
  estimatedHours: number;
  tasks: Task[];
}

interface Roadmap {
  id: string;
  startedAt: string;
  totalWeeks: number;
}

interface UserPlan {
  plan: "FREE" | "PRO";
  name?: string | null;
  readinessScore?: number | null;
  roleLabel?: string;
  weeksOnPlatform?: number;
  hoursPerWeek?: number;
  targetTimeline?: string | null;
  targetCompanyType?: string | null;
  learningStyle?: string | null;
}

const FREE_WEEKS_VISIBLE = 4;

const PHASES = [
  { label: "Phase 1", name: "Foundations", weeks: [1, 2, 3, 4], color: "blue", gradient: "from-blue-500 to-indigo-500" },
  { label: "Phase 2", name: "Real Skills", weeks: [5, 6, 7, 8], color: "indigo", gradient: "from-indigo-500 to-blue-600" },
  { label: "Phase 3", name: "Market Ready", weeks: [9, 10, 11, 12], color: "emerald", gradient: "from-emerald-500 to-emerald-600" },
];

const PHASE_COLORS = {
  blue: {
    header: "bg-blue-500/10 border-blue-500/20",
    badge: "bg-blue-500/15 text-blue-400",
    dot: "bg-blue-500",
    ring: "ring-blue-500/20",
    current: "border-blue-400 shadow-blue-500/10",
    bar: "bg-blue-500",
  },
  indigo: {
    header: "bg-indigo-500/10 border-indigo-500/20",
    badge: "bg-indigo-500/15 text-indigo-400",
    dot: "bg-indigo-500",
    ring: "ring-indigo-500/20",
    current: "border-indigo-400 shadow-indigo-500/10",
    bar: "bg-indigo-500",
  },
  emerald: {
    header: "bg-emerald-500/10 border-emerald-500/20",
    badge: "bg-emerald-500/15 text-emerald-400",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/20",
    current: "border-emerald-400 shadow-emerald-500/10",
    bar: "bg-emerald-500",
  },
};

function getPhaseForWeek(weekNumber: number) {
  return PHASES.find((p) => p.weeks.includes(weekNumber)) ?? PHASES[0];
}

function getDomainLabel(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    // Map common domains to friendly labels
    const map: Record<string, string> = {
      "youtube.com": "YouTube",
      "youtu.be": "YouTube",
      "github.com": "GitHub",
      "arxiv.org": "arXiv Paper",
      "huggingface.co": "HuggingFace",
      "docs.python.org": "Python Docs",
      "pytorch.org": "PyTorch Docs",
      "tensorflow.org": "TensorFlow",
      "kaggle.com": "Kaggle",
      "medium.com": "Medium",
      "towardsdatascience.com": "Towards DS",
      "coursera.org": "Coursera",
      "fast.ai": "fast.ai",
      "deeplearning.ai": "DeepLearning.AI",
      "openai.com": "AI Research",
      "anthropic.com": "AI Research",
      "langchain.com": "LangChain",
    };
    return map[host] ?? host;
  } catch {
    return "Resource";
  }
}

export default function RoadmapPage() {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [readinessBump, setReadinessBump] = useState<{ label: string; prev: number; next: number } | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());
  const [weekCompleteBanner, setWeekCompleteBanner] = useState<{ weekNumber: number } | null>(null);

  const loadData = useCallback(async () => {
    const [roadmapRes, planRes] = await Promise.all([
      fetch("/api/roadmap"),
      fetch("/api/user/plan"),
    ]);
    if (roadmapRes.ok) {
      const data = await roadmapRes.json();
      setRoadmap(data.roadmap ?? null);
      const weeksData: Week[] = data.weeks ?? [];
      setWeeks(weeksData);
      // Auto-expand current week and first incomplete week
      if (weeksData.length > 0) {
        const startedAt = data.roadmap?.startedAt ? new Date(data.roadmap.startedAt).getTime() : Date.now();
        const currentWeekNum = Math.min(
          Math.ceil((Date.now() - startedAt) / (7 * 24 * 60 * 60 * 1000)) + 1,
          12
        );
        const defaultOpen = new Set<string>();
        const currentWeek = weeksData.find((w) => w.weekNumber === currentWeekNum);
        if (currentWeek) defaultOpen.add(currentWeek.id);
        // Also expand first incomplete week if different
        const firstIncomplete = weeksData.find((w) => w.tasks.some((t) => !t.completed));
        if (firstIncomplete) defaultOpen.add(firstIncomplete.id);
        setExpandedWeeks(defaultOpen);
      }
    }
    if (planRes.ok) {
      const data = await planRes.json();
      setUserPlan(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function toggleExpand(weekId: string) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekId)) next.delete(weekId);
      else next.add(weekId);
      return next;
    });
  }

  async function toggleTask(taskId: string, currentCompleted: boolean, taskLabel: string, impactScore: number, weekNumber: number) {
    setToggling(taskId);
    const res = await fetch(`/api/roadmap/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !currentCompleted }),
    });
    if (res.ok) {
      const data = await res.json();
      setWeeks((prev) => {
        const updated = prev.map((w) => ({
          ...w,
          tasks: w.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !currentCompleted } : t
          ),
        }));
        // Check if this task just completed a week
        if (!currentCompleted) {
          const week = updated.find((w) => w.weekNumber === weekNumber);
          if (week && week.tasks.length > 0 && week.tasks.every((t) => t.completed)) {
            setWeekCompleteBanner({ weekNumber });
          }
        }
        return updated;
      });
      if (!currentCompleted && data.newReadiness !== null && data.newReadiness !== undefined) {
        const prev = data.newReadiness - Math.round(impactScore / 2);
        setReadinessBump({ label: taskLabel, prev, next: data.newReadiness });
        setTimeout(() => setReadinessBump(null), 4000);
      }
    }
    setToggling(null);
  }

  async function generateRoadmap() {
    setGenerating(true);
    try {
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "Failed to generate roadmap. Please try again.");
      }
    } catch {
      alert("Network error — please try again.");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const allTasks = weeks.flatMap((w) => w.tasks);
  const doneTasks = allTasks.filter((t) => t.completed).length;
  const pct = allTasks.length ? Math.round((doneTasks / allTasks.length) * 100) : 0;

  const currentWeek = roadmap
    ? Math.min(
        Math.ceil(
          (Date.now() - new Date(roadmap.startedAt).getTime()) / (7 * 24 * 60 * 60 * 1000)
        ) + 1,
        12
      )
    : 1;

  const visibleWeeks = userPlan?.plan === "PRO" ? 12 : FREE_WEEKS_VISIBLE;

  if (!roadmap || weeks.length === 0) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">90-Day Roadmap</h1>
          <p className="text-slate-400 mt-2 text-base">Your personalized week-by-week plan to get hired in AI.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#161820] overflow-hidden">
          {/* Top section */}
          <div className="text-center py-12 px-8 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-white">Your 90-Day Hiring Plan</p>
              <p className="text-slate-400 mt-2 max-w-sm mx-auto text-base leading-relaxed">
                We map every gap in your resume to a specific task — so you always know exactly what to do next.
              </p>
            </div>

            {/* Outcome preview */}
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto pt-2">
              {[
                { label: "Week 1–2", desc: "Fix resume + close top gaps" },
                { label: "Week 3–8", desc: "Build portfolio + apply" },
                { label: "Week 9–12", desc: "Interview prep + offers" },
              ].map(({ label, desc }) => (
                <div key={label} className="bg-white/5 rounded-xl p-3 text-left">
                  <p className="text-xs font-bold text-indigo-400">{label}</p>
                  <p className="text-xs text-slate-300 mt-1 leading-tight">{desc}</p>
                </div>
              ))}
            </div>

            {/* Loading steps when generating */}
            {generating ? (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-5 py-4 max-w-xs mx-auto space-y-2 text-left mt-2">
                <p className="text-sm font-semibold text-indigo-300 mb-3">Building your hiring roadmap…</p>
                {[
                  { label: "Analyzing your gaps", done: true },
                  { label: "Mapping learning plan", done: true },
                  { label: "Creating weekly tasks", done: false },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    {done
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      : <Loader2 className="h-4 w-4 animate-spin text-indigo-400 shrink-0" />}
                    <span className={done ? "text-slate-300" : "text-indigo-400"}>{label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Link href="/gaps">
                  <Button variant="outline" className="gap-2">
                    View gap analysis <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button onClick={generateRoadmap} disabled={generating} className="gap-2 min-w-[220px] h-11 font-bold">
                  <Sparkles className="h-4 w-4" />Generate my 90-day plan
                </Button>
              </div>
            )}
          </div>

          {/* Transformation hook */}
          <div className="border-t border-white/8 bg-white/3 px-8 py-5 text-center">
            <p className="text-sm text-slate-300">
              Users who follow their plan go from <span className="text-white font-semibold">avg. 31 → 72 score</span> and land interviews in <span className="text-white font-semibold">8–10 weeks</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Week complete milestone banner */}
      {weekCompleteBanner && userPlan?.readinessScore != null && (
        <MilestoneShareBanner
          trigger="week_complete"
          weekNumber={weekCompleteBanner.weekNumber}
          readinessScore={userPlan.readinessScore}
          weeksOnPlatform={userPlan.weeksOnPlatform ?? 1}
          roleLabel={userPlan.roleLabel ?? "your target role"}
          userName={userPlan.name ?? null}
          onDismiss={() => setWeekCompleteBanner(null)}
        />
      )}

      {/* Readiness bump toast */}
      {readinessBump && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white rounded-2xl px-5 py-4 shadow-xl shadow-emerald-500/30 flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <TrendingUp className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold text-sm">Readiness improved!</p>
            <p className="text-emerald-100 text-xs">{readinessBump.prev}% → <span className="font-bold text-white">{readinessBump.next}%</span> · {readinessBump.label}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="text-3xl font-bold text-white">90-Day Roadmap</h1>
            <p className="text-slate-300 mt-1 text-base">Generated from your resume · every task targets a gap in your profile</p>
          </div>
          <Badge variant="outline" className="shrink-0 text-sm px-3 py-1.5 font-semibold border-white/15 text-slate-300">
            Week {currentWeek} / 12
          </Badge>
        </div>

        {/* Personalization context strip */}
        {userPlan && (userPlan.targetTimeline || userPlan.targetCompanyType || userPlan.hoursPerWeek) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {userPlan.hoursPerWeek && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                <Clock className="h-3 w-3 text-slate-400" />
                {userPlan.hoursPerWeek}h / week
              </span>
            )}
            {userPlan.targetTimeline && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                <Target className="h-3 w-3 text-slate-400" />
                {userPlan.targetTimeline === "3_months" ? "3-month sprint" : userPlan.targetTimeline === "6_months" ? "6-month plan" : "12-month plan"}
              </span>
            )}
            {userPlan.targetCompanyType && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                <Zap className="h-3 w-3 text-slate-400" />
                {userPlan.targetCompanyType === "faang" ? "FAANG track" : userPlan.targetCompanyType === "funded_startup" ? "Startup track" : "Product co track"}
              </span>
            )}
            {userPlan.learningStyle && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                <BookOpen className="h-3 w-3 text-slate-400" />
                {userPlan.learningStyle === "projects" ? "Project-focused" : userPlan.learningStyle === "courses" ? "Course-focused" : userPlan.learningStyle === "docs" ? "Docs-focused" : "Mixed learning"}
              </span>
            )}
          </div>
        )}

        {/* Overall progress */}
        <div className="bg-[#161820] rounded-2xl border border-white/10 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-2xl font-black text-white">{pct}%</span>
              <span className="text-slate-300 text-base ml-2">complete</span>
            </div>
            <span className="text-base text-slate-300">{doneTasks} / {allTasks.length} tasks done</span>
          </div>
          <Progress value={pct} className="h-3 rounded-full" />
          <div className="flex gap-4 mt-4">
            {PHASES.map((phase) => {
              const phaseWeeks = weeks.filter((w) => phase.weeks.includes(w.weekNumber));
              const phaseTasks = phaseWeeks.flatMap((w) => w.tasks);
              const phaseDone = phaseTasks.filter((t) => t.completed).length;
              const phasePct = phaseTasks.length ? Math.round((phaseDone / phaseTasks.length) * 100) : 0;
              const colors = PHASE_COLORS[phase.color as keyof typeof PHASE_COLORS];
              return (
                <div key={phase.label} className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-slate-300">{phase.label}</span>
                    <span className="text-sm font-bold text-slate-300">{phasePct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors.bar} transition-all`} style={{ width: `${phasePct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Phase groups */}
      {PHASES.map((phase) => {
        const phaseWeeks = weeks.filter((w) => phase.weeks.includes(w.weekNumber));
        if (phaseWeeks.length === 0) return null;
        const colors = PHASE_COLORS[phase.color as keyof typeof PHASE_COLORS];

        return (
          <div key={phase.label} className="space-y-3">
            {/* Phase header */}
            <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${colors.header}`}>
              <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${colors.dot}`} />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-white text-base">{phase.label} — {phase.name}</span>
                <span className="text-slate-300 text-sm ml-2">Week {phase.weeks[0]}–{phase.weeks[phase.weeks.length - 1]}</span>
              </div>
              <Badge className={`text-sm font-semibold ${colors.badge} border-0 px-3 py-1`}>
                {phaseWeeks.filter((w) => w.deliverableDone).length}/{phaseWeeks.length} weeks done
              </Badge>
            </div>

            {/* Week cards */}
            {phaseWeeks.map((week) => {
              const isLocked = week.weekNumber > visibleWeeks;
              const isCurrent = week.weekNumber === currentWeek;
              const isExpanded = expandedWeeks.has(week.id);
              const weekDoneTasks = week.tasks.filter((t) => t.completed).length;
              const weekPct = week.tasks.length ? Math.round((weekDoneTasks / week.tasks.length) * 100) : 0;
              const allWeekDone = weekDoneTasks === week.tasks.length && week.tasks.length > 0;

              return (
                <div
                  key={week.id}
                  className={`bg-[#161820] rounded-2xl border transition-all ${
                    isCurrent
                      ? `border-2 ${colors.current} shadow-md`
                      : allWeekDone
                      ? "border-white/8 opacity-75"
                      : "border-white/10 shadow-sm"
                  }`}
                >
                  {/* Week header — always visible, clickable */}
                  <button
                    className="w-full text-left px-5 py-4 flex items-center gap-4"
                    onClick={() => !isLocked && toggleExpand(week.id)}
                    disabled={isLocked}
                  >
                    {/* Week number circle */}
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                      allWeekDone
                        ? "bg-emerald-500/15 text-emerald-400"
                        : isCurrent
                        ? `bg-gradient-to-br ${phase.gradient} text-white shadow-sm`
                        : "bg-white/5 text-slate-400"
                    }`}>
                      {allWeekDone ? <CheckCircle2 className="h-5 w-5" /> : week.weekNumber}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {isCurrent && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-gradient-to-r ${phase.gradient} text-white`}>
                            Current week
                          </span>
                        )}
                        {allWeekDone && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                            Complete
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-white text-base leading-tight">{week.theme}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex-1 max-w-[140px] h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors.bar} transition-all`}
                            style={{ width: `${weekPct}%` }}
                          />
                        </div>
                        <span className="text-sm text-slate-300">{weekDoneTasks}/{week.tasks.length} tasks · {week.estimatedHours}h</span>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isLocked ? (
                        <Lock className="h-4 w-4 text-slate-300" />
                      ) : isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Expanded content */}
                  {!isLocked && isExpanded && (
                    <div className="px-5 pb-5 space-y-3 border-t border-white/8 pt-4">
                      {week.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={`rounded-xl border cursor-pointer transition-all group ${
                            task.completed
                              ? "bg-slate-50 border-slate-200 opacity-70"
                              : "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-sm"
                          }`}
                          onClick={() => !toggling && toggleTask(task.id, task.completed, task.label, task.impactScore, week.weekNumber)}
                        >
                          <div className="p-5">
                            <div className="flex items-start gap-3">
                              {/* Checkbox */}
                              <div className="mt-0.5 shrink-0">
                                {toggling === task.id ? (
                                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                                ) : task.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                ) : (
                                  <Circle className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                {/* Title row */}
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-base font-bold leading-snug ${
                                    task.completed ? "line-through text-slate-400" : "text-slate-900"
                                  }`}>
                                    {task.label}
                                  </p>
                                  {/* Impact badge */}
                                  {!task.completed && task.impactScore >= 7 && (
                                    <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center gap-1 whitespace-nowrap">
                                      <TrendingUp className="h-3 w-3" />
                                      +{Math.round(task.impactScore / 2)}% readiness
                                    </span>
                                  )}
                                </div>

                                {!task.completed && (
                                  <>
                                    <p className="text-base text-slate-700 mt-2 leading-relaxed">
                                      {task.description}
                                    </p>

                                    {/* Why it matters */}
                                    {task.whyItMatters && (
                                      <div className="flex items-start gap-2 mt-2.5 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2.5">
                                        <Zap className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                                        <p className="text-sm text-indigo-700 font-medium leading-snug">
                                          {task.whyItMatters}
                                        </p>
                                      </div>
                                    )}

                                    {/* Meta row */}
                                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                                        <Clock className="h-3.5 w-3.5" />
                                        {task.hours}h estimated
                                      </span>
                                      {task.impactScore > 0 && (
                                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                                          <Target className="h-3.5 w-3.5" />
                                          Impact: {task.impactScore}/10
                                        </span>
                                      )}
                                    </div>

                                    {/* Resources */}
                                    {task.resourceUrls?.length > 0 && (
                                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                                        <BookOpen className="h-4 w-4 text-slate-500 shrink-0" />
                                        {task.resourceUrls.slice(0, 3).map((url, i) => (
                                          <a
                                            key={i}
                                            href={url}
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-lg transition-colors"
                                          >
                                            {getDomainLabel(url)}
                                            <ExternalLink className="h-3 w-3" />
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Deliverable */}
                      <div className={`rounded-xl border-2 border-dashed p-4 mt-2 ${
                        week.deliverableDone
                          ? "border-emerald-500/30 bg-emerald-500/10"
                          : "border-white/15 bg-white/5"
                      }`}>
                        <div className="flex items-start gap-2">
                          {week.deliverableDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Target className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                              Week Deliverable
                            </p>
                            <p className={`text-base font-medium leading-snug ${week.deliverableDone ? "text-emerald-400" : "text-slate-300"}`}>
                              {week.deliverable}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Locked upgrade prompt */}
                  {isLocked && (
                    <div className="px-5 pb-4 pt-1">
                      <Link href="/settings">
                        <Button size="sm" variant="outline" className="gap-2 text-xs h-8 border-white/15 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-400">
                          <Lock className="h-3 w-3" />
                          Upgrade to unlock weeks {week.weekNumber}–12
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
