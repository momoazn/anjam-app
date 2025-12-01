/**
 * Centralized logging utility
 * All logging is gated behind DEV mode check to prevent console output in production
 */

const isDev = import.meta.env.DEV;

/**
 * Logs error messages (only in development)
 * @param message - Error message or description
 * @param error - Optional error object
 * @param context - Optional context object for additional debugging info
 */
export function logError(
  message: string,
  error?: unknown,
  context?: Record<string, unknown>,
): void {
  if (!isDev) return;

  console.error(`[Error] ${message}`, error || "");
  if (context) {
    console.error("[Context]", context);
  }

  // Try to stringify error for better debugging
  if (error && typeof error === "object") {
    try {
      console.error("[Error Details]", JSON.stringify(error, null, 2));
    } catch {
      console.error("[Error Details]", "Could not stringify error");
    }
  }
}

/**
 * Logs debug messages (only in development)
 * @param message - Debug message
 * @param data - Optional data to log
 */
export function logDebug(message: string, data?: unknown): void {
  if (!isDev) return;

  if (data !== undefined) {
    console.log(`[Debug] ${message}`, data);
  } else {
    console.log(`[Debug] ${message}`);
  }
}

/**
 * Logs warning messages (only in development)
 * @param message - Warning message
 * @param data - Optional data to log
 */
export function logWarning(message: string, data?: unknown): void {
  if (!isDev) return;

  if (data !== undefined) {
    console.warn(`[Warning] ${message}`, data);
  } else {
    console.warn(`[Warning] ${message}`);
  }
}
