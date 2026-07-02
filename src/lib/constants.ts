import { TargetRole } from "@prisma/client";

// ─── Plan Limits ─────────────────────────────────────────────────────────────

export const PLAN_LIMITS = {
  FREE: {
    resumeAnalyses: 3,
    interviewSessionsPerMonth: 3,
    roadmapWeeksVisible: 4,
    jobApplications: 10,
    portfolioPublic: false,
    mentorMessagesPerDay: 10,          // ~$0.09/day max
    roadmapGenerations: 1,
    coverLettersPerMonth: 5,
    bulletRewritesPerMonth: 10,
    linkedinOptimizationsPerMonth: 1,
    githubOptimizationsPerMonth: 2,
    portfolioBioPerMonth: 5,
  },
  PRO: {
    resumeAnalyses: 20,                // 20 × $0.021 = $0.42/month
    interviewSessionsPerMonth: 50,     // 50 × $0.006 = $0.30/month
    roadmapWeeksVisible: 12,
    jobApplications: 500,
    portfolioPublic: true,
    mentorMessagesPerDay: 100,         // avg 5/day × 30 × $0.009 = $1.35/month
    roadmapGenerations: 5,             //  5 × $0.060 = $0.30/month
    coverLettersPerMonth: 50,          // 50 × $0.014 = $0.70/month
    bulletRewritesPerMonth: 100,       // 100 × $0.008 = $0.80/month
    linkedinOptimizationsPerMonth: 10, // 10 × $0.014 = $0.14/month
    githubOptimizationsPerMonth: 10,
    portfolioBioPerMonth: 30,
    // Total worst-case: ~$4/month — 67% gross margin at $12/month
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

// ─── Pricing Display ─────────────────────────────────────────────────────────

export const PRICING = {
  FREE:   { monthly: 0,  label: "Free" },
  PRO:    { monthly: 12, annual: 8.25, label: "Pro", annualTotal: 99, saving: "Save $45/yr" },
  SPRINT: { oneTime: 59, label: "90-Day Sprint", days: 90 },
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
