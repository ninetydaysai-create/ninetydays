"use client";

import { useState } from "react";
import {
  FileText, ExternalLink, Star, Briefcase, MessageSquare,
  BookOpen, Zap, FileEdit, FolderOpen, ChevronDown, ChevronUp,
  Copy, Check, CheckCircle2, ChevronRight,
} from "lucide-react";

type DeliverableType =
  | "resume_bullets" | "linkedin_summary" | "star_story" | "portfolio_project"
  | "interview_answers" | "case_study" | "flashcard_deck" | "project_doc";

const TYPE_CONFIG: Record<DeliverableType, {
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
}> = {
  resume_bullets:    { label: "Resume Bullets",    icon: FileText,      color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
  linkedin_summary:  { label: "LinkedIn Summary",  icon: ExternalLink,  color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20"     },
  star_story:        { label: "STAR Story",        icon: Star,          color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20"  },
  portfolio_project: { label: "Portfolio Project", icon: Briefcase,     color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"   },
  interview_answers: { label: "Interview Answers", icon: MessageSquare, color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20"  },
  case_study:        { label: "Case Study",        icon: BookOpen,      color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20"  },
  flashcard_deck:    { label: "Flashcard Deck",    icon: Zap,           color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  project_doc:       { label: "Project Doc",       icon: FileEdit,      color: "text-slate-300",   bg: "bg-slate-500/10",   border: "border-slate-500/20"   },
};

function scoreColor(score: number) {
  if (score >= 70) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (score >= 40) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  return "text-red-400 bg-red-500/10 border-red-500/20";
}

interface AiFeedback {
  verdict?: string;
  strengths?: string[];
  improvements?: string[];
}

export interface DeliverableData {
  id: string;
  type: DeliverableType;
  title: string;
  content: Record<string, unknown>;
  aiScore: number | null;
  aiFeedback: AiFeedback | null;
  isPublished: boolean;
  createdAt: string;
  taskLabel: string | null;
}

export function DeliverableCard({ deliverable }: { deliverable: DeliverableData }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const cfg = TYPE_CONFIG[deliverable.type] ?? {
    label: deliverable.type, icon: FolderOpen,
    color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20",
  };
  const Icon = cfg.icon;

  const text = typeof deliverable.content?.text === "string"
    ? deliverable.content.text
    : JSON.stringify(deliverable.content, null, 2);

  const preview = text.length > 220 ? text.slice(0, 220) + "…" : text;
  const hasMore = text.length > 220;
  const feedback = deliverable.aiFeedback;

  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm flex flex-col">
      {/* Header */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg} border ${cfg.border}`}>
            <Icon className={`h-3 w-3 ${cfg.color}`} />
            <span className={`text-[11px] font-bold ${cfg.color}`}>{cfg.label}</span>
          </div>
          {deliverable.aiScore !== null && (
            <span className={`text-[11px] font-black px-2 py-1 rounded-lg border tabular-nums ${scoreColor(deliverable.aiScore)}`}>
              {deliverable.aiScore}/100
            </span>
          )}
        </div>

        <h3 className="font-bold text-white text-base leading-snug mb-1">{deliverable.title}</h3>

        {deliverable.taskLabel && (
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-3">
            <ChevronRight className="h-3 w-3" />
            From: {deliverable.taskLabel}
          </p>
        )}

        {/* Content preview */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3">
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
            {expanded ? text : preview}
          </p>
          {hasMore && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {expanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Show more</>}
            </button>
          )}
        </div>
      </div>

      {/* AI Feedback (expandable) */}
      {feedback && expanded && (
        <div className="px-5 pb-4 space-y-3 border-t border-white/[0.06] pt-4">
          {feedback.verdict && (
            <p className="text-sm text-slate-300 italic">"{feedback.verdict}"</p>
          )}
          {feedback.strengths?.length ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mb-1.5">Strengths</p>
              <ul className="space-y-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {feedback.improvements?.length ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1.5">To improve</p>
              <ul className="space-y-1">
                {feedback.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <ChevronRight className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between mt-auto">
        <span className="text-[11px] text-slate-600">
          {new Date(deliverable.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
        <button
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <><Check className="h-3.5 w-3.5 text-emerald-400" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
        </button>
      </div>
    </div>
  );
}
