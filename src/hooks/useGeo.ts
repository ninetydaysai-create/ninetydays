"use client";

import { useEffect, useState } from "react";
import type { ClientPricing, CurrencyCode } from "@/lib/geo-pricing";

// USD defaults — shown on first render before fetch completes (avoids layout shift)
const USD_DEFAULT: ClientPricing = {
  currency: "usd",
  symbol: "$",
  plans: {
    monthly:    { display: "$12/mo",    note: "Cancel anytime" },
    annual:     { display: "$99/yr",    subDisplay: "$8.25/mo", badge: "Save $45/yr", note: "Billed once yearly" },
    sprint:     { display: "$49",       note: "90-day full access · No subscription", isOneTime: true },
    monthly_15: { display: "$15/mo",    note: "Full AI mentor · Cancel anytime" },
  },
};

const GEO_CACHE_KEY = "geo_v1";

interface GeoResult {
  country: string;
  pricing: ClientPricing;
  loaded: boolean;
}

export function useGeo(): GeoResult {
  const [result, setResult] = useState<GeoResult>({
    country: "US",
    pricing: USD_DEFAULT,
    loaded: false,
  });

  useEffect(() => {
    // Try localStorage cache first (avoids flash on subsequent page loads)
    try {
      const cached = localStorage.getItem(GEO_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as GeoResult & { ts: number };
        // Cache valid for 24 hours
        if (Date.now() - parsed.ts < 86_400_000) {
          setResult({ country: parsed.country, pricing: parsed.pricing, loaded: true });
          return;
        }
      }
    } catch {}

    fetch("/api/geo")
      .then((r) => r.json())
      .then((data: { country: string; pricing: ClientPricing }) => {
        const geo = { country: data.country, pricing: data.pricing, loaded: true };
        setResult(geo);
        try {
          localStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ ...geo, ts: Date.now() }));
        } catch {}
      })
      .catch(() => {
        setResult((prev) => ({ ...prev, loaded: true }));
      });
  }, []);

  return result;
}
