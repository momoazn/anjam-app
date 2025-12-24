import { Suspense } from "react";

import { EmployeePerformanceTable } from "@/components/reports/employee-performance-table";
import { Skeleton } from "@/components/ui/skeleton";
import { reports } from "@/constants";
import type { EmployeeSummary } from "@/lib/reports-utils";
import type { UsersResponse } from "@/lib/pocketbase-types";

type TableSectionProps = {
  summaries: EmployeeSummary[];
  users: UsersResponse[] | undefined;
  onSelectEmployee: (userId: string) => void;
  onDrilldown: (
    title: string,
    predicate: (task: { assignee: string }) => boolean,
  ) => void;
};

export function TableSection({
  summaries,
  users,
  onSelectEmployee,
  onDrilldown,
}: TableSectionProps) {
  return (
    <div dir="rtl">
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <EmployeePerformanceTable
          summaries={summaries}
          onRowClick={(userId) => {
            onSelectEmployee(userId);
            const user = users?.find((u) => u.id === userId);
            if (user) {
              onDrilldown(
                reports.charts.employee.performanceTable.drilldownTitle.replace(
                  "{name}",
                  user.first_name && user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.username,
                ),
                (task) => task.assignee === userId,
              );
            }
          }}
        />
      </Suspense>
    </div>
  );
}
