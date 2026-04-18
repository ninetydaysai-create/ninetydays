"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function GapGenerateButton({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
    <Button className="gap-2 h-11" onClick={handleGenerate} disabled={loading}>
      {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4" />Generate my gap report</>}
    </Button>
  );
}
