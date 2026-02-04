import { useQuery } from "convex/react";

import { type Id, api } from "@/lib/convex";
import {
  useAuthIsAuthenticatedStrict,
  useCurrentOrganization,
} from "@/store/app-context-store";

interface SearchTaskResult {
  id: string;
  _id: Id<"tasks">;
  title: string;
  displayId: string;
  status: string;
  projectCode?: string;
  projectName?: string;
}

interface SearchProjectResult {
  id: string;
  _id: Id<"projects">;
  name: string;
  code: string;
}

export type SearchResponse = {
  tasks: SearchTaskResult[];
  projects: SearchProjectResult[];
};

export function useGlobalSearch(query: string) {
  const isAuthenticated = useAuthIsAuthenticatedStrict();
  const currentOrg = useCurrentOrganization();
  const organizationId = currentOrg?._id as Id<"organizations"> | undefined;

  const results = useQuery(
    api.search.globalSearch,
    isAuthenticated && organizationId && query.trim().length >= 2
      ? { organizationId, q: query }
      : "skip",
  );

  const isLoading = results === undefined;

  const data: SearchResponse | undefined = results
    ? {
        tasks: results.tasks.map((task) => ({
          id: task._id,
          _id: task._id,
          title: task.title,
          displayId: task.displayId,
          status: task.status,
          projectCode: "",
          projectName: "",
        })),
        projects: results.projects.map((project) => ({
          id: project._id,
          _id: project._id,
          name: project.name,
          code: project.code,
        })),
      }
    : undefined;

  return { data, isLoading };
}
