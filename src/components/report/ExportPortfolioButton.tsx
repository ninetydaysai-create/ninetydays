"use client";

import { useEffect, useState, useTransition } from "react";
import { Download, Loader2, CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";
import { format } from "date-fns";

export function ExportPortfolioButton() {
  const [existingUrl, setExistingUrl]   = useState<string | null>(null);
  const [updatedAt, setUpdatedAt]       = useState<string | null>(null);
  const [newUrl, setNewUrl]             = useState<string | null>(null);
  const [copied, setCopied]             = useState(false);
  const [isPending, start]              = useTransition();

  useEffect(() => {
    fetch("/api/portfolio-export")
      .then(r => r.json())
      .then(d => {
        if (d.export) {
          setExistingUrl(d.export.url);
          setUpdatedAt(d.export.updatedAt);
        }
      });
  }, []);

  function generate() {
    start(async () => {
      const res = await fetch("/api/portfolio-export", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        setNewUrl(data.url);
        setExistingUrl(data.url);
        setUpdatedAt(new Date().toISOString());
      }
    });
  }

  function copy(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const displayUrl = newUrl ?? existingUrl;

  return (
    <div className="space-y-3">
      {/* Generate / Refresh button */}
      <button
        onClick={generate}
        disabled={isPending}
        className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-white/15 hover:bg-white/25 disabled:opacity-50 text-white font-semibold text-sm transition-colors"
      >
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Generating portfolio…</>
        ) : existingUrl ? (
          <><RefreshCw className="h-4 w-4" /> Refresh export</>
        ) : (
          <><Download className="h-4 w-4" /> Export portfolio</>
        )}
      </button>

      {/* Result */}
      {displayUrl && !isPending && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2.5 min-w-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-sm text-white font-mono truncate max-w-[260px]">{displayUrl.replace("https://", "")}</span>
          </div>
          <button
            onClick={() => copy(displayUrl)}
            className="h-9 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-semibold text-white transition-colors shrink-0"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          <a
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-4 rounded-xl bg-white/15 hover:bg-white/25 text-sm font-semibold text-white transition-colors shrink-0 inline-flex items-center gap-1.5"
          >
            Preview <ExternalLink className="h-3.5 w-3.5" />
          </a>
          {updatedAt && (
            <span className="text-xs text-indigo-200 w-full">
              Last generated {format(new Date(updatedAt), "MMM d, h:mm a")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
