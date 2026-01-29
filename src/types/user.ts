// Role types - in Convex v1, roles are "owner" | "member"
// Note: "admin" is no longer a role, only "owner" and "member"
export type OrgRole = "owner" | "member";

// Organization membership info
export interface OrganizationMember {
  _id: string;
  _creationTime: number;
  organizationId: string;
  userId: string;
  role: OrgRole;
  status: "invited" | "active" | "suspended";
  invitedByUserId?: string;
  invitedAt?: number;
  joinedAt?: number;
  onboardingCompleted: boolean;
}
