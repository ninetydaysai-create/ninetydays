"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, CheckCircle2, Loader2, ArrowRight, Lock } from "lucide-react";

const PENDING_BETA_CODE_KEY = "pending_beta_code";

function BetaContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  // Auto-fill code from URL param
  const urlCode = searchParams.get("code") ?? "";

  useEffect(() => {
    if (urlCode) setCode(urlCode.toUpperCase());
  }, [urlCode]);

  const applyCode = useCallback(async (codeToApply: string) => {
    if (!codeToApply.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/beta/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToApply.trim() }),
      });
      const data = await res.json() as { ok?: boolean; message?: string; error?: string };
      if (res.ok && data.ok) {
        localStorage.removeItem(PENDING_BETA_CODE_KEY);
        setStatus("success");
        setMessage(data.message ?? "Beta access activated!");
        setTimeout(() => router.push("/dashboard"), 2000);
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong");
      }
    } catch {
      setStatus("error");
      setMessage("Network error — try again");
    }
  }, [router]);

  // If signed in + code in URL → auto-apply immediately
  useEffect(() => {
    if (isLoaded && isSignedIn && urlCode && status === "idle") {
      applyCode(urlCode);
    }
  }, [isLoaded, isSignedIn, urlCode, status, applyCode]);

  // If NOT signed in → store code in localStorage → send to sign-up
  function handleNotSignedIn() {
    if (code.trim()) localStorage.setItem(PENDING_BETA_CODE_KEY, code.trim().toUpperCase());
    router.push(`/sign-up`);
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-10">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <span className="font-bold text-white text-lg">NinetyDays</span>
      </Link>

      <div className="w-full max-w-md">
        {/* Success state */}
        {status === "success" ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-8 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-bold text-xl">Beta access activated!</p>
              <p className="text-slate-400 text-sm mt-2">{message}</p>
            </div>
            <p className="text-slate-500 text-xs">Taking you to your dashboard…</p>
          </div>
        ) : (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-3 py-1 text-xs font-semibold text-indigo-300 mb-4">
                <Lock className="h-3 w-3" /> Private Beta
              </div>
              <h1 className="text-2xl font-black text-white">Activate your beta access</h1>
              <p className="text-slate-400 text-sm mt-2">
                Enter the invite code you received to unlock full Pro access for 60 days — free.
              </p>
            </div>

            {/* Code input */}
            <div className="space-y-3">
              <Input
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (status === "error") setStatus("idle");
                }}
                placeholder="BETA-XXXX-XXXX"
                className="h-12 text-center text-base font-mono tracking-widest bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && code.trim()) {
                    isSignedIn ? applyCode(code) : handleNotSignedIn();
                  }
                }}
              />

              {status === "error" && (
                <p className="text-red-400 text-sm text-center">{message}</p>
              )}

              {isSignedIn ? (
                <Button
                  className="w-full h-11 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
                  disabled={!code.trim() || status === "loading"}
                  onClick={() => applyCode(code)}
                >
                  {status === "loading"
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Activating…</>
                    : <><Zap className="h-4 w-4" /> Activate beta access</>}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    className="w-full h-11 font-semibold bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
                    disabled={!code.trim()}
                    onClick={handleNotSignedIn}
                  >
                    Sign up to activate <ArrowRight className="h-4 w-4" />
                  </Button>
                  <p className="text-slate-600 text-xs text-center">
                    Already have an account?{" "}
                    <Link href="/sign-in" className="text-indigo-400 hover:underline">Sign in</Link>
                  </p>
                </div>
              )}
            </div>

            {/* What they get */}
            <div className="border-t border-white/10 pt-5 space-y-2.5">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide">What you get for 60 days</p>
              {[
                "Full AI Mentor — unlimited daily guidance",
                "Complete 12-week personalised roadmap",
                "Unlimited mock interviews + scoring",
                "Resume bullet rewrites + LinkedIn optimizer",
                "Public portfolio page",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BetaPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      }
    >
      <BetaContent />
    </Suspense>
  );
}
