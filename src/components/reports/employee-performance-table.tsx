import { digitsEnToFa } from "@persian-tools/persian-tools";
import { ArrowUpDown, Download } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fa } from "@/constants/text";
import type { EmployeeSummary } from "@/lib/reports-utils";

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
    // CSV export functionality (deferred per user request)
    toast.info(fa.reports.charts.employee.performanceTable.exportCsvComingSoon);
  };

  if (summaries.length === 0) {
    return (
      <div className="text-muted-foreground flex h-32 items-center justify-center rounded-md border border-dashed text-sm">
        {fa.reports.charts.employee.emptyStates.noData}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {fa.reports.charts.employee.performanceTable.title}
        </h3>
        <Button variant="outline" size="sm" onClick={handleExportCsv}>
          <Download className="mr-2 h-4 w-4" />
          {fa.reports.charts.employee.performanceTable.exportCsv}
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-48">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort("name")}
                >
                  {fa.reports.charts.employee.performanceTable.columns.name}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort("totalAssigned")}
                >
                  {
                    fa.reports.charts.employee.performanceTable.columns
                      .totalAssigned
                  }
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort("completed")}
                >
                  {
                    fa.reports.charts.employee.performanceTable.columns
                      .completed
                  }
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort("efficiencyScore")}
                >
                  {
                    fa.reports.charts.employee.performanceTable.columns
                      .completionRate
                  }
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort("onTimeRate")}
                >
                  {
                    fa.reports.charts.employee.performanceTable.columns
                      .onTimeRate
                  }
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort("avgTimeToCompleteDays")}
                >
                  {
                    fa.reports.charts.employee.performanceTable.columns
                      .avgTimeToComplete
                  }
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSummaries.map((summary) => (
              <TableRow
                key={summary.userId}
                onClick={() => onRowClick?.(summary.userId)}
                className={onRowClick ? "hover:bg-muted/50 cursor-pointer" : ""}
              >
                <TableCell className="font-medium">{summary.name}</TableCell>
                <TableCell className="text-center">
                  {digitsEnToFa(summary.totalAssigned)}
                </TableCell>
                <TableCell className="text-center">
                  {digitsEnToFa(summary.completed)}
                </TableCell>
                <TableCell className="text-center">
                  {digitsEnToFa(Math.round(summary.efficiencyScore * 100))}%
                </TableCell>
                <TableCell className="text-center">
                  {digitsEnToFa(Math.round(summary.onTimeRate * 100))}%
                </TableCell>
                <TableCell className="text-center">
                  {summary.avgTimeToCompleteDays > 0
                    ? digitsEnToFa(Math.round(summary.avgTimeToCompleteDays))
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
