import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserInitials(
  first_name?: string,
  last_name?: string,
  username?: string,
) {
  if (first_name && last_name) {
    return `${first_name.substring(0, 1)}${last_name.substring(0, 1)}`.toUpperCase();
  }
  if (username) {
    return username.substring(0, 2).toUpperCase();
  }
  return "?";
}

export function formatUserName(
  first_name?: string,
  last_name?: string,
  username?: string,
): string {
  const nameParts: string[] = [];

  if (first_name) nameParts.push(first_name.trim());
  if (last_name) nameParts.push(last_name.trim());

  const fullName = nameParts.join(" ").trim();

  if (fullName && username) {
    return `${fullName} - ${username}`;
  }

  if (fullName) {
    return fullName;
  }

  return username ?? "";
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}
