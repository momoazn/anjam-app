import type { TasksPriorityOptions } from "../pocketbase-types";

// Types for chart data
export type StatusDistributionData = {
  name: string;
  value: number;
  status: string;
};

export type PriorityDistributionData = {
  name: string;
  value: number;
  priority: string;
};

export type CompletionTrendData = {
  date: string;
  completed: number;
};

export type UserPerformanceData = {
  name: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
};

export type TaskStatsData = {
  statusDistribution: StatusDistributionData[];
  completionTrend: CompletionTrendData[];
  priorityDistribution: PriorityDistributionData[];
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
};

// Employee reporting types
export type EmployeeBucket = {
  key: string; // machine key (e.g. "2025-10-29" or "2025-W40" or "2025-10")
  label: string; // human display label (localized)
  count: number; // completed count in this bucket
};

export type EmployeeBucketsResult = {
  userId: string;
  name: string;
  buckets: EmployeeBucket[];
  totalCompleted: number;
};

export type EmployeeSummary = {
  userId: string;
  name: string;
  totalAssigned: number;
  completed: number;
  inProgress: number;
  overdue: number;
  avgTimeToCompleteDays: number;
  efficiencyScore: number;
  onTimeRate: number;
};

// Overtime and Workload types
export type OvertimeAnalysis = {
  userId: string;
  name: string;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  avgCompletionTime: number; // days
  workloadScore: number; // 0-100, higher = more overloaded
  overtimeIndicator: number; // hours of estimated overtime
};

export type WorkloadDistribution = {
  userId: string;
  name: string;
  activeTasks: number;
  upcomingTasks: number;
  overdueTasks: number;
  capacityUtilization: number; // 0-100%
  workloadLevel: "low" | "medium" | "high" | "critical";
};

// Leaderboard type
export type LeaderboardEntry = {
  userId: string;
  name: string;
  completed: number;
  completionRate: number;
  onTimeRate: number;
};

// Time range preset type
export type TimeRangePreset = "TODAY" | "7D" | "30D" | "QTD" | "YTD" | "CUSTOM";

// Bucket type for time-based aggregation
export type TimeBucket =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual";

// Filter controls type
export type FilterControls = {
  projectIds?: string[];
  assigneeIds?: string[];
  statuses?: string[];
  priorities?: TasksPriorityOptions[];
};

// Timeliness classification result
export type TimelinessClassification = {
  on_time: number;
  overdue: number;
  no_deadline: number;
};

// Overview metrics result
export type OverviewMetrics = {
  total: number;
  completed: number;
  wip: number;
  overdue: number;
  onTimeRate: number;
};

// Throughput data point
export type ThroughputDataPoint = {
  key: string;
  label: string;
  count: number;
};

// Priority count result
export type PriorityCount = {
  key: TasksPriorityOptions;
  name: string;
  value: number;
};
