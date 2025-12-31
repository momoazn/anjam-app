import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/hooks/query-keys";
import { type SearchResponse, search } from "@/lib/search-service";

export type { SearchResponse };

export function useGlobalSearch(query: string) {
  return useQuery<SearchResponse>({
    queryKey: queryKeys.globalSearch.byQuery(query),
    queryFn: () => search(query),
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}
