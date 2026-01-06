import { useQuery } from "convex/react";

import { api } from "@/lib/convex";

export function useInviteByToken(token: string | undefined, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const invite = useQuery(
    api.invites.getByToken,
    enabled && token ? { token } : "skip",
  );

  return {
    data: invite,
    isLoading: invite === undefined,
  };
}

