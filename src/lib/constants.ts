import { TargetRole } from "@prisma/client";

// ─── Plan Limits ─────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  FREE: {
    resumeAnalyses: 3,
    interviewSessionsPerMonth: 3,
    roadmapWeeksVisible: 4,
    jobApplications: 10,
    portfolioPublic: false,
    mentorMessagesPerDay: 10,      // ~$0.09/day max
    roadmapGenerations: 1,
    coverLettersPerMonth: 5,
    bulletRewritesPerMonth: 10,
    linkedinOptimizationsPerMonth: 1,
  },
  PRO: {
    resumeAnalyses: 20,            // 20 × $0.021 = $0.42/month
    interviewSessionsPerMonth: 50, // 50 × $0.006 = $0.30/month
    roadmapWeeksVisible: 12,
    jobApplications: 500,
    portfolioPublic: true,
    mentorMessagesPerDay: 100,     // avg 5/day × 30 × $0.009 = $1.35/month
    roadmapGenerations: 5,         //  5 × $0.060 = $0.30/month
    coverLettersPerMonth: 50,      // 50 × $0.014 = $0.70/month
    bulletRewritesPerMonth: 100,   // 100 × $0.008 = $0.80/month
    linkedinOptimizationsPerMonth: 10, // 10 × $0.014 = $0.14/month
    // Total worst-case: ~$4/month — 55% gross margin at $9/month
  },
} as const;

// ─── Target Role Labels ───────────────────────────────────────────────────────

export const ROLE_LABELS: Record<TargetRole, string> = {
  product_swe: "Product Company SWE",
  staff_eng: "Staff / Principal Engineer",
  ml_eng: "ML Engineer",
  ai_pm: "AI Product Manager",
  data_scientist: "Data Scientist",
};

export const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value: value as TargetRole,
  label,
}));

// ─── Company Options ──────────────────────────────────────────────────────────

export const COMPANY_OPTIONS = [
  { value: "Big4Consulting", label: "Big 4 / Consulting Firm" },
  { value: "LargeServiceCo", label: "Large IT Services Company" },
  { value: "Outsourcing", label: "Outsourcing / BPO Company" },
  { value: "Agency", label: "Digital Agency / Dev Shop" },
  { value: "Government", label: "Government / Public Sector" },
  { value: "Startup", label: "Early-stage Startup" },
  { value: "SMB", label: "SMB / Mid-size Company" },
  { value: "Product", label: "Already at a Product Company" },
  { value: "Other", label: "Other" },
];

// ─── Lemon Squeezy Variant IDs ────────────────────────────────────────────────
// One variant per plan — LS handles multi-currency internally.

export const LS_VARIANTS = {
  PRO_MONTHLY:    process.env.LS_VARIANT_PRO_MONTHLY!,    // $12/mo (₹899, £10, €11)
  PRO_MONTHLY_15: process.env.LS_VARIANT_PRO_MONTHLY_15!, // $15/mo mentor variant
  PRO_ANNUAL:     process.env.LS_VARIANT_PRO_ANNUAL!,     // $99/yr ($8.25/mo)
  SPRINT:         process.env.LS_VARIANT_SPRINT!,          // $49 one-time, 90-day access
};

// ─── Pricing Display ─────────────────────────────────────────────────────────

export const PRICING = {
  FREE:   { monthly: 0,  label: "Free" },
  PRO:    { monthly: 12, annual: 8.25, label: "Pro",  annualTotal: 99,  saving: "Save $45/yr" },
  PRO_15: { monthly: 15, annual: 12,   label: "Pro",  annualTotal: 144, saving: "Save $36/yr" },
  SPRINT: { oneTime: 49, label: "90-Day Sprint", days: 90 },
  TEAM:   { monthly: 29, annual: 22,   label: "Team", annualTotal: 264, saving: "Save $84/yr", seats: 5 },
} as const;

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/resume", label: "Resume", icon: "FileText" },
  { href: "/gaps", label: "Gap Engine", icon: "Target" },
  { href: "/roadmap", label: "Roadmap", icon: "Map" },
  { href: "/portfolio", label: "Portfolio", icon: "Briefcase" },
  { href: "/interview", label: "Interview Prep", icon: "MessageSquare" },
  { href: "/linkedin", label: "LinkedIn", icon: "Linkedin" },
  { href: "/github", label: "GitHub", icon: "Github" },
  { href: "/jobs", label: "Job Tracker", icon: "Kanban" },
];
