/**
 * Regional pricing configuration.
 * All prices are in local currency, PPP-adjusted.
 *
 * Lemon Squeezy handles multi-currency internally — one variant ID per plan
 * covers all regions. This file only manages display strings per region.
 *
 * Regions:
 *   IN  → INR  (India — major PPP discount, largest audience)
 *   GB  → GBP  (United Kingdom)
 *   EU  → EUR  (all EU member states)
 *   *   → USD  (default — US, CA, AU, SG, UAE, and everyone else)
 */

export type CurrencyCode = "usd" | "inr" | "gbp" | "eur";
export type PlanKey = "monthly" | "annual" | "sprint" | "monthly_15";

export interface PlanPrice {
  display: string;        // shown in UI  e.g. "₹699/mo"
  subDisplay?: string;    // secondary    e.g. "₹417/mo"
  badge?: string;         // e.g. "Save ₹3,389/yr"
  note: string;           // small print  e.g. "Cancel anytime"
  isOneTime?: boolean;
}

export interface RegionalPricing {
  country: string;         // ISO-3166-1 alpha-2
  currency: CurrencyCode;
  symbol: string;
  plans: Record<PlanKey, PlanPrice>;
}

// ─── EU member states ─────────────────────────────────────────────────────────
const EU_COUNTRIES = new Set([
  "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI",
  "FR","GR","HR","HU","IE","IT","LT","LU","LV","MT",
  "NL","PL","PT","RO","SE","SI","SK",
]);

// ─── Pricing tables ───────────────────────────────────────────────────────────

const USD: RegionalPricing = {
  country: "US",
  currency: "usd",
  symbol: "$",
  plans: {
    monthly:    { display: "$12/mo",    note: "Cancel anytime" },
    annual:     { display: "$99/yr",    subDisplay: "$8.25/mo", badge: "Save $45/yr", note: "Billed once yearly · price locks forever" },
    sprint:     { display: "$49",       note: "90-day full access · No subscription", isOneTime: true },
    monthly_15: { display: "$15/mo",    note: "Full AI mentor · Cancel anytime" },
  },
};

const INR: RegionalPricing = {
  country: "IN",
  currency: "inr",
  symbol: "₹",
  plans: {
    monthly:    { display: "₹899/mo",   note: "Cancel anytime" },
    annual:     { display: "₹5,999/yr", subDisplay: "₹500/mo",  badge: "Save ₹4,789/yr", note: "Billed once yearly · price locks forever" },
    sprint:     { display: "₹2,499",    note: "90-day full access · No subscription", isOneTime: true },
    monthly_15: { display: "₹1,199/mo", note: "Full AI mentor · Cancel anytime" },
  },
};

const GBP: RegionalPricing = {
  country: "GB",
  currency: "gbp",
  symbol: "£",
  plans: {
    monthly:    { display: "£10/mo",    note: "Cancel anytime" },
    annual:     { display: "£79/yr",    subDisplay: "£6.58/mo", badge: "Save £41/yr", note: "Billed once yearly · price locks forever" },
    sprint:     { display: "£39",       note: "90-day full access · No subscription", isOneTime: true },
    monthly_15: { display: "£12/mo",    note: "Full AI mentor · Cancel anytime" },
  },
};

const EUR: RegionalPricing = {
  country: "EU",
  currency: "eur",
  symbol: "€",
  plans: {
    monthly:    { display: "€11/mo",    note: "Cancel anytime" },
    annual:     { display: "€89/yr",    subDisplay: "€7.42/mo", badge: "Save €43/yr", note: "Billed once yearly · price locks forever" },
    sprint:     { display: "€44",       note: "90-day full access · No subscription", isOneTime: true },
    monthly_15: { display: "€14/mo",    note: "Full AI mentor · Cancel anytime" },
  },
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the regional pricing config for a given ISO-3166-1 alpha-2 country code.
 * Falls back to USD for any unrecognised country.
 */
export function getPricingForCountry(country: string): RegionalPricing {
  const c = country.toUpperCase();
  if (c === "IN") return INR;
  if (c === "GB") return GBP;
  if (EU_COUNTRIES.has(c)) return EUR;
  return USD;
}

/** Serialisable subset of RegionalPricing — safe to pass from Server → Client Components */
export interface ClientPricing {
  currency: CurrencyCode;
  symbol: string;
  plans: Record<PlanKey, { display: string; subDisplay?: string; badge?: string; note: string; isOneTime?: boolean }>;
}

export function toClientPricing(r: RegionalPricing): ClientPricing {
  return {
    currency: r.currency,
    symbol: r.symbol,
    plans: Object.fromEntries(
      Object.entries(r.plans).map(([k, v]) => [
        k,
        { display: v.display, subDisplay: v.subDisplay, badge: v.badge, note: v.note, isOneTime: v.isOneTime },
      ])
    ) as ClientPricing["plans"],
  };
}
