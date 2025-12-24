import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { projects, reports } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { exportProjectToExcel } from "@/lib/excel-export";
import type { ProjectsResponse, UsersResponse } from "@/lib/pocketbase-types";
import type { TaskWithProject } from "@/lib/pocketbase";
import { toast } from "sonner";

type ProjectExportButtonProps = {
  project: ProjectsResponse<{ supervisor?: UsersResponse }>;
  tasks: TaskWithProject[];
  users: UsersResponse[];
  taskCount: number;
};

export function ProjectExportButton({
  project,
  tasks,
  users,
  taskCount,
}: ProjectExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    // Validate data before export
    if (!project) {
      toast.error(projects.errors.projectNotFound);
      return;
    }

    // Warn user about empty export
    if (taskCount === 0) {
      const confirmed = window.confirm(reports.exportProjectNoTasks);
      if (!confirmed) return;
    }

    setIsExporting(true);
    try {
      await exportProjectToExcel(project, tasks, users);

      // Show success message with task count if available
      const successMessage =
        taskCount > 0
          ? reports.exportProjectSuccessWithCount.replace(
              "{count}",
              digitsEnToFa(taskCount),
            )
          : reports.exportProjectSuccess;

      toast.success(successMessage, { duration: 3000 });
    } catch (error) {
      // Show specific error message if available
      const errorMessage =
        error instanceof Error ? error.message : reports.exportProjectError;

      toast.error(errorMessage, { duration: 5000 });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{reports.exportingProject}</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>{reports.exportProject}</span>
        </>
      )}
      {taskCount > 0 && (
        <span className="text-muted-foreground text-xs">
          ({digitsEnToFa(taskCount)})
        </span>
      )}
    </Button>
  );
}
