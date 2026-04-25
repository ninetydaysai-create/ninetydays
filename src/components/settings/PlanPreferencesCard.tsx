"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Pencil, Check, Sliders } from "lucide-react";
import { cn } from "@/lib/utils";

const HOURS_OPTIONS    = [5, 10, 15, 20] as const;
const TIMELINE_OPTIONS = [
  { value: "3_months",  label: "3 months",  sub: "Aggressive sprint" },
  { value: "6_months",  label: "6 months",  sub: "Steady pace" },
  { value: "12_months", label: "12 months", sub: "Deep learning" },
] as const;
const COMPANY_TYPE_OPTIONS = [
  { value: "faang",          label: "FAANG / Big Tech",    sub: "Google, Meta, Apple…" },
  { value: "funded_startup", label: "Series B+ Startup",   sub: "Funded product cos" },
  { value: "any_product",    label: "Any Product Co",      sub: "Open to options" },
] as const;
const LEARNING_STYLE_OPTIONS = [
  { value: "projects", label: "Building projects" },
  { value: "courses",  label: "Video courses" },
  { value: "docs",     label: "Docs & books" },
  { value: "mix",      label: "Mix of all" },
] as const;
const REASON_OPTIONS = [
  { value: "growth",     label: "Growth & earnings" },
  { value: "passion",    label: "Passionate about products" },
  { value: "culture",    label: "Better engineering culture" },
  { value: "relocation", label: "Location / remote" },
] as const;

const TIMELINE_LABELS: Record<string, string> = { "3_months": "3 months", "6_months": "6 months", "12_months": "12 months" };
const COMPANY_LABELS:  Record<string, string> = { faang: "FAANG / Big Tech", funded_startup: "Series B+ Startup", any_product: "Any Product Co" };
const STYLE_LABELS:    Record<string, string> = { projects: "Building projects", courses: "Video courses", docs: "Docs & books", mix: "Mix of all" };
const REASON_LABELS:   Record<string, string> = { growth: "Growth & earnings", passion: "Passionate about products", culture: "Better engineering culture", relocation: "Location / remote" };

interface Props {
  initial: {
    hoursPerWeek:      number | null;
    targetTimeline:    string | null;
    targetCompanyType: string | null;
    learningStyle:     string | null;
    targetReason:      string | null;
  };
}

function Pill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200"
      )}
    >
      {label}
    </button>
  );
}

function SmallCards<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string; sub: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-xl border-2 p-3 text-left transition-all",
            value === opt.value
              ? "border-primary bg-primary/10"
              : "border-white/10 hover:border-white/25"
          )}
        >
          <p className={cn("text-sm font-semibold leading-snug", value === opt.value ? "text-primary" : "text-slate-200")}>
            {opt.label}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{opt.sub}</p>
        </button>
      ))}
    </div>
  );
}

export function PlanPreferencesCard({ initial }: Props) {
  const [editing,          setEditing]          = useState(false);
  const [saving,           setSaving]           = useState(false);
  const [hoursPerWeek,     setHoursPerWeek]     = useState(initial.hoursPerWeek     ?? 10);
  const [targetTimeline,   setTargetTimeline]   = useState(initial.targetTimeline   ?? "6_months");
  const [targetCompanyType,setTargetCompanyType]= useState(initial.targetCompanyType ?? "any_product");
  const [learningStyle,    setLearningStyle]    = useState(initial.learningStyle    ?? "mix");
  const [targetReason,     setTargetReason]     = useState(initial.targetReason     ?? "growth");

  async function save() {
    setSaving(true);
    await fetch("/api/settings/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hoursPerWeek, targetTimeline, targetCompanyType, learningStyle, targetReason }),
    });
    setSaving(false);
    setEditing(false);
  }

  const LABEL = "text-sm font-semibold text-slate-300 mb-2 block";

  if (!editing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-indigo-400" />
              <CardTitle className="text-lg">Plan preferences</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="gap-1.5 text-slate-400 hover:text-white" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          </div>
          <CardDescription>These settings shape your 90-day roadmap. Regenerate your roadmap after saving changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {[
              { label: "Hours / week",    value: `${hoursPerWeek}h`                                       },
              { label: "Timeline",        value: TIMELINE_LABELS[targetTimeline]    ?? targetTimeline      },
              { label: "Target company",  value: COMPANY_LABELS[targetCompanyType]  ?? targetCompanyType   },
              { label: "Learning style",  value: STYLE_LABELS[learningStyle]        ?? learningStyle       },
              { label: "Motivation",      value: REASON_LABELS[targetReason]        ?? targetReason        },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400 text-sm">{label}</span>
                <span className="font-medium text-sm">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sliders className="h-5 w-5 text-indigo-400" />
          <CardTitle className="text-lg">Plan preferences</CardTitle>
        </div>
        <CardDescription>Changes take effect the next time you regenerate your roadmap.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">

        <div>
          <span className={LABEL}>Hours available per week</span>
          <div className="flex flex-wrap gap-2">
            {HOURS_OPTIONS.map((h) => (
              <Pill
                key={h}
                active={hoursPerWeek === h}
                label={`~${h} hrs`}
                onClick={() => setHoursPerWeek(h)}
              />
            ))}
          </div>
        </div>

        <div>
          <span className={LABEL}>Target timeline</span>
          <SmallCards options={TIMELINE_OPTIONS} value={targetTimeline} onChange={setTargetTimeline} />
        </div>

        <div>
          <span className={LABEL}>Type of company you&apos;re targeting</span>
          <SmallCards options={COMPANY_TYPE_OPTIONS} value={targetCompanyType} onChange={setTargetCompanyType} />
        </div>

        <div>
          <span className={LABEL}>How do you learn best?</span>
          <div className="flex flex-wrap gap-2">
            {LEARNING_STYLE_OPTIONS.map((opt) => (
              <Pill
                key={opt.value}
                active={learningStyle === opt.value}
                label={opt.label}
                onClick={() => setLearningStyle(opt.value)}
              />
            ))}
          </div>
        </div>

        <div>
          <span className={LABEL}>Why are you making this move?</span>
          <div className="grid grid-cols-2 gap-2">
            {REASON_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTargetReason(opt.value)}
                className={cn(
                  "rounded-xl border-2 px-3 py-2.5 text-left text-sm font-medium transition-all",
                  targetReason === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-white/10 text-slate-300 hover:border-white/25"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={save} disabled={saving} className="gap-2 h-9">
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Save preferences
          </Button>
          <Button variant="ghost" onClick={() => setEditing(false)} className="h-9 text-slate-400">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
