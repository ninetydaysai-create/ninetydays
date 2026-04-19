"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Users, Gift } from "lucide-react";

interface ReferralData {
  referralCode: string;
  referralCount: number;
  referralUrl: string;
}

export function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referral")
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(setData)
      .catch(() => setData({ referralCode: "", referralCount: 0, referralUrl: "" }));
  }, []);

  async function copy() {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (!data) return <div className="h-8 animate-pulse bg-white/5 rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-[#1a1b23] rounded-xl border border-white/10">
        <code className="flex-1 text-sm text-slate-300 font-mono truncate">{data.referralUrl}</code>
        <Button size="sm" variant={copied ? "default" : "outline"} className="gap-1.5 shrink-0" onClick={copy}>
          {copied ? <><Check className="h-3.5 w-3.5" />Copied</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-indigo-500/10 rounded-xl px-4 py-3 border border-indigo-500/20">
          <Users className="h-4 w-4 text-indigo-400" />
          <span className="text-sm font-bold text-indigo-300">{data.referralCount} referred</span>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 rounded-xl px-4 py-3 border border-amber-500/20">
          <Gift className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-300">1 free month per upgrade</span>
        </div>
      </div>
    </div>
  );
}
