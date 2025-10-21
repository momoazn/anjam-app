/**
 * App Data Preloader Component
 *
 * This component preloads essential app data to reduce the number of requests
 * when users navigate between pages. It should be placed at the app root level.
 */

import { useEffect } from "react";
import { useAppData } from "@/hooks";

interface AppDataPreloaderProps {
  children: React.ReactNode;
}

export function AppDataPreloader({ children }: AppDataPreloaderProps) {
  // Preload essential app data
  const { error } = useAppData();

  // Log errors for debugging
  useEffect(() => {
    if (error) {
      console.error("App data preloader error:", error);
    }
  }, [error]);

  // The preloader doesn't block rendering - it just starts the data fetching
  // The individual components will use the cached data when available
  return <>{children}</>;
}
