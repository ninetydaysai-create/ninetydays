"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export function RegenerateGapButton({ analysisId }: { analysisId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    <Button onClick={regenerate} disabled={loading} variant="outline" className="gap-2 h-10">
      {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Re-running analysis...</> : <><RefreshCw className="h-4 w-4" />Re-run gap analysis</>}
    </Button>
  );
}
