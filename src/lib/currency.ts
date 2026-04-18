// Global currency support — detects user locale and formats prices accordingly.
// Stripe handles the actual currency conversion server-side via presentment currencies.
// This file handles display formatting only.

export const SUPPORTED_CURRENCIES = {
  USD: { symbol: "$", locale: "en-US", name: "US Dollar" },
  INR: { symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
  EUR: { symbol: "€", locale: "de-DE", name: "Euro" },
  GBP: { symbol: "£", locale: "en-GB", name: "British Pound" },
  AUD: { symbol: "A$", locale: "en-AU", name: "Australian Dollar" },
  CAD: { symbol: "C$", locale: "en-CA", name: "Canadian Dollar" },
  SGD: { symbol: "S$", locale: "en-SG", name: "Singapore Dollar" },
  AED: { symbol: "AED", locale: "ar-AE", name: "UAE Dirham" },
  BRL: { symbol: "R$", locale: "pt-BR", name: "Brazilian Real" },
  MXN: { symbol: "MX$", locale: "es-MX", name: "Mexican Peso" },
} as const;

export type CurrencyCode = keyof typeof SUPPORTED_CURRENCIES;

// Approximate USD → local currency conversion rates (updated periodically)
// In production, fetch live rates from an exchange rate API
export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
  AUD: 1.53,
  CAD: 1.36,
  SGD: 1.34,
  AED: 3.67,
  BRL: 4.97,
  MXN: 17.15,
};

// Pricing in USD (source of truth) — early access beta pricing
export const PRICING_USD = {
  PRO_MONTHLY: 9,
  PRO_MONTHLY_FULL: 19, // future price after beta
};

export function formatPrice(amountUsd: number, currency: CurrencyCode = "USD"): string {
  const rate = EXCHANGE_RATES[currency];
  const converted = amountUsd * rate;
  const { locale } = SUPPORTED_CURRENCIES[currency];

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(converted);
}

// Detect currency from browser locale (client-side only)
export function detectCurrencyFromLocale(): CurrencyCode {
  if (typeof window === "undefined") return "USD";

  const locale = navigator.language || "en-US";
  const region = locale.split("-")[1]?.toUpperCase();

  const regionCurrencyMap: Record<string, CurrencyCode> = {
    IN: "INR",
    DE: "EUR",
    FR: "EUR",
    IT: "EUR",
    ES: "EUR",
    NL: "EUR",
    GB: "GBP",
    AU: "AUD",
    CA: "CAD",
    SG: "SGD",
    AE: "AED",
    BR: "BRL",
    MX: "MXN",
    US: "USD",
  };

  return regionCurrencyMap[region] ?? "USD";
}
