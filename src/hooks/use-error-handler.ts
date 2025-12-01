import { useCallback } from "react";
import { handlePocketBaseError } from "@/lib/error-handler";

/**
 * React hook for standardized error handling
 * Wraps handlePocketBaseError for consistent error handling across components
 *
 * @returns A function to handle errors
 *
 * @example
 * ```tsx
 * const handleError = useErrorHandler();
 *
 * try {
 *   await someAsyncOperation();
 * } catch (error) {
 *   handleError(error);
 * }
 * ```
 */
export function useErrorHandler() {
  return useCallback((error: Error | unknown) => {
    if (error instanceof Error) {
      handlePocketBaseError(error);
    } else if (error && typeof error === "object" && "message" in error) {
      handlePocketBaseError(error as Error);
    } else {
      handlePocketBaseError(new Error(String(error)));
    }
  }, []);
}
