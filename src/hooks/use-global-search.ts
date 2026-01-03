import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { pb } from "@/lib/pocketbase";

export type SearchResponse = {
  tasks: Array<{
    id: string;
    title: string;
    display_id: string;
    project_code: string;
    project_name: string;
    status: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  users: Array<{
    id: string;
    name: string;
    avatar: string;
  }>;
};

export function useGlobalSearch(query: string) {
  return useQuery<SearchResponse>({
    queryKey: queryKeys.globalSearch.byQuery(query),
    queryFn: () =>
      pb.send<SearchResponse>("/api/v1/search", { params: { q: query } }),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}
