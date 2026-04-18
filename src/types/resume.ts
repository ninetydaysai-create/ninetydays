import { TargetRole } from "@prisma/client";

export interface WeakBullet {
  original: string;
  rewrite: string;
  reason: string;
}

export type SignalDepth = "STRONG" | "MODERATE" | "WEAK" | "ABSENT";

export interface RoleMatchScore {
  role: TargetRole;
  score: number; // 0-100
  missingSignals: string[];
}

export interface TechYears {
  [technology: string]: number;
}

export interface ResumeAnalysisResult {
  overallScore: number;
  skillsFound: string[];       // only skills with demonstrated project evidence
  techYears: TechYears;
  starStoriesCount: number;
  impactScore: number;
  projectComplexity: number;
  keywordDensityScore?: number;   // legacy column — kept for DB compat
  signalDepthScore?: number;      // replaces keywordDensityScore: overall evidence quality
  signalDepthMap?: Record<string, SignalDepth>; // per-skill evidence classification
  weakBullets: WeakBullet[];
  roleMatchScores: RoleMatchScore[];
  summary: string;
}
