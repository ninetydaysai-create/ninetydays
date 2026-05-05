"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useElapsedTime, formatElapsed } from "@/hooks/useElapsedTime";

export function RegenerateGapButton({ analysisId }: { analysisId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const elapsed = useElapsedTime(loading);

  async function regenerate() {
    setLoading(true);
    const res = await fetch("/api/gaps/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysisId }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
    else alert("Regeneration failed — please try again.");
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button onClick={regenerate} disabled={loading} variant="outline" className="gap-2 h-10">
        {loading
          ? <><Loader2 className="h-4 w-4 animate-spin" />Re-analyzing… <span className="font-mono tabular-nums ml-1">({formatElapsed(elapsed)})</span></>
          : <><RefreshCw className="h-4 w-4" />Re-run gap analysis</>}
      </Button>
      {loading && (
        <p className="text-xs text-slate-500 ml-1">Usually 60–90s. Don&apos;t close this tab.</p>
      )}
    </div>
  );
}
