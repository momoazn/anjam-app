import { clsx, type ClassValue } from "clsx";
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
