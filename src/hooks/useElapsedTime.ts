"use client";

import { useState, useEffect } from "react";

/**
 * Returns elapsed seconds since `active` became true.
 * Resets to 0 when `active` becomes false.
 */
export function useElapsedTime(active: boolean): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  return elapsed;
}

/** Formats seconds as "0:05", "1:23", "2:07" */
export function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
