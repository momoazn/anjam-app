import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get initials from display name or email.
 */
export function getUserInitials(displayName?: string, email?: string): string {
  if (displayName) {
    const parts = displayName.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0]!.substring(0, 1)}${parts[1]!.substring(0, 1)}`.toUpperCase();
    }
    if (parts.length === 1 && parts[0]!.length > 1) {
      return parts[0]!.substring(0, 2).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  }

  if (email) {
    return email.substring(0, 2).toUpperCase();
  }

  return "?";
}

/**
 * Format user name for display - uses displayName or falls back to email.
 */
export function formatUserName(displayName?: string, email?: string): string {
  return displayName || email || "";
}

export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

/**
 * Generate a display name from an email address.
 * Examples:
 *   - john.doe@example.com → John Doe
 *   - jane_smith@example.com → Jane Smith
 *   - bob@example.com → Bob
 *   - alex.morgan-jones@example.com → Alex Morgan Jones
 */
export function displayNameFromEmail(email: string): string {
  if (!email) return "";

  const localPart = email.split("@")[0];
  if (!localPart) return "";

  // Replace common separators with spaces
  const withSpaces = localPart.replace(/[._-]/g, " ");
  // Split into words, capitalize first letter, join
  return withSpaces
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
