"use client";

import { useEffect, useState, useTransition } from "react";
import { Target, Loader2, CheckCircle2, ChevronUp, ChevronDown, Zap } from "lucide-react";
import { toast } from "sonner";

// ─── Focus areas ──────────────────────────────────────────────────────────────

const FOCUS_AREAS = [
  { key: "interview",     label: "Interview Skills",    sub: "Mock interviews, STAR stories, communication",  color: "border-purple-500/40 bg-purple-500/10 text-purple-300" },
  { key: "resume",        label: "Resume & Writing",    sub: "Impact bullets, ATS score, ownership language",  color: "border-blue-500/40 bg-blue-500/10 text-blue-300"       },
  { key: "system_design", label: "System Design",       sub: "Architecture, scalability, problem solving",     color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"},
  { key: "product",       label: "Product Thinking",    sub: "Business thinking, product sense, metrics",      color: "border-amber-500/40 bg-amber-500/10 text-amber-300"    },
  { key: "ai",            label: "AI & ML Knowledge",   sub: "AI concepts, ML fundamentals, LLM literacy",     color: "border-pink-500/40 bg-pink-500/10 text-pink-300"       },
] as const;

const STAGES = [
  { key: "not_applying",       label: "Preparing",          sub: "Not applying yet — building skills" },
  { key: "applying",           label: "Applying",            sub: "Sending applications, no interviews yet" },
  { key: "getting_interviews", label: "Getting Interviews",  sub: "Getting calls, working on conversion" },
  { key: "final_rounds",       label: "Final Rounds",        sub: "In final rounds at companies" },
] as const;

const TIMELINES = [
  { key: "3_months",  label: "3 months",  sub: "Aggressive sprint" },
  { key: "6_months",  label: "6 months",  sub: "Focused & steady"  },
  { key: "12_months", label: "12 months", sub: "Long game"          },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

interface GoalState {
  targetRoleTitle: string;
  targetCompany: string;
  targetSalary: string;
  targetLocation: string;
  targetTimeline: string;
  hoursPerWeek: string;
  currentStage: string;
  needsVisa: boolean;
  priority: string[];         // ordered focus area keys
  careerGoal: string;
}

const EMPTY: GoalState = {
  targetRoleTitle: "", targetCompany: "", targetSalary: "",
  targetLocation: "", targetTimeline: "6_months", hoursPerWeek: "10",
  currentStage: "not_applying", needsVisa: false,
  priority: [], careerGoal: "",
};

// ─── Subcomponents ────────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
        <Icon className="h-4.5 w-4.5 text-indigo-400" />
      </div>
      <div>
        <p className="font-bold text-white text-base">{title}</p>
        <p className="text-sm text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

// ─── Priority selector ────────────────────────────────────────────────────────

function PrioritySelector({ priority, onChange }: { priority: string[]; onChange: (p: string[]) => void }) {
  function toggle(key: string) {
    if (priority.includes(key)) {
      onChange(priority.filter(k => k !== key));
    } else {
      onChange([...priority, key]);
    }
  }

  function move(key: string, dir: -1 | 1) {
    const idx = priority.indexOf(key);
    if (idx === -1) return;
    const next = [...priority];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-2">
      {FOCUS_AREAS.map(area => {
        const rank = priority.indexOf(area.key);
        const selected = rank !== -1;
        return (
          <div key={area.key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
            selected ? area.color : "border-white/[0.07] bg-white/[0.02] text-slate-400"
          }`} onClick={() => toggle(area.key)}>
            {/* Rank badge */}
            <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 font-black text-sm ${
              selected ? "bg-white/20 text-white" : "bg-white/[0.05] text-slate-600"
            }`}>
              {selected ? rank + 1 : "—"}
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${selected ? "" : "text-slate-400"}`}>{area.label}</p>
              <p className="text-[11px] text-slate-500 truncate">{area.sub}</p>
            </div>

            {/* Reorder buttons (only when selected) */}
            {selected && (
              <div className="flex flex-col gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => move(area.key, -1)}
                  disabled={rank === 0}
                  className="h-4 w-4 rounded flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button
                  onClick={() => move(area.key, 1)}
                  disabled={rank === priority.length - 1}
                  className="h-4 w-4 rounded flex items-center justify-center hover:bg-white/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
      <p className="text-[11px] text-slate-600 pt-1">
        Click to select · drag the arrows to reorder · first = highest priority
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GoalPage() {
  const [goal, setGoal] = useState<GoalState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [isPending, start] = useTransition();

  useEffect(() => {
    Promise.all([
      fetch("/api/career-profile").then(r => r.json()),
      fetch("/api/user/plan").then(r => r.json()),
    ]).then(([profileData, planData]) => {
      const p = profileData.profile;
      const u = planData;
      if (p || u) {
        setGoal(prev => ({
          ...prev,
          targetRoleTitle: p?.targetRoleTitle ?? "",
          targetCompany:   (p?.targetCompanies as string[])?.[0] ?? "",
          targetSalary:    p?.targetSalary ?? "",
          targetLocation:  p?.targetLocation ?? "",
          careerGoal:      p?.careerGoal ?? "",
          priority:        (p?.priority as string[]) ?? [],
          currentStage:    p?.currentStage ?? "not_applying",
          needsVisa:       p?.needsVisa ?? false,
          targetTimeline:  u?.targetTimeline ?? "6_months",
          hoursPerWeek:    u?.hoursPerWeek?.toString() ?? "10",
        }));
      }
    }).finally(() => setLoading(false));
  }, []);

  function set<K extends keyof GoalState>(key: K, val: GoalState[K]) {
    setGoal(p => ({ ...p, [key]: val }));
  }

  function save() {
    start(async () => {
      const [profileRes, userRes] = await Promise.all([
        fetch("/api/career-profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetRoleTitle: goal.targetRoleTitle || null,
            targetCompanies: goal.targetCompany ? [goal.targetCompany] : [],
            targetSalary:    goal.targetSalary   || null,
            targetLocation:  goal.targetLocation  || null,
            careerGoal:      goal.careerGoal      || null,
            priority:        goal.priority,
            currentStage:    goal.currentStage    || null,
            needsVisa:       goal.needsVisa,
          }),
        }),
        fetch("/api/user/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            targetTimeline: goal.targetTimeline,
            hoursPerWeek:   parseInt(goal.hoursPerWeek) || 10,
          }),
        }),
      ]);

      if (profileRes.ok) {
        toast.success("Goal saved — your entire roadmap just updated.");
      } else {
        toast.error("Save failed — try again.");
      }
      // Log user preferences update failure silently (non-critical)
      if (!userRes.ok) console.warn("preferences PATCH failed");
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25">
          <Target className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Your Goal</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            The more specific you are, the better NinetyDays coaches you.
            Everything — daily challenges, AI mentor, company readiness — adapts to this.
          </p>
        </div>
      </div>

      {/* Impact callout */}
      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-5 py-4 flex items-start gap-3">
        <Zap className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-sm text-indigo-300 leading-relaxed">
          <span className="font-bold">This is the brain of your career OS.</span> Your daily challenges will prioritize your stated focus. Your AI Mentor will reference your target company and timeline. Your company readiness scores will surface your primary target first.
        </p>
      </div>

      {/* Where you're headed */}
      <Card>
        <SectionHeader icon={Target} title="Where You're Headed" sub="Be as specific as possible" />
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Specific Role Title</label>
              <input value={goal.targetRoleTitle} onChange={e => set("targetRoleTitle", e.target.value)}
                placeholder="e.g. Senior AI Product Manager" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Primary Target Company</label>
              <input value={goal.targetCompany} onChange={e => set("targetCompany", e.target.value)}
                placeholder="e.g. Google, Notion, Stripe" className={inputCls} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Target Salary</label>
              <input value={goal.targetSalary} onChange={e => set("targetSalary", e.target.value)}
                placeholder="e.g. $180k–$220k" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Location / Remote</label>
              <input value={goal.targetLocation} onChange={e => set("targetLocation", e.target.value)}
                placeholder="e.g. San Francisco or Remote" className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Career Goal (in your own words)</label>
            <textarea value={goal.careerGoal} onChange={e => set("careerGoal", e.target.value)}
              placeholder="e.g. Transition from iOS Engineer to AI PM at a Series B startup within 6 months"
              rows={2} className={`${inputCls} resize-none`} />
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card>
        <SectionHeader icon={Target} title="Your Timeline" sub="Sets the pace of your 90-day plan" />
        <div className="grid grid-cols-3 gap-3 mb-5">
          {TIMELINES.map(t => (
            <button key={t.key} onClick={() => set("targetTimeline", t.key)}
              className={`p-3 rounded-xl border text-left transition-all ${
                goal.targetTimeline === t.key
                  ? "border-indigo-500/50 bg-indigo-500/10 text-white"
                  : "border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/20"
              }`}>
              <p className="font-bold text-sm">{t.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{t.sub}</p>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Weekly Hours Available</label>
            <input type="number" min="1" max="40" value={goal.hoursPerWeek}
              onChange={e => set("hoursPerWeek", e.target.value)} className={inputCls} />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Visa Sponsorship Needed?</label>
            <button onClick={() => set("needsVisa", !goal.needsVisa)}
              className={`w-full h-[42px] rounded-xl border font-semibold text-sm transition-all ${
                goal.needsVisa
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  : "border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/20"
              }`}>
              {goal.needsVisa ? "Yes — I need visa sponsorship" : "No — I don't need visa"}
            </button>
          </div>
        </div>
      </Card>

      {/* Current stage */}
      <Card>
        <SectionHeader icon={Target} title="Current Stage" sub="Where are you in your job search right now?" />
        <div className="grid grid-cols-2 gap-3">
          {STAGES.map(s => (
            <button key={s.key} onClick={() => set("currentStage", s.key)}
              className={`p-3 rounded-xl border text-left transition-all ${
                goal.currentStage === s.key
                  ? "border-indigo-500/50 bg-indigo-500/10 text-white"
                  : "border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/20"
              }`}>
              <p className="font-bold text-sm">{s.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{s.sub}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Focus priority */}
      <Card>
        <SectionHeader icon={Target} title="What to Focus On" sub="Click to select · arrows to reorder · first = top priority" />
        <PrioritySelector priority={goal.priority} onChange={p => set("priority", p)} />
      </Card>

      {/* Save */}
      <button onClick={save} disabled={isPending}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 disabled:opacity-50 text-white font-bold text-base flex items-center justify-center gap-2 transition-opacity shadow-lg shadow-indigo-500/25">
        {isPending
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving your goal…</>
          : <><CheckCircle2 className="h-4 w-4" /> Save Goal — Update My Roadmap</>}
      </button>
    </div>
  );
}
