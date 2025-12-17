import { useQuery } from "@tanstack/react-query";
import { pb } from "@/lib/pocketbase";

export interface SearchResultTask {
  id: string;
  title: string;
  display_id: string;
  status: string;
  project: string;
  project_name: string;
}

export interface SearchResultProject {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface SearchResponse {
  tasks: SearchResultTask[];
  projects: SearchResultProject[];
}

export function useGlobalSearch(query: string) {
  return useQuery<SearchResponse>({
    queryKey: ["global-search", query],
    queryFn: async () => {
      // Using send() to call the custom endpoint
      const res = await pb.send<{ data: SearchResponse }>("/api/v1/search", {
        params: { q: query },
      });
      return res.data;
    },
    enabled: query.trim().length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
