"use client";

import { useEffect, useRef, useState } from "react";

type Variant = string;

/**
 * Simple A/B test hook.
 * - Assigns variant on first visit (stored in localStorage, stable per browser)
 * - Fires a "seen" event when mounted
 * - Returns { variant, track } — call track("cta_click") etc. on user actions
 */
export function useABTest(testName: string, variants: Variant[]): {
  variant: Variant;
  track: (event: string) => void;
} {
  const [variant, setVariant] = useState<Variant>(variants[0]);
  const seenFired = useRef(false);

  useEffect(() => {
    const key = `ab_${testName}`;
    let stored = localStorage.getItem(key);

    if (!stored || !variants.includes(stored)) {
      // Assign variant uniformly at random, persist it
      stored = variants[Math.floor(Math.random() * variants.length)];
      localStorage.setItem(key, stored);
    }

    setVariant(stored);
  }, [testName, variants]);

  // Fire "seen" once after variant is stable
  useEffect(() => {
    if (seenFired.current) return;
    seenFired.current = true;
    sendEvent(testName, variant, "seen");
  }, [testName, variant]);

  function track(event: string) {
    sendEvent(testName, variant, event);
  }

  return { variant, track };
}

function sendEvent(test: string, variant: string, event: string) {
  // Fire-and-forget — don't block UI
  fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ test, variant, event }),
    keepalive: true,
  }).catch(() => {});
}
