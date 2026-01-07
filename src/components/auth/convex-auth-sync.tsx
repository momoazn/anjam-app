import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { api } from "@/lib/convex";
import { useAuthStore } from "@/store/auth-store";

export function ConvexAuthStateSync() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { setUser, setAuthLoading, setOrganizations } = useAuthStore(
    useShallow((state) => ({
      setUser: state.setUser,
      setAuthLoading: state.setAuthLoading,
      setOrganizations: state.setOrganizations,
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
    // We are loading if Convex Auth is loading, or if we are authenticated but data hasn't loaded yet
    const isDataLoading =
      isAuthenticated && (userData === undefined || userOrgs === undefined);
    setAuthLoading(isAuthLoading || isDataLoading);
  }, [isAuthLoading, isAuthenticated, userData, userOrgs, setAuthLoading]);

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

  // Ensure we have a usable profile (e.g. username for mentions).
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!userData) return;
    if (userData.username) return;
    void ensureProfile({});
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
