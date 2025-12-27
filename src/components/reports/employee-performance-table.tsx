import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconArrowsSort,
  IconDownload,
  IconUser,
  IconHash,
  IconCircleCheck,
  IconClock,
  IconActivity,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { reports } from "@/constants";
import type { EmployeeSummary } from "@/lib/reports-utils";
import { cn } from "@/lib/utils";

type SortField = keyof EmployeeSummary;
type SortDirection = "asc" | "desc";

type Props = {
  summaries: EmployeeSummary[];
  onRowClick?: (userId: string) => void;
};

export function EmployeePerformanceTable({ summaries, onRowClick }: Props) {
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedSummaries = useMemo(() => {
    return [...summaries].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [summaries, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExportCsv = () => {
    toast.info(reports.charts.employee.performanceTable.exportCsvComingSoon);
  };

  if (summaries.length === 0) {
    return (
      <div className="border-border/40 flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center opacity-30 grayscale">
        <p className="text-[10px] font-bold tracking-tight">
          {reports.charts.employee.emptyStates.noData}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-border/20 flex items-center justify-between border-b pb-4">
        <h3 className="text-sm font-bold tracking-tight">
          {reports.charts.employee.performanceTable.title}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="border-border bg-card h-10 rounded-xl border text-[10px] font-bold tracking-tight shadow-sm transition-all active:shadow-none"
        >
          <IconDownload className="ms-2 size-4" />
          {reports.charts.employee.performanceTable.exportCsv}
        </Button>
      </div>

      <div
        className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden rounded-xl border"
        data-animate-stagger
      >
        {/* Table Head  */}
        <div className="bg-muted/20 border-border/40 grid h-10 grid-cols-6 border-b">
          {[
            {
              field: "name",
              label: reports.charts.employee.performanceTable.columns.name,
              icon: IconUser,
            },
            {
              field: "totalAssigned",
              label:
                reports.charts.employee.performanceTable.columns.totalAssigned,
              icon: IconHash,
            },
            {
              field: "completed",
              label: reports.charts.employee.performanceTable.columns.completed,
              icon: IconCircleCheck,
            },
            {
              field: "efficiencyScore",
              label:
                reports.charts.employee.performanceTable.columns.completionRate,
              icon: IconClock,
            },
            {
              field: "onTimeRate",
              label:
                reports.charts.employee.performanceTable.columns.onTimeRate,
              icon: IconActivity,
            },
            {
              field: "avgTimeToCompleteDays",
              label:
                reports.charts.employee.performanceTable.columns
                  .avgTimeToComplete,
              icon: IconClock,
            },
          ].map((col) => (
            <button
              key={col.field}
              type="button"
              onClick={() => handleSort(col.field as SortField)}
              className="hover:bg-muted/30 border-border/10 flex items-center justify-center gap-2 border-s transition-colors last:border-s-0"
            >
              <col.icon className="text-primary/40 size-3" />
              <span className="text-[9px] font-bold tracking-tight opacity-60">
                {col.label}
              </span>
              <IconArrowsSort
                className={cn(
                  "size-2.5 opacity-20",
                  sortField === col.field && "text-primary opacity-100",
                )}
              />
            </button>
          ))}
        </div>

        {/* Table Body Modules */}
        {sortedSummaries.map((summary) => (
          <button
            key={summary.userId}
            type="button"
            onClick={() => onRowClick?.(summary.userId)}
            className={cn(
              "group bg-card hover:bg-muted/30 relative grid grid-cols-6 overflow-hidden text-right transition-all",
              onRowClick && "cursor-pointer",
            )}
          >
            <div className="border-border/10 flex items-center justify-end border-s p-4 text-[11px] font-bold tracking-tight">
              {summary.name}
            </div>
            <div className="border-border/10 flex items-center justify-center border-s p-4 text-xs font-bold tabular-nums opacity-60">
              {digitsEnToFa(summary.totalAssigned)}
            </div>
            <div className="border-border/10 flex items-center justify-center border-s p-4 text-xs font-bold text-emerald-500/80 tabular-nums">
              {digitsEnToFa(summary.completed)}
            </div>
            <div className="border-border/10 flex items-center justify-center border-s p-4 text-xs font-bold tabular-nums">
              {digitsEnToFa(Math.round(summary.efficiencyScore * 100))}%
            </div>
            <div className="border-border/10 flex items-center justify-center border-s p-4 text-xs font-bold tabular-nums">
              {digitsEnToFa(Math.round(summary.onTimeRate * 100))}%
            </div>
            <div className="flex items-center justify-center p-4 text-xs font-bold tabular-nums opacity-40">
              {summary.avgTimeToCompleteDays > 0
                ? digitsEnToFa(Math.round(summary.avgTimeToCompleteDays))
                : "—"}
            </div>

            <div className="bg-primary absolute end-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
