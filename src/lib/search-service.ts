/**
 * Search Service
 *
 * Provides type-safe functions for global search across tasks and projects.
 */
import { pb } from "./pocketbase";

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

/**
 * Performs a global search across tasks and projects.
 * @param query - The search query (minimum 2 characters)
 * @returns Search results with matching tasks and projects
 */
export async function search(query: string): Promise<SearchResponse> {
  const res = await pb.send<{ data: SearchResponse }>("/api/v1/search", {
    params: { q: query },
  });
  return res.data;
}
