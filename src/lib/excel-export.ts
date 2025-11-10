import { format } from "date-fns-jalali";
import * as XLSX from "xlsx";
import type { ProjectsResponse, UsersResponse } from "./pocketbase-types";
import type { TaskWithProject } from "./pocketbase";

/**
 * Strips HTML tags from a string
 */
function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  // Create a temporary DOM element to parse HTML and extract text
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
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
    ready: "آماده",
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
  XLSX.utils.book_append_sheet(workbook, tasksSheet, "تسک‌های پروژه");

  // Generate filename with project name and current date
  const projectName = (project.name || "project")
    .replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, "_")
    .substring(0, 50);
  const currentDate = format(new Date(), "yyyy-MM-dd");
  const filename = `${projectName}-${currentDate}.xlsx`;

  // Write the file
  XLSX.writeFile(workbook, filename);
}
