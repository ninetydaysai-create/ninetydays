"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROLE_OPTIONS } from "@/lib/constants";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { TargetRole } from "@prisma/client";
import { cn } from "@/lib/utils";

const roleDescriptions: Record<string, string> = {
  product_swe:     "Build features at SaaS/product companies — LeetCode, system design, product thinking",
  staff_eng:       "Technical leadership, architecture, cross-team impact at scale",
  ml_eng:          "Build and deploy ML models — Python, PyTorch, MLOps, LLMs",
  ai_pm:           "Ship AI features as a PM — metrics, roadmaps, ML fundamentals",
  data_scientist:  "Experiments, insights, forecasting — statistics, Python, SQL",
};

const REASON_OPTIONS = [
  { value: "growth",     label: "Better growth & earnings",    sub: "Faster progression, higher TC" },
  { value: "passion",    label: "Passionate about products",   sub: "I want to own what I build" },
  { value: "culture",    label: "Better engineering culture",  sub: "Ownership, craft, low politics" },
  { value: "relocation", label: "Location / remote",           sub: "Targeting a city or full remote" },
];

export default function OnboardingGoals() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<TargetRole | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>("growth");
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    if (!selectedRole) return;
    setSaving(true);
    await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole: selectedRole, targetReason: selectedReason }),
    });
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-lg">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              s === 3
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "bg-primary/20 text-primary"
            }`}>{s}</div>
            {s < 3 && <div className="h-px w-8 bg-primary/30" />}
          </div>
        ))}
        <span className="ml-2 text-xs text-slate-500 font-medium">Step 3 of 3</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-slate-900">What role are you targeting?</h1>
          <p className="text-sm text-slate-500 mt-2">This determines your gap analysis, roadmap, and interview questions.</p>
        </div>

        <div className="space-y-3 mb-7">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedRole(opt.value)}
              className={cn(
                "w-full flex items-start justify-between rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50",
                selectedRole === opt.value
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-slate-200 bg-white"
              )}
            >
              <div>
                <p className="font-semibold text-base text-slate-900">{opt.label}</p>
                <p className="text-sm text-slate-500 mt-0.5">{roleDescriptions[opt.value]}</p>
              </div>
              {selectedRole === opt.value && <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 ml-3" />}
            </button>
          ))}
        </div>

        {/* Why making this move */}
        <div className="border-t border-slate-100 pt-5 mb-7">
          <p className="text-sm font-semibold text-slate-700 mb-3">Why are you making this move?</p>
          <div className="grid grid-cols-2 gap-2">
            {REASON_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedReason(opt.value)}
                className={cn(
                  "rounded-xl border-2 p-3 text-left transition-all",
                  selectedReason === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-slate-200 hover:border-primary/40"
                )}
              >
                <p className={cn("text-sm font-semibold leading-snug", selectedReason === opt.value ? "text-primary" : "text-slate-800")}>
                  {opt.label}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{opt.sub}</p>
              </button>
            ))}
          </div>
        </div>

        <Button
          className="w-full h-12 gap-2 font-semibold text-base shadow-md shadow-primary/25"
          disabled={!selectedRole || saving}
          onClick={handleFinish}
        >
          {saving
            ? <><Loader2 className="h-4 w-4 animate-spin" />Setting up your account...</>
            : <><ArrowRight className="h-4 w-4" />Go to my dashboard</>}
        </Button>
      </div>
    </div>
  );
}
