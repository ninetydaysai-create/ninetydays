export type GapSeverity = "critical" | "major" | "minor";

export interface GapItem {
  id: string;
  label: string;
  description: string;
  severity: GapSeverity;
  estimatedHours: number;
  resourceLinks: string[];
  resolved: boolean;
}

export interface GapReportResult {
  skillGaps: GapItem[];
  projectGaps: GapItem[];
  storyGaps: GapItem[];
  totalGapScore: number; // 0–100, lower = more gaps remaining
  summary: string;
}
