"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useElapsedTime, formatElapsed } from "@/hooks/useElapsedTime";

export default function GapGenerateButton({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const elapsed = useElapsedTime(loading);

  async function handleGenerate() {
    setLoading(true);
    const res = await fetch("/api/gaps/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    });
    if (res.ok) {
      toast.success("Gap report generated!");
      router.refresh();
    } else {
      toast.error("Failed to generate gap report. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <Button className="gap-2 h-11" onClick={handleGenerate} disabled={loading}>
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" />Analyzing gaps… <span className="font-mono tabular-nums ml-1">({formatElapsed(elapsed)})</span></>
          : <><Sparkles className="h-4 w-4" />Generate my gap report</>}
      </Button>
      {loading && (
        <p className="text-xs text-slate-400 ml-1">Usually 60–90s. Don&apos;t close this tab.</p>
      )}
    </div>
  );
}
