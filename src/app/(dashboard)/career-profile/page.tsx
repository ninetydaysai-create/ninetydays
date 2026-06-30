"use client";

import { useEffect, useState, useTransition } from "react";
import { BookUser, Plus, X, Loader2, CheckCircle2, Brain } from "lucide-react";
import { toast } from "sonner";

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({
  label, placeholder, tags, onChange, max = 10,
}: {
  label: string; placeholder: string;
  tags: string[]; onChange: (t: string[]) => void; max?: number;
}) {
  const [input, setInput] = useState("");

  function add() {
    const val = input.trim();
    if (!val || tags.includes(val) || tags.length >= max) return;
    onChange([...tags, val]);
    setInput("");
  }

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300 font-medium">
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} className="text-indigo-400 hover:text-white transition-colors">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
        />
        <button
          onClick={add}
          disabled={!input.trim() || tags.length >= max}
          className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-indigo-500/10 hover:border-indigo-500/20 flex items-center justify-center disabled:opacity-30 transition-colors"
        >
          <Plus className="h-4 w-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#161820] rounded-2xl border border-white/10 shadow-sm p-6 space-y-5">
      <p className="text-sm font-bold text-white">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors";
const textareaCls = `${inputCls} resize-none`;

// ─── Page ─────────────────────────────────────────────────────────────────────

interface ProfileState {
  careerGoal: string;
  targetCompanies: string[];
  targetSalary: string;
  targetLocation: string;
  strengths: string[];
  weaknesses: string[];
  achievements: string[];
  notes: string;
}

const EMPTY: ProfileState = {
  careerGoal: "", targetCompanies: [], targetSalary: "",
  targetLocation: "", strengths: [], weaknesses: [], achievements: [], notes: "",
};

export default function CareerProfilePage() {
  const [profile, setProfile] = useState<ProfileState>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/career-profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) {
          setProfile({
            careerGoal:      d.profile.careerGoal      ?? "",
            targetCompanies: d.profile.targetCompanies  ?? [],
            targetSalary:    d.profile.targetSalary     ?? "",
            targetLocation:  d.profile.targetLocation   ?? "",
            strengths:       d.profile.strengths        ?? [],
            weaknesses:      d.profile.weaknesses       ?? [],
            achievements:    d.profile.achievements     ?? [],
            notes:           d.profile.notes            ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function save() {
    startTransition(async () => {
      const res = await fetch("/api/career-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSaved(true);
        toast.success("Career profile saved — AI will remember this in every session.");
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error("Save failed — try again.");
      }
    });
  }

  function set<K extends keyof ProfileState>(key: K, val: ProfileState[K]) {
    setProfile((p) => ({ ...p, [key]: val }));
  }

  const completeness = [
    profile.careerGoal.trim(),
    profile.targetCompanies.length > 0,
    profile.targetSalary.trim(),
    profile.targetLocation.trim(),
    profile.strengths.length > 0,
    profile.achievements.length > 0,
  ].filter(Boolean).length;

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
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <BookUser className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Career Profile</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Everything here is remembered by AI across every session.
            </p>
          </div>
        </div>
        {/* Completeness */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Brain className="h-4 w-4 text-violet-400" />
          <span>{completeness}/6 fields complete</span>
        </div>
      </div>

      {/* Why this matters */}
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl px-5 py-4">
        <p className="text-sm text-violet-300 leading-relaxed">
          <span className="font-bold">ChatGPT starts fresh every session.</span> NinetyDays doesn't.
          Every AI interaction — mentor, task steps, daily challenges, interview evaluation — reads this
          profile. The more you fill in, the more personal and accurate your coaching becomes.
        </p>
      </div>

      {/* Goal */}
      <Section title="Your Goal">
        <Field label="Career Goal">
          <textarea
            value={profile.careerGoal}
            onChange={(e) => set("careerGoal", e.target.value)}
            placeholder="e.g. Become an AI PM at a Series B startup within 18 months"
            rows={3}
            className={textareaCls}
          />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Target Salary">
            <input
              value={profile.targetSalary}
              onChange={(e) => set("targetSalary", e.target.value)}
              placeholder="e.g. $180k–$220k"
              className={inputCls}
            />
          </Field>
          <Field label="Location Preference">
            <input
              value={profile.targetLocation}
              onChange={(e) => set("targetLocation", e.target.value)}
              placeholder="e.g. San Francisco or Remote"
              className={inputCls}
            />
          </Field>
        </div>
      </Section>

      {/* Target companies */}
      <Section title="Target Companies">
        <TagInput
          label="Companies you want to work at"
          placeholder="Type a company name, press Enter…"
          tags={profile.targetCompanies}
          onChange={(t) => set("targetCompanies", t)}
          max={12}
        />
        <p className="text-xs text-slate-600">
          AI Mentor will tailor advice to these companies' interview styles and expectations.
        </p>
      </Section>

      {/* Your story */}
      <Section title="Your Story">
        <TagInput
          label="Your Strengths"
          placeholder="e.g. Mobile architecture, OTT domain, team leadership…"
          tags={profile.strengths}
          onChange={(t) => set("strengths", t)}
        />
        <TagInput
          label="Your Weaknesses"
          placeholder="e.g. Product metrics, business case writing…"
          tags={profile.weaknesses}
          onChange={(t) => set("weaknesses", t)}
        />
        <Field label="Key Achievements">
          <textarea
            value={profile.achievements.join("\n")}
            onChange={(e) => set("achievements", e.target.value.split("\n").filter(Boolean))}
            placeholder={"One achievement per line, e.g.:\nLed iOS migration from Obj-C → Swift at DAZN\nBuilt recommendation engine serving 5M users"}
            rows={4}
            className={textareaCls}
          />
        </Field>
      </Section>

      {/* AI context notes */}
      <Section title="AI Context Notes">
        <Field label="Anything else the AI should always know about you">
          <textarea
            value={profile.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="e.g. I have a strong iOS/ML background that I want to leverage in AI PM roles. I'm targeting roles where I can own product decisions from day one."
            rows={4}
            className={textareaCls}
          />
        </Field>
      </Section>

      {/* Save */}
      <button
        onClick={save}
        disabled={isPending}
        className="w-full h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
      >
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
        ) : saved ? (
          <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Saved</>
        ) : (
          "Save Career Profile"
        )}
      </button>
    </div>
  );
}
