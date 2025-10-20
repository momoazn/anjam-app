/**
 * Authentication-related React Query hooks
 *
 * Provides hooks for authentication state management and initial admin setup.
 */

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";

/**
 * Hook to check if the current user is the initial admin
 * @returns React Query result indicating if user is initial admin
 */
export function useIsInitialAdmin() {
  return useQuery({
    queryKey: queryKeys.auth.isInitialAdmin,
    queryFn: async (): Promise<boolean> => {
      try {
        const response = await fetch("/api/tm/is-initial");

        if (response.status === 204) {
          return true;
        }

        if (!response.ok) {
          return false;
        }

        const payload = (await response.json()) as { exists?: boolean };
        return !(payload?.exists ?? false);
      } catch (error) {
        console.error("Error checking initial admin status:", error);
        return false;
      }
    },
  });
}
