import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUserInitials(
  firstName?: string,
  lastName?: string,
  username?: string,
) {
  if (firstName && lastName) {
    return `${firstName.substring(0, 1)}${lastName.substring(0, 1)}`.toUpperCase();
  }
  if (username) {
    return username.substring(0, 2).toUpperCase();
  }
  return "?";
}

export function formatUserName(
  firstName?: string,
  lastName?: string,
  username?: string,
): string {
  const nameParts: string[] = [];

  if (firstName) nameParts.push(firstName.trim());
  if (lastName) nameParts.push(lastName.trim());

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
