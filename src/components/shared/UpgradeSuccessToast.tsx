"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Reads ?upgraded=1 after Paddle checkout redirect.
 * Paddle webhooks fire asynchronously — poll /api/user/plan until plan=PRO
 * (up to ~10 seconds) before showing the success toast.
 */
export function UpgradeSuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    if (searchParams.get("upgraded") !== "1") return;
    handled.current = true;

    // Remove the query param immediately so refresh doesn't re-trigger
    const url = new URL(window.location.href);
    url.searchParams.delete("upgraded");
    url.searchParams.delete("plan");
    router.replace(url.pathname, { scroll: false });

    // Poll until webhook fires and plan flips to PRO (max 12s)
    let attempts = 0;
    const MAX_ATTEMPTS = 12;

    const toastId = toast.loading("Activating your Pro access…");

    const poll = async () => {
      attempts++;
      try {
        const res = await fetch("/api/user/plan");
        if (res.ok) {
          const data = await res.json();
          if (data.plan === "PRO") {
            toast.success("Pro access activated! All features are now unlocked.", {
              id: toastId,
              duration: 6000,
            });
            router.refresh(); // re-render server components with new plan
            return;
          }
        }
      } catch { /* ignore */ }

      if (attempts < MAX_ATTEMPTS) {
        setTimeout(poll, 1000);
      } else {
        // Webhook took too long — still show success (it'll catch up)
        toast.success("Payment received! Pro features will activate shortly.", {
          id: toastId,
          duration: 6000,
        });
      }
    };

    setTimeout(poll, 1500); // first check after 1.5s (give webhook a head start)
  }, [searchParams, router]);

  return null;
}
