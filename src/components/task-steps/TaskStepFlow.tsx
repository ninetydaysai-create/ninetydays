"use client";

import { useEffect, useState, useTransition } from "react";
import { TaskMentor } from "@/components/task-steps/TaskMentor";
import {
  Lightbulb, BookOpen, Layers, PenLine, HelpCircle, Award,
  CheckCircle2, ChevronRight, Loader2, AlertTriangle, Sparkles,
} from "lucide-react";

// ─── Beautiful loading skeleton ───────────────────────────────────────────────

const LOADING_STEPS = [
  { icon: Lightbulb,  label: "Why It Matters",  color: "text-amber-400",   bg: "bg-amber-500/10"   },
  { icon: BookOpen,   label: "Lesson",            color: "text-blue-400",    bg: "bg-blue-500/10"    },
  { icon: Layers,     label: "Example Gallery",  color: "text-violet-400",  bg: "bg-violet-500/10"  },
  { icon: PenLine,    label: "Practice",          color: "text-indigo-400",  bg: "bg-indigo-500/10"  },
  { icon: HelpCircle, label: "Quiz",              color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: Award,      label: "Deliverable",       color: "text-orange-400",  bg: "bg-orange-500/10"  },
] as const;

function GeneratingSkeleton({ taskLabel }: { taskLabel: string }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    const timers = LOADING_STEPS.map((_, i) =>
      setTimeout(() => setRevealed(i + 1), i * 900)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
        </div>
        <div>
          <p className="font-bold text-white">Personalizing your learning path</p>
          <p className="text-xs text-slate-400 mt-0.5">
            AI is reading your skill scores and career goals
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-500 truncate">
        Building 6 steps for: <span className="text-slate-300">"{taskLabel}"</span>
      </p>

      {/* Progressive step reveal */}
      <div className="space-y-2">
        {LOADING_STEPS.map((step, i) => {
          const Icon = step.icon;
          const isVisible = i < revealed;
          const isCurrent = i === revealed;
          return (
            <div
              key={step.label}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 border transition-all duration-500 ${
                isVisible
                  ? `${step.bg} border-white/[0.07]`
                  : "border-white/[0.04] bg-white/[0.02] opacity-25"
              }`}
            >
              <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 ${isVisible ? step.bg : "bg-white/[0.04]"}`}>
                {isVisible
                  ? <Icon className={`h-3.5 w-3.5 ${step.color}`} />
                  : <div className="h-3 w-3 rounded bg-white/10" />
                }
              </div>
              <span className={`text-sm font-medium flex-1 ${isVisible ? "text-slate-300" : "text-slate-600"}`}>
                {step.label}
              </span>
              {isVisible  && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/60 shrink-0" />}
              {isCurrent  && <Loader2 className="h-3.5 w-3.5 text-slate-500 animate-spin shrink-0" />}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-600 text-center">
        Usually 5–10 seconds · Only happens once per task
      </p>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type StepType = "why_it_matters" | "lesson" | "example_gallery" | "practice" | "quiz" | "deliverable";

interface Step {
  id: string;
  type: StepType;
  order: number;
  title: string;
  content: Record<string, unknown>;
  completedAt: string | null;
  score: number | null;
  aiFeedback: Record<string, unknown> | null;
  userInput: string | null;
}

interface WhyContent    { text: string; keyPoints: string[]; interviewRelevance: string; commonMistakes: string[] }
interface LessonContent { sections: { heading: string; body: string }[]; summary: string }
interface GalleryContent { examples: { label: "Bad" | "Average" | "Excellent"; text: string; annotation: string }[] }
interface PracticeContent { instructions: string; placeholder: string; dimension: string }
interface QuizContent   { questions: { question: string; options: string[]; correct: number; explanation: string }[] }
interface DeliverableContent { instructions: string; type: string; template?: string }
interface Feedback      { verdict: string; strengths: string[]; improvements: string[] }

// ─── Step config ─────────────────────────────────────────────────────────────

const STEP_CONFIG: Record<StepType, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  why_it_matters:  { icon: Lightbulb,   color: "text-amber-400",   bg: "bg-amber-500/10",   label: "Why It Matters"   },
  lesson:          { icon: BookOpen,    color: "text-blue-400",    bg: "bg-blue-500/10",    label: "Lesson"           },
  example_gallery: { icon: Layers,      color: "text-violet-400",  bg: "bg-violet-500/10",  label: "Examples"         },
  practice:        { icon: PenLine,     color: "text-indigo-400",  bg: "bg-indigo-500/10",  label: "Practice"         },
  quiz:            { icon: HelpCircle,  color: "text-emerald-400", bg: "bg-emerald-500/10", label: "Quiz"             },
  deliverable:     { icon: Award,       color: "text-orange-400",  bg: "bg-orange-500/10",  label: "Deliverable"      },
};

const STEP_ORDER: StepType[] = ["why_it_matters", "lesson", "example_gallery", "practice", "quiz", "deliverable"];

// ─── Step indicators ──────────────────────────────────────────────────────────

function StepIndicators({ steps, currentIdx }: { steps: Step[]; currentIdx: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const cfg = STEP_CONFIG[step.type];
        const Icon = cfg.icon;
        const isDone = !!step.completedAt;
        const isCurrent = i === currentIdx;
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex flex-col items-center gap-1 ${i <= currentIdx ? "" : "opacity-40"}`}>
              {/* Smaller circles on mobile (h-7 w-7) → normal on sm+ (h-9 w-9) */}
              <div className={`h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                isDone    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                isCurrent ? `${cfg.bg} ${cfg.color} border border-current/30` :
                            "bg-white/[0.04] text-slate-500 border border-white/10"
              }`}>
                {isDone ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider hidden sm:block ${isCurrent ? cfg.color : "text-slate-500"}`}>
                {cfg.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              /* Shorter connectors on mobile (w-3) → normal on sm+ (w-6) */
              <div className={`w-3 sm:w-6 h-px mx-0.5 sm:mx-1 mb-0 sm:mb-4 transition-colors ${isDone ? "bg-emerald-500/40" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step renderers ───────────────────────────────────────────────────────────

function WhyStep({ content }: { content: WhyContent }) {
  return (
    <div className="space-y-5">
      <p className="text-slate-200 text-base leading-relaxed">{content.text}</p>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Key Points</p>
        <ul className="space-y-2">
          {content.keyPoints.map((pt, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
              <span className="h-5 w-5 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i + 1}</span>
              {pt}
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1.5">Interview Relevance</p>
        <p className="text-sm text-slate-300">{content.interviewRelevance}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Common Mistakes</p>
        <ul className="space-y-2">
          {content.commonMistakes.map((m, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
              {m}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LessonStep({ content }: { content: LessonContent }) {
  return (
    <div className="space-y-5">
      {content.sections.map((sec, i) => (
        <div key={i}>
          <h3 className="text-sm font-bold text-white mb-2">{sec.heading}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{sec.body}</p>
        </div>
      ))}
      <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Takeaway</p>
        <p className="text-sm text-slate-300">{content.summary}</p>
      </div>
    </div>
  );
}

function GalleryStep({ content }: { content: GalleryContent }) {
  const [active, setActive] = useState<"Bad" | "Average" | "Excellent">("Bad");
  const TAB_COLORS = {
    Bad:       { tab: "bg-red-500/20 text-red-400 border-red-500/30",    badge: "text-red-400"     },
    Average:   { tab: "bg-amber-500/20 text-amber-400 border-amber-500/30", badge: "text-amber-400" },
    Excellent: { tab: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", badge: "text-emerald-400" },
  };
  const ex = content.examples.find((e) => e.label === active) ?? content.examples[0];
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2">
        {(["Bad", "Average", "Excellent"] as const).map((label) => {
          const colors = TAB_COLORS[label];
          return (
            <button
              key={label}
              onClick={() => setActive(label)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                active === label ? colors.tab : "bg-white/[0.04] text-slate-500 border-white/10 hover:border-white/20"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      {/* Example text */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
        <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{ex.text}</p>
      </div>
      {/* Annotation */}
      <div className={`p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]`}>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${TAB_COLORS[ex.label].badge}`}>
          Why this is {ex.label.toLowerCase()}
        </p>
        <p className="text-sm text-slate-400">{ex.annotation}</p>
      </div>
    </div>
  );
}

function PracticeStep({
  content, stepId, taskId, onComplete,
}: {
  content: PracticeContent;
  stepId: string;
  taskId: string;
  onComplete: (score: number, feedback: Feedback) => void;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<{ score: number; feedback: Feedback } | null>(null);
  const [isPending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    start(async () => {
      const res = await fetch(`/api/roadmap/tasks/${taskId}/steps/${stepId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: value }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed"); return; }
      setResult({ score: data.score, feedback: data.aiFeedback });
      onComplete(data.score, data.aiFeedback);
    });
  }

  if (result) {
    const { score, feedback } = result;
    const scoreColor = score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400";
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08]">
          <div className="shrink-0 text-center">
            <div className={`text-4xl font-black tabular-nums ${scoreColor}`}>{score}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wide mt-0.5">/ 100</div>
          </div>
          <p className="text-sm text-slate-200 leading-snug">{feedback.verdict}</p>
        </div>
        {feedback.strengths?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-2">Strengths</p>
            <ul className="space-y-1.5">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {feedback.improvements?.length > 0 && (
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-2">To improve</p>
            <ul className="space-y-1.5">
              {feedback.improvements.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <ChevronRight className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-300 leading-relaxed">{content.instructions}</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={content.placeholder}
        rows={6}
        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-colors"
      />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={`text-xs tabular-nums ${value.length < 30 ? "text-slate-600" : "text-slate-400"}`}>
          {value.length} chars {value.length < 30 && `· ${30 - value.length} more`}
        </span>
        <button
          onClick={submit}
          disabled={isPending || value.trim().length < 30}
          className="h-9 px-4 sm:px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center gap-2 transition-colors"
        >
          {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Evaluating…</> : "Submit for AI feedback"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function QuizStep({
  content, stepId, taskId, onComplete,
}: {
  content: QuizContent;
  stepId: string;
  taskId: string;
  onComplete: (score: number) => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(content.questions.map(() => null));
  const [results, setResults] = useState<{ correct: boolean; explanation: string }[] | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isPending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allAnswered = answers.every((a) => a !== null);

  function submit() {
    setError(null);
    start(async () => {
      const res = await fetch(`/api/roadmap/tasks/${taskId}/steps/${stepId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed"); return; }
      setResults(data.quizResults);
      setScore(data.score);
      onComplete(data.score);
    });
  }

  return (
    <div className="space-y-6">
      {content.questions.map((q, qi) => (
        <div key={qi} className="space-y-3">
          <p className="text-sm font-semibold text-white">{qi + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const isSelected = answers[qi] === oi;
              const isCorrect = results && oi === q.correct;
              const isWrong = results && isSelected && oi !== q.correct;
              return (
                <button
                  key={oi}
                  onClick={() => !results && setAnswers((prev) => prev.map((a, i) => i === qi ? oi : a))}
                  disabled={!!results}
                  className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all ${
                    isCorrect ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300" :
                    isWrong   ? "bg-red-500/15 border-red-500/40 text-red-300" :
                    isSelected ? "bg-indigo-500/15 border-indigo-500/40 text-white" :
                                "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:border-white/20"
                  }`}
                >
                  <span className="font-bold mr-2 text-slate-500">{["A","B","C","D"][oi]}.</span>
                  {opt}
                </button>
              );
            })}
          </div>
          {results && (
            <p className={`text-xs px-3 py-2 rounded-lg ${results[qi].correct ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {results[qi].correct ? "✓ Correct — " : "✗ Incorrect — "}{q.explanation}
            </p>
          )}
        </div>
      ))}

      {!results ? (
        <div className="flex items-center justify-between">
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={submit}
            disabled={!allAnswered || isPending}
            className="ml-auto h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center gap-2 transition-colors"
          >
            {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking…</> : "Submit answers"}
          </button>
        </div>
      ) : (
        <div className={`p-4 rounded-xl text-center ${score! >= 70 ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-amber-500/10 border border-amber-500/20"}`}>
          <span className={`text-2xl font-black tabular-nums ${score! >= 70 ? "text-emerald-400" : "text-amber-400"}`}>
            {score}/100
          </span>
          <p className={`text-sm mt-1 ${score! >= 70 ? "text-emerald-400" : "text-amber-400"}`}>
            {score! >= 70 ? "Great work — continue to the deliverable!" : "Review the lesson and continue."}
          </p>
        </div>
      )}
    </div>
  );
}

function DeliverableStep({
  content, stepId, taskId, onComplete,
}: {
  content: DeliverableContent;
  stepId: string;
  taskId: string;
  onComplete: () => void;
}) {
  const [value, setValue] = useState(content.template ?? "");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    start(async () => {
      const res = await fetch(`/api/roadmap/tasks/${taskId}/steps/${stepId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: value }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed"); return; }
      setSubmitted(true);
      onComplete();
    });
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
          <Award className="h-7 w-7 text-emerald-400" />
        </div>
        <p className="text-lg font-bold text-white mb-1">Deliverable saved!</p>
        <p className="text-sm text-slate-400">Added to your portfolio. This task is now complete.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-300 leading-relaxed">{content.instructions}</p>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={8}
        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 resize-none focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-colors font-mono"
      />
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className={`text-xs tabular-nums ${value.length < 30 ? "text-slate-600" : "text-slate-400"}`}>
          {value.length} chars
        </span>
        <button
          onClick={submit}
          disabled={isPending || value.trim().length < 30}
          className="h-9 px-4 sm:px-5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center gap-2 transition-colors"
        >
          {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</> : "Save deliverable →"}
        </button>
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ─── Main flow component ──────────────────────────────────────────────────────

interface Props {
  taskId: string;
  taskLabel: string;
  existingSteps: Step[];
  alreadyCompleted: boolean;
}

export function TaskStepFlow({ taskId, taskLabel, existingSteps, alreadyCompleted }: Props) {
  const [steps, setSteps] = useState<Step[]>(existingSteps);
  const [isGenerating, setIsGenerating] = useState(existingSteps.length === 0);
  const [currentIdx, setCurrentIdx] = useState(() => {
    if (existingSteps.length === 0) return 0;
    const firstIncomplete = existingSteps.findIndex((s) => !s.completedAt);
    return firstIncomplete === -1 ? existingSteps.length - 1 : firstIncomplete;
  });
  const [taskDone, setTaskDone] = useState(alreadyCompleted);

  // Generate steps lazily if not yet created
  useEffect(() => {
    if (existingSteps.length > 0) return;
    fetch(`/api/roadmap/tasks/${taskId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.task?.steps) {
          const sorted = [...data.task.steps].sort((a: Step, b: Step) => a.order - b.order);
          setSteps(sorted);
          const firstIncomplete = sorted.findIndex((s: Step) => !s.completedAt);
          setCurrentIdx(firstIncomplete === -1 ? sorted.length - 1 : firstIncomplete);
        }
      })
      .finally(() => setIsGenerating(false));
  }, [taskId, existingSteps.length]);

  function markCurrentComplete(updates?: Partial<Step>) {
    setSteps((prev) =>
      prev.map((s, i) =>
        i === currentIdx ? { ...s, completedAt: new Date().toISOString(), ...updates } : s
      )
    );
  }

  function advance(taskCompleted?: boolean) {
    if (taskCompleted) setTaskDone(true);
    if (currentIdx < steps.length - 1) {
      setCurrentIdx((i) => i + 1);
    }
  }

  // ── Generating skeleton ────────────────────────────────────────────────────
  if (isGenerating) {
    return <GeneratingSkeleton taskLabel={taskLabel} />;
  }

  if (steps.length === 0) return null;

  // ── Task already complete ──────────────────────────────────────────────────
  if (taskDone && steps.every((s) => s.completedAt)) {
    return (
      <div className="bg-[#161820] rounded-2xl border border-emerald-500/20 shadow-sm p-8 text-center">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <p className="text-lg font-bold text-white mb-1">Task Complete</p>
        <p className="text-sm text-slate-400">You've finished all 6 steps. Your deliverable is saved to your portfolio.</p>
      </div>
    );
  }

  const currentStep = steps[currentIdx];
  const cfg = STEP_CONFIG[currentStep.type];
  const Icon = cfg.icon;

  // ── Step content ───────────────────────────────────────────────────────────
  const content = currentStep.content as Record<string, unknown>;
  const isAlreadyDone = !!currentStep.completedAt;

  function renderStep() {
    switch (currentStep.type) {
      case "why_it_matters":  return <WhyStep content={content as unknown as WhyContent} />;
      case "lesson":          return <LessonStep content={content as unknown as LessonContent} />;
      case "example_gallery": return <GalleryStep content={content as unknown as GalleryContent} />;
      case "practice":
        return (
          <PracticeStep
            content={content as unknown as PracticeContent}
            stepId={currentStep.id}
            taskId={taskId}
            onComplete={(score, feedback) => {
              markCurrentComplete({ score, aiFeedback: feedback as never });
            }}
          />
        );
      case "quiz":
        return (
          <QuizStep
            content={content as unknown as QuizContent}
            stepId={currentStep.id}
            taskId={taskId}
            onComplete={(score) => markCurrentComplete({ score })}
          />
        );
      case "deliverable":
        return (
          <DeliverableStep
            content={content as unknown as DeliverableContent}
            stepId={currentStep.id}
            taskId={taskId}
            onComplete={() => {
              markCurrentComplete();
              setTaskDone(true);
            }}
          />
        );
      default: return null;
    }
  }

  // Simple steps need a "Continue" button; interactive steps self-advance via onComplete
  const isSimpleStep = ["why_it_matters", "lesson", "example_gallery"].includes(currentStep.type);
  // Practice/Quiz: show Continue after completing, before advancing
  const practiceOrQuizDone =
    (currentStep.type === "practice" || currentStep.type === "quiz") && isAlreadyDone;

  return (
    <div className="space-y-4">
      {/* Step indicators */}
      <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-5">
        <StepIndicators steps={steps} currentIdx={currentIdx} />
      </div>

      {/* Step card */}
      <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6">
        {/* Step header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`h-9 w-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
            <Icon className={`h-4 w-4 ${cfg.color}`} />
          </div>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${cfg.color}`}>{cfg.label}</p>
            <p className="font-bold text-white text-base">{currentStep.title}</p>
          </div>
          <span className="ml-auto text-xs text-slate-600 tabular-nums">{currentIdx + 1} / {steps.length}</span>
        </div>

        {/* Step content */}
        {renderStep()}

        {/* Embedded AI Mentor — always available on every step */}
        <TaskMentor
          taskId={taskId}
          stepType={currentStep.type}
          stepTitle={currentStep.title}
          hasSubmitted={!!currentStep.userInput}
          userInput={currentStep.userInput}
        />

        {/* Continue button for simple steps or after practice/quiz */}
        {(isSimpleStep || practiceOrQuizDone) && currentIdx < steps.length - 1 && (
          <div className="flex justify-end mt-6 pt-4 border-t border-white/[0.06]">
            <button
              onClick={() => {
                if (isSimpleStep && !isAlreadyDone) {
                  fetch(`/api/roadmap/tasks/${taskId}/steps/${currentStep.id}/complete`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                  }).then((r) => r.json()).then((d) => {
                    markCurrentComplete();
                    advance(d.taskCompleted);
                  });
                } else {
                  advance();
                }
              }}
              className={`h-9 px-5 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors text-white ${
                cfg.bg.replace("bg-", "bg-").replace("/10", "/80") + " hover:opacity-90"
              } bg-indigo-600 hover:bg-indigo-700`}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
