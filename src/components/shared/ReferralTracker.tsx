"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function ReferralTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Store ref code from URL in localStorage
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("referralCode", ref);
    }

    // Apply stored ref code if user is now signed in
    const stored = localStorage.getItem("referralCode");
    if (stored) {
      fetch("/api/referral/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: stored }),
      }).then(res => {
        if (res.ok) localStorage.removeItem("referralCode");
      }).catch(() => {});
    }
  }, [searchParams]);

  return null;
}
