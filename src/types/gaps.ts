export type GapSeverity = "critical" | "major" | "minor";
export type FixStrategy = "learn" | "build" | "document" | "reframe";

export interface GapItem {
  id: string;
  label: string;
  description: string;
  severity: GapSeverity;
  estimatedHours: number;
  resourceLinks: string[];
  resolved: boolean;
  impactIfIgnored?: string;
  fixStrategy?: FixStrategy;   // how to close this gap based on current signal depth
  interviewQuestion?: string;  // exact question they'd fail without fixing this
}

export interface GapReportResult {
  skillGaps: GapItem[];
  projectGaps: GapItem[];
  storyGaps: GapItem[];
  totalGapScore: number; // 0–100, lower = more gaps remaining
  summary: string;
}
