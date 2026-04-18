export * from "./resume";
export * from "./gaps";
export * from "./roadmap";
export * from "./interview";

export interface ApiError {
  error: string;
  upgradeRequired?: boolean;
}

export interface DashboardStats {
  roadmapProgressPct: number;
  currentWeekNumber: number;
  dayOfJourney: number;
  totalTasksCompleted: number;
  totalTasksRemaining: number;
  gapsClosed: number;
  totalGaps: number;
  interviewAvgScore: number | null;
  jobApplicationsCount: number;
  portfolioViews: number;
  streakDays: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  createdAt: string;
}
