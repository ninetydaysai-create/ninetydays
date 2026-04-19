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
import { ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

const PENDING_BETA_CODE_KEY = "pending_beta_code";

const schema = z.object({
  currentCompany: z.string().min(1, "Select your company type"),
  currentRole: z.string().min(2, "Enter your current role title"),
  yearsExperience: z.number().min(0).max(50),
});

type FormValues = z.infer<typeof schema>;

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
    defaultValues: { currentCompany: "", currentRole: "", yearsExperience: 3 },
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
              s === 1 ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-border text-muted-foreground"
            }`}>{s}</div>
            {s < 3 && <div className={`h-px w-8 ${s < 1 ? "bg-primary/40" : "bg-border"}`} />}
          </div>
        ))}
        <span className="ml-2 text-xs text-muted-foreground">Step 1 of 3</span>
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
          <h1 className="text-2xl font-bold">Tell us where you are now</h1>
          <p className="text-base text-muted-foreground mt-2">We use this to calibrate your resume analysis and gap report.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField control={form.control} name="currentCompany" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Current company type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select your company type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {COMPANY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="currentRole" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Current role title</FormLabel>
                <FormControl>
                  <Input className="h-12 text-base" placeholder="e.g. Senior Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="yearsExperience" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold">Years of total experience</FormLabel>
                <FormControl>
                  <Input className="h-12 text-base" type="number" min={0} max={50} {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full h-12 gap-2 font-semibold text-base shadow-md shadow-primary/25 hover:shadow-lg" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving...</> : <><ArrowRight className="h-4 w-4" />Continue</>}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
