"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROLE_OPTIONS } from "@/lib/constants";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { TargetRole } from "@prisma/client";
import { cn } from "@/lib/utils";

const roleDescriptions: Record<string, string> = {
  product_swe: "Build features at SaaS/product companies — LeetCode, system design, product thinking",
  staff_eng: "Technical leadership, architecture, cross-team impact at scale",
  ml_eng: "Build and deploy ML models — Python, PyTorch, MLOps, LLMs",
  ai_pm: "Ship AI features as a PM — metrics, roadmaps, ML fundamentals",
  data_scientist: "Experiments, insights, forecasting — statistics, Python, SQL",
};

export default function OnboardingGoals() {
  const router = useRouter();
  const [selected, setSelected] = useState<TargetRole | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFinish() {
    if (!selected) return;
    setSaving(true);
    await fetch("/api/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole: selected }),
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
              s === 3 ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-primary/30 text-primary"
            }`}>{s}</div>
            {s < 3 && <div className="h-px w-8 bg-primary/30" />}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">Step 3 of 3</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="mb-7">
          <h1 className="text-2xl font-bold">What role are you targeting?</h1>
          <p className="text-base text-muted-foreground mt-2">This determines your gap analysis, roadmap, and interview questions.</p>
        </div>

        <div className="space-y-3 mb-7">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelected(opt.value)}
              className={cn(
                "w-full flex items-start justify-between rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50",
                selected === opt.value ? "border-primary bg-primary/5 shadow-sm" : "border-slate-200"
              )}
            >
              <div>
                <p className="font-semibold text-base">{opt.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{roleDescriptions[opt.value]}</p>
              </div>
              {selected === opt.value && <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5 ml-3" />}
            </button>
          ))}
        </div>

        <Button className="w-full h-12 gap-2 font-semibold text-base shadow-md shadow-primary/25" disabled={!selected || saving} onClick={handleFinish}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" />Setting up your account...</> : <><ArrowRight className="h-4 w-4" />Go to my dashboard</>}
        </Button>
      </div>
    </div>
  );
}
