import { useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/convex";
import { useAuthStore } from "@/store/app-context-store";

export function AuthStateSync() {
  const { data: session, isPending: isAuthLoading } = authClient.useSession();
  const isAuthenticated = Boolean(session?.user);
  const { setUser, setAuthLoading, setOrganizations, setOrganizationsLoading } =
    useAuthStore(
      useShallow((state) => ({
        setUser: state.setUser,
        setAuthLoading: state.setAuthLoading,
        setOrganizations: state.setOrganizations,
        setOrganizationsLoading: state.setOrganizationsLoading,
      })),
    );

  // Fetch user data if authenticated
  const userData = useQuery(api.users.getMe, isAuthenticated ? {} : "skip");
  const ensureProfile = useMutation(api.users.ensureProfile);

  // Fetch organizations if authenticated
  const userOrgs = useQuery(
    api.organizations.listMine,
    isAuthenticated ? {} : "skip",
  );

  // Sync auth loading state
  useEffect(() => {
    // We are loading if auth session is loading, or if we are authenticated but data hasn't loaded yet
    const isDataLoading =
      isAuthenticated && (userData === undefined || userOrgs === undefined);
    setAuthLoading(isAuthLoading || isDataLoading);
  }, [isAuthLoading, isAuthenticated, userData, userOrgs, setAuthLoading]);

  useEffect(() => {
    if (!isAuthenticated) {
      setOrganizationsLoading(false);
      return;
    }
    setOrganizationsLoading(userOrgs === undefined);
  }, [isAuthenticated, userOrgs, setOrganizationsLoading]);

  // Sync user data
  useEffect(() => {
    if (!isAuthenticated) {
      setUser(null);
      return;
    }

    if (userData) {
      setUser(userData);
    }
  }, [isAuthenticated, userData, setUser]);

  // Ensure we have a user profile created
  useEffect(() => {
    if (!isAuthenticated) return;
    if (userData === undefined) return;
    // If no user data exists in our DB, create it
    if (!userData) void ensureProfile({});
  }, [ensureProfile, isAuthenticated, userData]);

  // Sync organizations
  useEffect(() => {
    if (userOrgs) {
      const mappedOrgs = userOrgs.map((org) => ({
        organization: org,
        role: org.membership.role,
        joinedAt: org.membership.joinedAt || Date.now(),
        onboardingCompleted: org.membership.onboardingCompleted,
      }));

      setOrganizations(mappedOrgs);
    } else if (!isAuthenticated) {
      setOrganizations([]);
    }
  }, [userOrgs, isAuthenticated, setOrganizations]);

  return null;
}
