import { format } from "date-fns-jalali";
import * as XLSX from "xlsx";
import { fa } from "@/constants/text";
import { formatDateISO } from "./date-utils";
import type { ProjectsResponse, UsersResponse } from "./pocketbase-types";
import type { TaskWithProject } from "./pocketbase";

/**
 * Strips HTML tags from a string securely
 * Uses DOMParser in browser, falls back to regex in SSR/Node environments
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";

  // Check if we're in a browser environment
  if (typeof document === "undefined" || typeof DOMParser === "undefined") {
    // Server-side fallback: regex-based stripping
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Remove styles
      .replace(/<[^>]+>/g, "") // Remove all HTML tags
      .replace(/&nbsp;/g, " ") // Replace &nbsp;
      .replace(/&[a-z]+;/gi, "") // Remove HTML entities
      .trim();
  }

  // Browser environment: use DOMParser (safer than innerHTML)
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.textContent || doc.body.innerText || "";
  } catch {
    // Fallback to regex if parsing fails
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }
}

/**
 * Gets the full name of a user
 */
function getUserName(
  user: UsersResponse | undefined,
  fallback: string = "-",
): string {
  if (!user) return fallback;
  const firstName = user.first_name || "";
  const lastName = user.last_name || "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || user.username || fallback;
}

/**
 * Gets the status label in Persian
 */
function getStatusLabel(status: string | undefined): string {
  if (!status) return "-";
  return (
    fa.tasks.status[status as keyof typeof fa.tasks.status] || status || "-"
  );
}

/**
 * Gets the priority label in Persian
 */
function getPriorityLabel(priority: string | undefined): string {
  if (!priority) return "-";
  return (
    fa.tasks.priority[priority as keyof typeof fa.tasks.priority] ||
    priority ||
    "-"
  );
}

/**
 * Configures Excel sheet formatting (column widths, auto-filter, frozen rows)
 */
function configureSheetFormatting(
  sheet: XLSX.WorkSheet,
  columnWidths: number[],
  hasAutoFilter: boolean = true,
  freezeHeader: boolean = true,
): void {
  // Set column widths
  sheet["!cols"] = columnWidths.map((wch) => ({ wch }));

  // Add auto-filter
  if (hasAutoFilter && sheet["!ref"]) {
    sheet["!autofilter"] = { ref: sheet["!ref"] };
  }

  // Freeze header row
  if (freezeHeader) {
    sheet["!freeze"] = { xSplit: 0, ySplit: 1 };
  }

  // Set header row height
  if (!sheet["!rows"]) sheet["!rows"] = [];
  sheet["!rows"][0] = { hpt: 20 };
}

/**
 * Generates a unique filename for the Excel export
 */
function generateFilename(
  project: ProjectsResponse<{ supervisor?: UsersResponse }>,
): string {
  const projectIdentifier = project.code || project.id.substring(0, 8);
  const projectName = (project.name || "project")
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")
    .substring(0, 40);
  const currentDate = format(new Date(), "yyyy-MM-dd");
  const timestamp = format(new Date(), "HHmmss");
  return `${projectIdentifier}_${projectName}_${currentDate}_${timestamp}.xlsx`;
}

/**
 * Exports a project with its tasks to an Excel file
 */
export async function exportProjectToExcel(
  project: ProjectsResponse<{ supervisor?: UsersResponse }>,
  tasks: TaskWithProject[],
  users: UsersResponse[],
): Promise<void> {
  // Filter tasks for this project
  const projectTasks = tasks.filter((task) => task.project === project.id);

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Add workbook properties
  const currentDate = format(new Date(), "yyyy/MM/dd HH:mm");
  workbook.Props = {
    Title: fa.reports.excel.workbookTitle.replace(
      "{projectName}",
      project.name || fa.reports.excel.fallbackProjectName,
    ),
    Subject: fa.reports.excel.workbookSubject.replace(
      "{projectCode}",
      project.code || "",
    ),
    Author: fa.reports.excel.workbookAuthor,
    CreatedDate: new Date(),
    Comments: fa.reports.excel.workbookComments.replace("{date}", currentDate),
  };

  // Set workbook views (RTL support for Persian)
  workbook.Workbook = {
    Views: [{ RTL: true }],
  };

  // Sheet 1: Project Details
  const projectData = [
    {
      [fa.reports.excel.columns.name]: project.name || "-",
      [fa.reports.excel.columns.code]: project.code || "-",
      [fa.reports.excel.columns.description]: stripHtml(project.description),
      [fa.reports.excel.columns.supervisor]: getUserName(
        project.expand?.supervisor,
        "-",
      ),
      [fa.reports.excel.columns.createdAt]: formatDateISO(project.created),
      [fa.reports.excel.columns.updatedAt]: formatDateISO(project.updated),
    },
  ];

  const projectSheet = XLSX.utils.json_to_sheet(projectData);
  // Configure column widths
  configureSheetFormatting(projectSheet, [25, 15, 50, 20, 15, 15], false);
  XLSX.utils.book_append_sheet(
    workbook,
    projectSheet,
    fa.reports.excel.sheetProjectDetails,
  );

  // Sheet 2: Tasks
  const tasksData = projectTasks.map((task) => {
    const assignee = users.find((u) => u.id === task.assignee);
    return {
      [fa.reports.excel.columns.taskNumber]: task.display_id || "-",
      [fa.reports.excel.columns.taskTitle]: task.title || "-",
      [fa.reports.excel.columns.taskStatus]: getStatusLabel(task.status),
      [fa.reports.excel.columns.taskPriority]: getPriorityLabel(task.priority),
      [fa.reports.excel.columns.taskAssignee]: getUserName(assignee, "-"),
      [fa.reports.excel.columns.taskDeadline]: formatDateISO(task.deadline),
      [fa.reports.excel.columns.createdAt]: formatDateISO(task.created),
      [fa.reports.excel.columns.updatedAt]: formatDateISO(task.updated),
      [fa.reports.excel.columns.taskTimeSpent]: task.time_spent_minutes || 0,
      [fa.reports.excel.columns.taskDescription]: stripHtml(task.description),
    };
  });

  // If no tasks, add a single row indicating no tasks
  if (tasksData.length === 0) {
    tasksData.push({
      [fa.reports.excel.columns.taskNumber]: "-",
      [fa.reports.excel.columns.taskTitle]: fa.reports.excel.noTasksMessage,
      [fa.reports.excel.columns.taskStatus]: "-",
      [fa.reports.excel.columns.taskPriority]: "-",
      [fa.reports.excel.columns.taskAssignee]: "-",
      [fa.reports.excel.columns.taskDeadline]: "-",
      [fa.reports.excel.columns.createdAt]: "-",
      [fa.reports.excel.columns.updatedAt]: "-",
      [fa.reports.excel.columns.taskTimeSpent]: 0,
      [fa.reports.excel.columns.taskDescription]: "-",
    });
  }

  const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
  // Configure column widths
  configureSheetFormatting(
    tasksSheet,
    [10, 30, 15, 12, 20, 15, 15, 15, 18, 60],
  );
  XLSX.utils.book_append_sheet(
    workbook,
    tasksSheet,
    fa.reports.excel.sheetProjectTasks,
  );

  // Generate unique filename
  const filename = generateFilename(project);

  // Write the file
  XLSX.writeFile(workbook, filename);
}
