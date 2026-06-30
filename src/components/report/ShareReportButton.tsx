"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

export function ShareReportButton() {
  const [copied, setCopied] = useState(false);

  function share() {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <button
      onClick={share}
      className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm transition-colors"
    >
      {copied ? <><Check className="h-3.5 w-3.5" /> Link copied</> : <><Share2 className="h-3.5 w-3.5" /> Share report</>}
    </button>
  );
}
