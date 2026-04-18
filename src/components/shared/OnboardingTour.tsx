"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const TOUR_KEY = "onboarding_tour_v1_done";

interface Step {
  title: string;
  body: string;
  highlight?: string; // CSS selector of element to spotlight
  position: "center" | "bottom-right";
  emoji: string;
}

const STEPS: Step[] = [
  {
    emoji: "👋",
    title: "Welcome to your 90-day plan",
    body: "This platform turns your service company experience into a product company offer. Here's how to get started in the next 10 minutes.",
    position: "center",
  },
  {
    emoji: "📄",
    title: "Step 1 — Upload your resume",
    body: "Go to Resume → upload your PDF. Our AI reads it like a hiring manager at Google or Stripe — not an ATS scanner. You'll get a signal depth score for every skill.",
    position: "center",
    highlight: "[href='/resume']",
  },
  {
    emoji: "🎯",
    title: "Step 2 — Run Gap Analysis",
    body: "After your resume is analyzed, go to Gap Engine. It tells you exactly which skills are ABSENT, WEAK, or MODERATE — and what to do about each one.",
    position: "center",
    highlight: "[href='/gaps']",
  },
  {
    emoji: "🗺️",
    title: "Step 3 — Generate your Roadmap",
    body: "The roadmap builds a week-by-week plan tailored to your exact gaps. Each week has a theme, a deliverable, and daily tasks ordered by impact score.",
    position: "center",
    highlight: "[href='/roadmap']",
  },
  {
    emoji: "🤖",
    title: "Step 4 — Talk to your AI Mentor",
    body: "The mentor knows your resume, your gaps, and your roadmap. Ask it anything — what to work on today, how to answer a specific interview question, whether to apply now.",
    position: "center",
    highlight: "[href='/mentor']",
  },
  {
    emoji: "🎤",
    title: "Step 5 — Practice interviews",
    body: "Go to Interview Prep and pick a company. The AI interviewer adapts to that company's actual bar and cross-checks your answers against your resume signals.",
    position: "center",
    highlight: "[href='/interview']",
  },
  {
    emoji: "🚀",
    title: "You're set up",
    body: "Most users see a 15–20 point readiness score improvement in the first 2 weeks when they follow the roadmap daily. Your mentor is always here.",
    position: "center",
  },
];

export function OnboardingTour() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show once, only on client
    if (typeof window !== "undefined" && !localStorage.getItem(TOUR_KEY)) {
      // Short delay so page renders first
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(TOUR_KEY, "1");
    setVisible(false);
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      dismiss();
    }
  }

  function prev() {
    if (step > 0) setStep(step - 1);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Tour card */}
      <div className={cn(
        "fixed z-50 w-full max-w-md px-4",
        "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "animate-in fade-in zoom-in-95 duration-200"
      )}>
        <div className="rounded-2xl border border-white/10 bg-[#12141c] shadow-2xl overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-white/10">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <div className="p-7">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{current.emoji}</span>
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-0.5">
                    Step {step + 1} of {STEPS.length}
                  </p>
                  <h3 className="text-white font-bold text-lg leading-tight">{current.title}</h3>
                </div>
              </div>
              <button onClick={dismiss} className="text-slate-600 hover:text-slate-400 transition-colors p-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <p className="text-slate-400 text-sm leading-relaxed mb-7">{current.body}</p>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={prev}
                className={cn(
                  "flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors",
                  isFirst && "invisible"
                )}
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={dismiss}
                  className="text-slate-600 hover:text-slate-400 text-sm transition-colors"
                >
                  Skip tour
                </button>
                <Button
                  onClick={next}
                  size="sm"
                  className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  {isLast ? "Let's go" : "Next"}
                  {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-4">
          {STEPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === step ? "w-6 bg-indigo-400" : "w-1.5 bg-white/20"
              )}
            />
          ))}
        </div>
      </div>
    </>
  );
}
