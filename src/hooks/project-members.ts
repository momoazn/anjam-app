import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import type {
  ProjectMembersResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";

import { queryKeys } from "./query-keys";

type ProjectRole = "owner" | "admin" | "member" | "viewer";

interface ProjectMemberWithUser extends ProjectMembersResponse {
  expand?: {
    user?: UsersResponse;
    added_by?: UsersResponse;
  };
}

interface UseProjectMembersOptions {
  enabled?: boolean;
}

interface AddProjectMemberInput {
  projectId: string;
  userId: string;
  role: ProjectRole;
}

interface UpdateProjectMemberRoleInput {
  memberId: string;
  role: ProjectRole;
}

function buildProjectMemberFilter(projectId: string): string {
  return `project = "${projectId}"`;
}

export function useProjectMembers(
  projectId: string,
  options?: UseProjectMembersOptions,
) {
  return useQuery({
    queryKey: queryKeys.projectMembers.list(projectId),
    queryFn: async (): Promise<ProjectMemberWithUser[]> => {
      if (!projectId) throw new Error("No project selected");

      const records = await pb
        .collection("project_members")
        .getFullList<ProjectMemberWithUser>({
          filter: buildProjectMemberFilter(projectId),
          expand: "user,added_by",
          sort: "role,-created",
        });

      return records;
    },
    enabled: (options?.enabled ?? true) && !!projectId,
  });
}

export function useProjectMember(
  memberId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: queryKeys.projectMembers.detail(memberId),
    queryFn: async (): Promise<ProjectMemberWithUser> => {
      const record = await pb
        .collection("project_members")
        .getOne<ProjectMemberWithUser>(memberId, {
          expand: "user,added_by",
        });
      return record;
    },
    enabled: (options?.enabled ?? true) && !!memberId,
  });
}

export function useIsProjectMember(projectId: string): {
  isMember: boolean;
  isLoading: boolean;
} {
  const { data: members, isLoading } = useProjectMembers(projectId);
  const currentUser = pb.authStore.model;

  if (!currentUser) return { isMember: false, isLoading: false };

  const isMember = members?.some((m) => m.user === currentUser.id) ?? false;
  return { isMember, isLoading };
}

export function useMyProjectRole(projectId: string): {
  role: ProjectRole | null;
  isLoading: boolean;
} {
  const { data: members, isLoading } = useProjectMembers(projectId);
  const currentUser = pb.authStore.model;

  if (!currentUser) return { role: null, isLoading: false };

  const myMember = members?.find((m) => m.user === currentUser.id);
  return { role: myMember?.role ?? null, isLoading };
}

export function useAddProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, userId, role }: AddProjectMemberInput) => {
      // Check if already a member
      try {
        await pb
          .collection("project_members")
          .getFirstListItem(`project = "${projectId}" && user = "${userId}"`);
        throw new Error("User is already a member of this project");
      } catch (err) {
        const errorMessage = (err as Error).message ?? "";
        if (errorMessage.includes("already a member")) {
          throw err;
        }
      }

      // Create membership
      const membership = await pb.collection("project_members").create({
        project: projectId,
        user: userId,
        role: role,
        added_at: new Date().toISOString(),
      });

      return membership;
    },
    onSuccess: (_, variables) => {
      toast.success("Member added to project");
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectMembers.list(variables.projectId),
      });
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

export function useUpdateProjectMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, role }: UpdateProjectMemberRoleInput) => {
      const member = await pb.collection("project_members").getOne(memberId);

      const updated = await pb
        .collection("project_members")
        .update(memberId, { role });

      // Invalidate both old and new project member lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectMembers.list(member.project),
      });

      return updated;
    },
    onSuccess: () => {
      toast.success("Member role updated");
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      const member = await pb.collection("project_members").getOne(memberId);

      await pb.collection("project_members").delete(memberId);

      return member.project;
    },
    onSuccess: (projectId) => {
      toast.success("Member removed from project");
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectMembers.list(projectId),
      });
    },
    onError: (error) => {
      handlePocketBaseError(error);
    },
  });
}

export function useProjectMemberCount(projectId: string) {
  const { data: members } = useProjectMembers(projectId);
  return members?.length ?? 0;
}

export function useProjectMembersByRole(projectId: string, role: ProjectRole) {
  const { data: members } = useProjectMembers(projectId);
  return members?.filter((m) => m.role === role) ?? [];
}

export function useProjectOwners(projectId: string) {
  return useProjectMembersByRole(projectId, "owner");
}

export function useProjectAdmins(projectId: string) {
  return useProjectMembersByRole(projectId, "admin");
}
