"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface StreamingTextProps {
  endpoint: string;
  body?: Record<string, unknown>;
  className?: string;
  onComplete?: (text: string) => void;
  placeholder?: string;
}

export function StreamingText({
  endpoint,
  body,
  className,
  onComplete,
  placeholder = "Generating...",
}: StreamingTextProps) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function stream() {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: body ? JSON.stringify(body) : undefined,
        });

        if (!res.ok) {
          const err = await res.json();
          setError(err.error ?? "Failed to generate");
          return;
        }

        if (!res.body) { setError("No stream"); return; }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done: streamDone, value } = await reader.read();
          if (streamDone) break;
          accumulated += decoder.decode(value, { stream: true });
          setText(accumulated);
        }

        setDone(true);
        onComplete?.(accumulated);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed");
      }
    }

    stream();
  }, [endpoint, body, onComplete]);

  if (error) {
    return <p className={cn("text-destructive text-sm", className)}>{error}</p>;
  }

  if (!text && !done) {
    return (
      <p className={cn("text-muted-foreground text-sm animate-pulse", className)}>
        {placeholder}
      </p>
    );
  }

  return (
    <p className={cn("whitespace-pre-wrap", className)}>
      {text}
      {!done && <span className="inline-block w-1 h-4 bg-foreground animate-pulse ml-0.5 align-middle" />}
    </p>
  );
}
