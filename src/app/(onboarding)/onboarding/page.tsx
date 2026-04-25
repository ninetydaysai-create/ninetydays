"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMPANY_OPTIONS } from "@/lib/constants";
import { ArrowRight, Loader2, CheckCircle2, Link, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

const PENDING_BETA_CODE_KEY = "pending_beta_code";

const schema = z.object({
  currentCompany:   z.string().min(1, "Select your company type"),
  currentRole:      z.string().min(2, "Enter your current role title"),
  yearsExperience:  z.number().min(0).max(50),
  hoursPerWeek:     z.number(),
  targetTimeline:   z.string(),
  targetCompanyType: z.string(),
  learningStyle:    z.string(),
  linkedinUrl:      z.string().url("Enter a valid LinkedIn URL").or(z.literal("")).optional(),
  githubUrl:        z.string().url("Enter a valid GitHub URL").or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof schema>;

const LABEL = "block text-sm font-semibold text-slate-700 mb-1.5";

const HOURS_OPTIONS = [
  { value: 5,  label: "~5 hrs" },
  { value: 10, label: "~10 hrs" },
  { value: 15, label: "~15 hrs" },
  { value: 20, label: "20+ hrs" },
];

const TIMELINE_OPTIONS = [
  { value: "3_months",  label: "3 months",  sub: "Aggressive sprint" },
  { value: "6_months",  label: "6 months",  sub: "Steady pace" },
  { value: "12_months", label: "12 months", sub: "Deep learning" },
];

const COMPANY_TYPE_OPTIONS = [
  { value: "faang",          label: "FAANG / Big Tech",      sub: "Google, Meta, Apple…" },
  { value: "funded_startup", label: "Series B+ Startup",     sub: "Funded product companies" },
  { value: "any_product",    label: "Any Product Company",   sub: "Open to options" },
];

const LEARNING_STYLE_OPTIONS = [
  { value: "projects", label: "Building projects" },
  { value: "courses",  label: "Video courses" },
  { value: "docs",     label: "Docs & books" },
  { value: "mix",      label: "Mix of all" },
];

function RadioPills<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all",
            value === opt.value
              ? "border-primary bg-primary/5 text-primary"
              : "border-slate-200 text-slate-600 hover:border-primary/40 hover:text-slate-800"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function RadioCards<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; sub: string }[];
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
              ? "border-primary bg-primary/5"
              : "border-slate-200 hover:border-primary/40"
          )}
        >
          <p className={cn("text-sm font-semibold leading-snug", value === opt.value ? "text-primary" : "text-slate-800")}>
            {opt.label}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{opt.sub}</p>
        </button>
      ))}
    </div>
  );
}

export default function OnboardingStep1() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [betaActivated, setBetaActivated] = useState(false);

  // Auto-apply any pending beta code stored before sign-up
  useEffect(() => {
    const pendingCode = localStorage.getItem(PENDING_BETA_CODE_KEY);
    if (!pendingCode) return;

    fetch("/api/beta/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: pendingCode }),
    })
      .then((r) => r.json())
      .then((d: { ok?: boolean }) => {
        if (d.ok) {
          localStorage.removeItem(PENDING_BETA_CODE_KEY);
          setBetaActivated(true);
        }
      })
      .catch(() => {});
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentCompany: "",
      currentRole: "",
      yearsExperience: 3,
      hoursPerWeek: 10,
      targetTimeline: "6_months",
      targetCompanyType: "any_product",
      learningStyle: "mix",
      linkedinUrl: "",
      githubUrl: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    await fetch("/api/onboarding/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    router.push("/onboarding/upload");
  }

  return (
    <div className="w-full max-w-lg">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              s === 1
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "bg-slate-200 text-slate-500"
            }`}>{s}</div>
            {s < 3 && <div className={`h-px w-8 ${s < 1 ? "bg-primary/40" : "bg-slate-200"}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs text-slate-500 font-medium">Step 1 of 3</span>
      </div>

      {/* Beta activation banner */}
      {betaActivated && (
        <div className="mb-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
          <span><strong>Beta access activated!</strong> You have full Pro access for 60 days. Welcome aboard.</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900">Tell us where you are now</h1>
          <p className="text-sm text-slate-500 mt-2">We use this to calibrate your resume analysis and gap report.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

            {/* Company type */}
            <FormField control={form.control} name="currentCompany" render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL}>Current company type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-sm text-slate-900 border-slate-300 focus:border-primary focus:ring-primary">
                      <SelectValue placeholder="Select your company type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COMPANY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            {/* Current role */}
            <FormField control={form.control} name="currentRole" render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL}>Current role title</FormLabel>
                <FormControl>
                  <Input
                    className="h-12 text-sm text-slate-900 border-slate-300 placeholder:text-slate-400 focus-visible:border-primary focus-visible:ring-primary"
                    placeholder="e.g. Senior Software Engineer"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            {/* Years of experience */}
            <FormField control={form.control} name="yearsExperience" render={({ field }) => (
              <FormItem>
                <FormLabel className={LABEL}>Years of total experience</FormLabel>
                <FormControl>
                  <Input
                    className="h-12 text-sm text-slate-900 border-slate-300 focus-visible:border-primary focus-visible:ring-primary"
                    type="number" min={0} max={50}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )} />

            {/* ── Planning preferences ─────────────────────────────────────── */}
            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-4">Personalize your 90-day plan</p>

              {/* Hours per week */}
              <FormField control={form.control} name="hoursPerWeek" render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className={LABEL}>Hours available per week</FormLabel>
                  <FormControl>
                    <RadioPills
                      options={HOURS_OPTIONS}
                      value={field.value as number}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )} />

              {/* Target timeline */}
              <FormField control={form.control} name="targetTimeline" render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className={LABEL}>When do you want to land the role?</FormLabel>
                  <FormControl>
                    <RadioCards
                      options={TIMELINE_OPTIONS}
                      value={field.value as string}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )} />

              {/* Target company type */}
              <FormField control={form.control} name="targetCompanyType" render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className={LABEL}>Type of company you&apos;re targeting</FormLabel>
                  <FormControl>
                    <RadioCards
                      options={COMPANY_TYPE_OPTIONS}
                      value={field.value as string}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )} />

              {/* Learning style */}
              <FormField control={form.control} name="learningStyle" render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>How do you learn best?</FormLabel>
                  <FormControl>
                    <RadioPills
                      options={LEARNING_STYLE_OPTIONS}
                      value={field.value as string}
                      onChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            {/* ── Optional links ───────────────────────────────────────────── */}
            <div className="border-t border-slate-100 pt-5">
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-4">Optional — helps personalize your plan further</p>

              {/* LinkedIn URL */}
              <FormField control={form.control} name="linkedinUrl" render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className={LABEL}>LinkedIn profile URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        className="h-12 text-sm text-slate-900 border-slate-300 placeholder:text-slate-400 pl-9 focus-visible:border-primary focus-visible:ring-primary"
                        placeholder="https://linkedin.com/in/yourname"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />

              {/* GitHub URL */}
              <FormField control={form.control} name="githubUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>GitHub profile URL</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        className="h-12 text-sm text-slate-900 border-slate-300 placeholder:text-slate-400 pl-9 focus-visible:border-primary focus-visible:ring-primary"
                        placeholder="https://github.com/yourusername"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )} />
            </div>

            <Button
              type="submit"
              className="w-full h-12 gap-2 font-semibold text-base shadow-md shadow-primary/25 hover:shadow-lg mt-2"
              disabled={loading}
            >
              {loading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</>
                : <><ArrowRight className="h-4 w-4" />Continue</>}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
