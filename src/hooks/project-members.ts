import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { handlePocketBaseError } from "@/lib/error-handler";
import { pb } from "@/lib/pocketbase";
import type {
  ProjectMembersResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";

import { queryKeys } from "./query-keys";

// =============================================================================
// Types
// =============================================================================

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

// =============================================================================
// Helper Functions
// =============================================================================

function buildProjectMemberFilter(projectId: string): string {
  return `project = "${projectId}"`;
}

// =============================================================================
// Query Hooks
// =============================================================================

/**
 * Fetch all members of a project
 *
 * @example
 * const { data: members, isLoading } = useProjectMembers("project-id");
 */
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

/**
 * Fetch a single project member by ID
 */
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

/**
 * Check if current user is a member of a project
 * Returns { isMember, isLoading } for proper loading state handling
 */
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

/**
 * Get current user's role in a project
 * Returns { role, isLoading } for proper loading state handling
 */
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

// =============================================================================
// Mutation Hooks
// =============================================================================

/**
 * Add a member to a project
 *
 * @example
 * const { mutate: addMember, isPending } = useAddProjectMember();
 * addMember({ projectId: "abc", userId: "def", role: "member" });
 */
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

/**
 * Update a project member's role
 *
 * @example
 * const { mutate: updateRole } = useUpdateProjectMemberRole();
 * updateRole({ memberId: "abc123", role: "admin" });
 */
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

/**
 * Remove a member from a project
 *
 * @example
 * const { mutate: removeMember } = useRemoveProjectMember();
 * removeMember("member-id-123");
 */
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

// =============================================================================
// Selector Hooks (for specific data needs)
// =============================================================================

/**
 * Get count of members in a project
 */
export function useProjectMemberCount(projectId: string) {
  const { data: members } = useProjectMembers(projectId);
  return members?.length ?? 0;
}

/**
 * Get all members with a specific role
 */
export function useProjectMembersByRole(projectId: string, role: ProjectRole) {
  const { data: members } = useProjectMembers(projectId);
  return members?.filter((m) => m.role === role) ?? [];
}

/**
 * Get project owners
 */
export function useProjectOwners(projectId: string) {
  return useProjectMembersByRole(projectId, "owner");
}

/**
 * Get project admins
 */
export function useProjectAdmins(projectId: string) {
  return useProjectMembersByRole(projectId, "admin");
}
