import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { projects, reports } from "@/constants";
import type { Doc } from "@/lib/convex";
import { exportProjectToExcel } from "@/lib/excel-export";
import type { ConvexTask, ConvexUser } from "@/lib/reports/types";

// Convex project type (minimal)
type ConvexProject = {
  _id: string;
  id: string; // Compatibility alias
  name: string;
  code: string;
  description?: string;
  _creationTime: number;
};

type ProjectExportButtonProps = {
  project: ConvexProject;
  tasks: ConvexTask[];
  users: ConvexUser[];
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
      // Create a compatible project object for the export function
      const exportProject: Doc<"projects"> & {
        expand?: {
          supervisor?: Doc<"users"> & {
            first_name?: string;
            last_name?: string;
          };
        };
      } = {
        _id: project._id as Doc<"projects">["_id"],
        _creationTime: project._creationTime,
        name: project.name,
        code: project.code,
        description: project.description,
        organizationId: "" as Doc<"projects">["organizationId"],
        updatedAt: undefined,
        supervisorUserId: undefined,
      };

      // Convert users to the expected format
      const exportUsers = users.map((u) => ({
        _id: u._id as Doc<"users">["_id"],
        _creationTime: 0,
        name: u.name,
        image: undefined,
        email: u.username ? `${u.username}@example.com` : undefined,
        emailVerified: undefined,
        username: u.username,
        firstName: u.firstName,
        lastName: u.lastName,
        first_name: u.first_name,
        last_name: u.last_name,
        updatedAt: undefined,
      }));

      await exportProjectToExcel(exportProject, tasks, exportUsers);

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
