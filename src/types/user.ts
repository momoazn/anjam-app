import type { Doc } from "../../convex/_generated/dataModel";

// =============================================================================
// User Types (Convex-compatible)
// =============================================================================

// Extends the Convex Doc type with compatibility fields for UI
export type UserWithCompatibility = Doc<"users"> & {
  // Compatibility fields for PB UI
  id: string;
  first_name: string | undefined;
  last_name: string | undefined;
  // Role field (for org membership display)
  role?: "owner" | "member";
  // Legacy PB fields (optional, for compatibility)
  active?: boolean;
  blocked?: boolean;
  email?: string;
  created?: string;
  avatar?: string;
};

// Role types - in Convex v1, roles are "owner" | "member"
// Note: "admin" is no longer a role, only "owner" and "member"
export type OrgRole = "owner" | "member";

// For backward compatibility with UI that expects PB-style roles
export type UserRole = "admin" | "member" | "superuser";

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

// =============================================================================
// Organization Types (Convex-compatible)
// =============================================================================

// Extends the Convex Doc type with compatibility fields
export type OrgWithCompatibility = Doc<"organizations"> & {
  // Compatibility fields for PB UI
  id: string;
};

// =============================================================================
// Login Log Types (Convex-compatible)
// =============================================================================

export type LoginLog = {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason: string;
  createdAt: number;
};

// Legacy PB-style login log (for compatibility)
export type LegacyLoginLog = {
  id: string;
  user: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason: string;
  created: string;
};
