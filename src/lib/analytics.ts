/**
 * Server-side PostHog event capture.
 * Uses the REST /capture/ endpoint — no extra SDK needed.
 * Fire-and-forget: never blocks a response, never throws.
 *
 * Client-side events use trackEvent() from src/lib/posthog.ts directly.
 */

const API_KEY  = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const API_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";

export function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): void {
  if (!API_KEY || !distinctId) return;

  fetch(`${API_HOST}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key:     API_KEY,
      event,
      distinct_id: distinctId,
      properties:  { ...properties, $lib: "ninetydays-server" },
      timestamp:   new Date().toISOString(),
    }),
  }).catch(() => {}); // silently swallow network errors — analytics must never break the app
}

// ─── Typed event catalogue ────────────────────────────────────────────────────
// Keep event names in one place so they're searchable and consistent.

export const EVENTS = {
  ONBOARDING_COMPLETED: "onboarding_completed",
  ROADMAP_GENERATED:    "roadmap_generated",
  RESUME_ANALYZED:      "resume_analyzed",
  CHALLENGE_COMPLETED:  "challenge_completed",
  INTERVIEW_COMPLETED:  "interview_completed",
  GOAL_SAVED:           "goal_saved",
  PORTFOLIO_EXPORTED:   "portfolio_exported",
  CHECKOUT_STARTED:     "checkout_started",
  PAYMENT_COMPLETED:    "payment_completed",
  STEP_COMPLETED:       "step_completed",
  DELIVERABLE_CREATED:  "deliverable_created",
  TIMELINE_VIEWED:      "timeline_viewed",
  TASK_OPENED:          "task_opened",
} as const;
