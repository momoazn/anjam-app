import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { fa } from "@/constants/text";
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

    setIsExporting(true);
    try {
      await exportProjectToExcel(project, tasks, users);
      toast.success(fa.reports.exportProjectSuccess);
    } catch (error) {
      console.error("Error exporting project:", error);
      toast.error(fa.reports.exportProjectError);
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
          <span>{fa.reports.exportingProject}</span>
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          <span>{fa.reports.exportProject}</span>
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
