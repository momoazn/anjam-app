import { format } from "date-fns-jalali";
import * as XLSX from "xlsx";

import { reports, tasks } from "@/constants";
import type { ConvexTaskPriority } from "@/lib/reports/types";

import type { Doc } from "../../convex/_generated/dataModel";
import { formatDateISO } from "./date-utils";

type ProjectExportTask = {
  _id: string;
  id: string;
  projectId: string;
  assigneeUserId?: string;
  title: string;
  description?: string;
  priority: ConvexTaskPriority;
  status: string;
  deadline?: number;
  _creationTime: number;
  updatedAt?: number;
  displayId?: string;
  timeSpentMinutes?: number;
};

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function getUserName(
  user:
    | (Doc<"users"> & { first_name?: string; last_name?: string })
    | undefined,
  fallback: string = "-",
): string {
  if (!user) return fallback;
  const firstName = user.firstName || user.first_name || "";
  const lastName = user.lastName || user.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || user.username || fallback;
}

function getStatusLabel(status: string | undefined): string {
  if (!status) return "-";
  return tasks.status[status as keyof typeof tasks.status] || status || "-";
}

function getPriorityLabel(priority: string | undefined): string {
  if (!priority) return "-";
  return (
    tasks.priority[priority as keyof typeof tasks.priority] || priority || "-"
  );
}

function configureSheetFormatting(
  sheet: XLSX.WorkSheet,
  columnWidths: number[],
  hasAutoFilter: boolean = true,
  freezeHeader: boolean = true,
): void {
  sheet["!cols"] = columnWidths.map((wch) => ({ wch }));

  if (hasAutoFilter && sheet["!ref"]) {
    sheet["!autofilter"] = { ref: sheet["!ref"] };
  }

  if (freezeHeader) {
    sheet["!freeze"] = { xSplit: 0, ySplit: 1 };
  }

  if (!sheet["!rows"]) sheet["!rows"] = [];
  sheet["!rows"][0] = { hpt: 20 };
}

function generateFilename(project: Doc<"projects">): string {
  const projectIdentifier = project.code || project._id.substring(0, 8);
  const projectName = (project.name || "project")
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")
    .substring(0, 40);
  const currentDate = format(new Date(), "yyyy-MM-dd");
  const timestamp = format(new Date(), "HHmmss");
  return `${projectIdentifier}_${projectName}_${currentDate}_${timestamp}.xlsx`;
}

export async function exportProjectToExcel(
  project: Doc<"projects"> & {
    expand?: {
      supervisor?: Doc<"users"> & { first_name?: string; last_name?: string };
    };
  },
  projectTasks: ProjectExportTask[],
  users: (Doc<"users"> & {
    id?: string;
    first_name?: string;
    last_name?: string;
  })[],
): Promise<void> {
  const workbook = XLSX.utils.book_new();

  const currentDate = format(new Date(), "yyyy/MM/dd HH:mm");
  workbook.Props = {
    Title: reports.excel.workbookTitle.replace(
      "{projectName}",
      project.name || reports.excel.fallbackProjectName,
    ),
    Subject: reports.excel.workbookSubject.replace(
      "{projectCode}",
      project.code || "",
    ),
    Author: reports.excel.workbookAuthor,
    CreatedDate: new Date(),
    Comments: reports.excel.workbookComments.replace("{date}", currentDate),
  };

  workbook.Workbook = {
    Views: [{ RTL: true }],
  };

  const projectData = [
    {
      [reports.excel.columns.name]: project.name || "-",
      [reports.excel.columns.code]: project.code || "-",
      [reports.excel.columns.description]: stripHtml(project.description),
      [reports.excel.columns.supervisor]: getUserName(
        project.expand?.supervisor,
        "-",
      ),
      [reports.excel.columns.createdAt]: formatDateISO(project._creationTime),
      [reports.excel.columns.updatedAt]: formatDateISO(
        project.updatedAt || project._creationTime,
      ),
    },
  ];

  const projectSheet = XLSX.utils.json_to_sheet(projectData);
  configureSheetFormatting(projectSheet, [25, 15, 50, 20, 15, 15], false);
  XLSX.utils.book_append_sheet(
    workbook,
    projectSheet,
    reports.excel.sheetProjectDetails,
  );

  const tasksData = projectTasks.map((task) => {
    const assignee = users.find(
      (u) => u._id === task.assigneeUserId || u.id === task.assigneeUserId,
    );
    return {
      [reports.excel.columns.taskNumber]: task.displayId || "-",
      [reports.excel.columns.taskTitle]: task.title || "-",
      [reports.excel.columns.taskStatus]: getStatusLabel(task.status),
      [reports.excel.columns.taskPriority]: getPriorityLabel(task.priority),
      [reports.excel.columns.taskAssignee]: getUserName(assignee, "-"),
      [reports.excel.columns.taskDeadline]: formatDateISO(task.deadline),
      [reports.excel.columns.createdAt]: formatDateISO(task._creationTime),
      [reports.excel.columns.updatedAt]: formatDateISO(
        task.updatedAt || task._creationTime,
      ),
      [reports.excel.columns.taskTimeSpent]: task.timeSpentMinutes || 0,
      [reports.excel.columns.taskDescription]: stripHtml(task.description),
    };
  });

  if (tasksData.length === 0) {
    tasksData.push({
      [reports.excel.columns.taskNumber]: "-",
      [reports.excel.columns.taskTitle]: reports.excel.noTasksMessage,
      [reports.excel.columns.taskStatus]: "-",
      [reports.excel.columns.taskPriority]: "-",
      [reports.excel.columns.taskAssignee]: "-",
      [reports.excel.columns.taskDeadline]: "-",
      [reports.excel.columns.createdAt]: "-",
      [reports.excel.columns.updatedAt]: "-",
      [reports.excel.columns.taskTimeSpent]: 0,
      [reports.excel.columns.taskDescription]: "-",
    });
  }

  const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
  configureSheetFormatting(
    tasksSheet,
    [10, 30, 15, 12, 20, 15, 15, 15, 18, 60],
  );
  XLSX.utils.book_append_sheet(
    workbook,
    tasksSheet,
    reports.excel.sheetProjectTasks,
  );

  const filename = generateFilename(project);
  XLSX.writeFile(workbook, filename);
}
