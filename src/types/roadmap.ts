export interface RoadmapTaskData {
  id: string;
  label: string;
  description?: string;
  resourceUrls: string[];
  hours: number;
  completed: boolean;
  completedAt?: string;
}

export interface RoadmapWeekData {
  id: string;
  weekNumber: number;
  theme: string;
  estimatedHours: number;
  deliverable: string;
  deliverableUrl?: string;
  deliverableDone: boolean;
  tasks: RoadmapTaskData[];
}

export interface RoadmapData {
  id: string;
  startedAt: string;
  targetRole: string;
  weeks: RoadmapWeekData[];
  currentWeekIndex: number; // 0-based, computed from startedAt
  progressPct: number; // 0–100
}
