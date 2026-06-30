// ─── Company interview profiles ───────────────────────────────────────────────
// Each company has a weight map across SkillDimension keys.
// Weights must sum to 1.0. Used to compute a 0-100 readiness score
// from the user's current UserSkillScore records.

export interface CompanyProfile {
  name: string;
  logo: string;           // single character or short label shown in the UI
  tier: "faang" | "product" | "ai" | "fintech";
  interviewStyle: string; // shown as subtitle
  roles: string[];        // TargetRole values this company is relevant for
  weights: Record<string, number>;
}

export const COMPANY_PROFILES: CompanyProfile[] = [
  {
    name: "Google",       logo: "G",  tier: "faang",
    interviewStyle: "DSA + system design · 5–6 rounds",
    roles: ["product_swe","staff_eng","ml_eng","ai_pm","data_scientist"],
    weights: { problem_solving:0.30, system_design:0.28, communication:0.17, leadership:0.13, impact_writing:0.12 },
  },
  {
    name: "Meta",         logo: "M",  tier: "faang",
    interviewStyle: "Product sense + leadership + coding",
    roles: ["product_swe","staff_eng","ml_eng","ai_pm"],
    weights: { system_design:0.25, problem_solving:0.25, leadership:0.20, business_thinking:0.15, communication:0.15 },
  },
  {
    name: "Amazon",       logo: "A",  tier: "faang",
    interviewStyle: "Leadership Principles dominate every round",
    roles: ["product_swe","staff_eng","ml_eng","ai_pm","data_scientist"],
    weights: { leadership:0.30, ownership_language:0.22, system_design:0.18, communication:0.17, impact_writing:0.13 },
  },
  {
    name: "Apple",        logo: "⌘",  tier: "faang",
    interviewStyle: "Deep technical craftsmanship bar",
    roles: ["product_swe","staff_eng","ml_eng"],
    weights: { system_design:0.32, problem_solving:0.28, communication:0.20, impact_writing:0.12, leadership:0.08 },
  },
  {
    name: "Microsoft",    logo: "W",  tier: "faang",
    interviewStyle: "Growth mindset + design + system depth",
    roles: ["product_swe","staff_eng","ml_eng","ai_pm","data_scientist"],
    weights: { system_design:0.25, problem_solving:0.25, communication:0.20, leadership:0.18, business_thinking:0.12 },
  },
  {
    name: "Stripe",       logo: "S",  tier: "fintech",
    interviewStyle: "Exceptionally high bar · strong writing culture",
    roles: ["product_swe","staff_eng","ml_eng","ai_pm"],
    weights: { problem_solving:0.30, system_design:0.25, ownership_language:0.20, impact_writing:0.15, communication:0.10 },
  },
  {
    name: "OpenAI",       logo: "○",  tier: "ai",
    interviewStyle: "AI depth + research instinct + product judgment",
    roles: ["ml_eng","ai_pm","data_scientist","product_swe"],
    weights: { ai_knowledge:0.35, problem_solving:0.25, system_design:0.20, business_thinking:0.10, communication:0.10 },
  },
  {
    name: "Anthropic",    logo: "∆",  tier: "ai",
    interviewStyle: "Research rigour + safety mindset + clear writing",
    roles: ["ml_eng","ai_pm","data_scientist"],
    weights: { ai_knowledge:0.35, communication:0.25, problem_solving:0.20, system_design:0.15, leadership:0.05 },
  },
  {
    name: "Notion",       logo: "N",  tier: "product",
    interviewStyle: "Product intuition + communication + taste",
    roles: ["ai_pm","product_swe","staff_eng"],
    weights: { business_thinking:0.30, communication:0.30, system_design:0.18, leadership:0.12, impact_writing:0.10 },
  },
  {
    name: "Linear",       logo: "L",  tier: "product",
    interviewStyle: "Ownership + craftsmanship + high execution bar",
    roles: ["product_swe","staff_eng","ai_pm"],
    weights: { system_design:0.30, ownership_language:0.25, problem_solving:0.25, communication:0.10, impact_writing:0.10 },
  },
  {
    name: "Figma",        logo: "F",  tier: "product",
    interviewStyle: "Product + design instinct + technical depth",
    roles: ["ai_pm","product_swe","staff_eng"],
    weights: { business_thinking:0.25, system_design:0.25, communication:0.25, leadership:0.15, impact_writing:0.10 },
  },
  {
    name: "Airbnb",       logo: "⌂",  tier: "product",
    interviewStyle: "Cross-functional leadership + product sense",
    roles: ["ai_pm","product_swe","staff_eng"],
    weights: { business_thinking:0.30, communication:0.25, leadership:0.25, system_design:0.12, impact_writing:0.08 },
  },
];

// ─── Computation ──────────────────────────────────────────────────────────────

export interface CompanyReadinessResult {
  name: string;
  logo: string;
  tier: CompanyProfile["tier"];
  interviewStyle: string;
  score: number;            // 0-100
  status: string;
  statusColor: string;
  blockingDimensions: string[];
}

function readinessStatus(score: number): { status: string; color: string } {
  if (score >= 80) return { status: "Ready to apply",   color: "text-emerald-400" };
  if (score >= 65) return { status: "Apply this month", color: "text-emerald-400" };
  if (score >= 50) return { status: "Getting close",    color: "text-amber-400"   };
  if (score >= 35) return { status: "2–3 months away",  color: "text-amber-400"   };
  return              { status: "Build gaps first",    color: "text-red-400"     };
}

export function computeCompanyReadiness(
  userScores: Record<string, number>,
  profile: CompanyProfile
): CompanyReadinessResult {
  let weightedSum = 0;
  let totalWeight = 0;
  const entries: { dim: string; score: number; weight: number }[] = [];

  for (const [dim, weight] of Object.entries(profile.weights)) {
    const score = userScores[dim] ?? 0;
    weightedSum += score * weight;
    totalWeight += weight;
    entries.push({ dim, score, weight });
  }

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  // Blocking = lowest-scoring dimensions weighted by their importance to this company
  const blocking = entries
    .filter((e) => e.score < 65)
    .sort((a, b) => (a.score * a.weight) - (b.score * b.weight))
    .slice(0, 2)
    .map((e) => e.dim.replace(/_/g, " "));

  const { status, color } = readinessStatus(score);

  return {
    name: profile.name,
    logo: profile.logo,
    tier: profile.tier,
    interviewStyle: profile.interviewStyle,
    score,
    status,
    statusColor: color,
    blockingDimensions: blocking,
  };
}

export function getCompanyReadiness(
  userScores: Record<string, number>,
  targetRole: string
): CompanyReadinessResult[] {
  return COMPANY_PROFILES
    .filter((c) => c.roles.includes(targetRole))
    .map((c) => computeCompanyReadiness(userScores, c))
    .sort((a, b) => b.score - a.score);
}
