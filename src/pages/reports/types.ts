import type { Filters, TimeRange } from "@/components/reports/filters-bar";

export type DrilldownState = {
  title: string;
  rows: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    deadline: string | null;
    ageDays: number;
    assigneeName: string;
    projectName: string;
    tags: string[];
  }>;
} | null;

export type TimelinessDatum = {
  key: "on_time" | "overdue" | "no_deadline";
  name: string;
  value: number;
};

export type FilterState = {
  timeRange: TimeRange;
  filters: Filters;
};

export type BucketType =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "annual";
