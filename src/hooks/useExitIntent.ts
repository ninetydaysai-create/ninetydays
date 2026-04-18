"use client";

import { useEffect, useRef, useState } from "react";

interface UseExitIntentOptions {
  /** Minimum scroll-down distance (px) before exit intent activates */
  minScrollDepth?: number;
  /** How far user must scroll UP to trigger the re-engagement bar (mobile) */
  scrollUpThreshold?: number;
  /** Don't re-trigger within this many ms after last dismiss */
  cooldownMs?: number;
}

/**
 * Detects two exit signals:
 * 1. Desktop: mouse leaves the top of the viewport (heading toward browser chrome/close)
 * 2. Mobile/universal: user scrolls DOWN past a threshold, then scrolls UP > N px
 *
 * Returns { triggered } — true when exit intent fires.
 * Automatically resets after cooldown.
 */
export function useExitIntent({
  minScrollDepth = 400,
  scrollUpThreshold = 200,
  cooldownMs = 30_000,
}: UseExitIntentOptions = {}): { triggered: boolean; dismiss: () => void } {
  const [triggered, setTriggered] = useState(false);
  const lastScrollY = useRef(0);
  const maxScrollY = useRef(0);
  const lastDismissAt = useRef(0);
  const hasFiredForSession = useRef(false);

  function fire() {
    const now = Date.now();
    if (hasFiredForSession.current) return;
    if (now - lastDismissAt.current < cooldownMs) return;
    hasFiredForSession.current = true;
    setTriggered(true);
  }

  function dismiss() {
    setTriggered(false);
    lastDismissAt.current = Date.now();
    hasFiredForSession.current = false; // allow one more fire after cooldown
  }

  useEffect(() => {
    // ── Desktop: mouseleave from top ──────────────────────────────────────
    function onMouseLeave(e: MouseEvent) {
      if (e.clientY <= 10 && window.scrollY >= minScrollDepth) {
        fire();
      }
    }

    // ── Mobile / universal: scroll-up detection ───────────────────────────
    function onScroll() {
      const currentY = window.scrollY;
      if (currentY > maxScrollY.current) maxScrollY.current = currentY;

      const scrolledUp = lastScrollY.current - currentY;
      if (
        maxScrollY.current >= minScrollDepth &&
        scrolledUp >= scrollUpThreshold &&
        currentY < maxScrollY.current - scrollUpThreshold
      ) {
        fire();
      }

      lastScrollY.current = currentY;
    }

    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minScrollDepth, scrollUpThreshold, cooldownMs]);

  return { triggered, dismiss };
}
