import { format } from "date-fns-jalali";
import * as XLSX from "xlsx";
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
 * Formats a date string to Persian/Jalali format
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "-";
    return format(date, "yyyy/MM/dd");
  } catch {
    return "-";
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
  const statusMap: Record<string, string> = {
    todo: "برای انجام",
    in_progress: "در حال انجام",
    pending: "در انتظار",
    review: "در حال بررسی",
    testing: "در حال تست",
    blocked: "مسدود شده",
    on_hold: "متوقف شده",
    done: "انجام‌شده",
    canceled: "لغوشده",
  };
  return statusMap[status || ""] || status || "-";
}

/**
 * Gets the priority label in Persian
 */
function getPriorityLabel(priority: string | undefined): string {
  const priorityMap: Record<string, string> = {
    urgent: "فوری",
    high: "بالا",
    medium: "متوسط",
    low: "پایین",
  };
  return priorityMap[priority || ""] || priority || "-";
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
  workbook.Props = {
    Title: `گزارش پروژه - ${project.name || "بدون نام"}`,
    Subject: `تسک‌های پروژه ${project.code || ""}`,
    Author: "سیستم مدیریت تسک",
    CreatedDate: new Date(),
    Comments: `صادر شده در تاریخ ${format(new Date(), "yyyy/MM/dd HH:mm")}`,
  };

  // Set workbook views (RTL support for Persian)
  workbook.Workbook = {
    Views: [{ RTL: true }],
  };

  // Sheet 1: Project Details
  const projectData = [
    {
      نام: project.name || "-",
      کد: project.code || "-",
      توضیحات: stripHtml(project.description),
      سرپرست: getUserName(project.expand?.supervisor, "-"),
      "تاریخ ایجاد": formatDate(project.created),
      "آخرین به‌روزرسانی": formatDate(project.updated),
    },
  ];

  const projectSheet = XLSX.utils.json_to_sheet(projectData);
  // Configure column widths: نام, کد, توضیحات, سرپرست, تاریخ ایجاد, آخرین به‌روزرسانی
  configureSheetFormatting(projectSheet, [25, 15, 50, 20, 15, 15], false);
  XLSX.utils.book_append_sheet(workbook, projectSheet, "جزئیات پروژه");

  // Sheet 2: Tasks
  const tasksData = projectTasks.map((task) => {
    const assignee = users.find((u) => u.id === task.assignee);
    return {
      شماره: task.display_id || "-",
      عنوان: task.title || "-",
      وضعیت: getStatusLabel(task.status),
      اولویت: getPriorityLabel(task.priority),
      مسئول: getUserName(assignee, "-"),
      مهلت: formatDate(task.deadline),
      "تاریخ ایجاد": formatDate(task.created),
      "آخرین به‌روزرسانی": formatDate(task.updated),
      "زمان صرف شده (دقیقه)": task.time_spent_minutes || 0,
      توضیحات: stripHtml(task.description),
    };
  });

  // If no tasks, add a single row indicating no tasks
  if (tasksData.length === 0) {
    tasksData.push({
      شماره: "-",
      عنوان: "این پروژه تسکی ندارد",
      وضعیت: "-",
      اولویت: "-",
      مسئول: "-",
      مهلت: "-",
      "تاریخ ایجاد": "-",
      "آخرین به‌روزرسانی": "-",
      "زمان صرف شده (دقیقه)": 0,
      توضیحات: "-",
    });
  }

  const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
  // Configure column widths: شماره, عنوان, وضعیت, اولویت, مسئول, مهلت, تاریخ ایجاد, آخرین به‌روزرسانی, زمان صرف شده, توضیحات
  configureSheetFormatting(
    tasksSheet,
    [10, 30, 15, 12, 20, 15, 15, 15, 18, 60],
  );
  XLSX.utils.book_append_sheet(workbook, tasksSheet, "تسک‌های پروژه");

  // Generate unique filename
  const filename = generateFilename(project);

  // Write the file
  XLSX.writeFile(workbook, filename);
}
