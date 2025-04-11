import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper to get user initials
export function getUserInitials(username?: string) {
  // Assuming assignedTo contains usernames like 'user-1'
  // If it contains full names, this logic needs adjustment
  return username
    ? username.substring(0, 2).toUpperCase() // Simple initials for 'user-X'
    : "?";
}
