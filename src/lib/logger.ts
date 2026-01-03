const isDev = import.meta.env.DEV;

export function logError(
  message: string,
  error?: unknown,
  context?: Record<string, unknown>,
): void {
  if (!isDev) return;

  console.error(`[Error] ${message}`, error || "");
  if (context) console.error("[Context]", context);

  if (error && typeof error === "object") {
    console.error("[Error Details]", JSON.stringify(error, null, 2));
  }
}

export function logDebug(message: string, data?: unknown): void {
  if (!isDev) return;

  if (data !== undefined) {
    console.log(`[Debug] ${message}`, data);
  } else {
    console.log(`[Debug] ${message}`);
  }
}

export function logWarning(message: string, data?: unknown): void {
  if (!isDev) return;

  if (data !== undefined) {
    console.warn(`[Warning] ${message}`, data);
  } else {
    console.warn(`[Warning] ${message}`);
  }
}
