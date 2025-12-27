"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconCheck, IconChevronDown, IconPlus } from "@tabler/icons-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useSidebar } from "@/components/ui/sidebar";
import {
  useAuthStore,
  useCurrentOrganization,
  useCurrentOrgRole,
  useUserOrganizations,
} from "@/store/auth-store";
import { pb } from "@/lib/pocketbase";
import { cn } from "@/lib/utils";
import { organization } from "@/constants";
import type { OrganizationsResponse } from "@/lib/pocketbase-types";

// =============================================================================
// Types
// =============================================================================

interface OrgSwitcherProps {
  collapsed?: boolean;
}

type OrgRole = "owner" | "admin" | "member";

// =============================================================================
// Helper Functions
// =============================================================================

function getOrgInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getRoleBadgeVariant(
  role: OrgRole,
): "default" | "secondary" | "outline" {
  switch (role) {
    case "owner":
      return "default";
    case "admin":
      return "secondary";
    default:
      return "outline";
  }
}

function getOrgLogoUrl(org: OrganizationsResponse): string | null {
  if (!org.logo) return null;
  return pb.files.getURL(org, org.logo, { thumb: "100x100" });
}

// =============================================================================
// Component
// =============================================================================

export function OrgSwitcher({ collapsed }: OrgSwitcherProps) {
  const navigate = useNavigate();
  const { state: sidebarState } = useSidebar();
  const isCollapsed = collapsed ?? sidebarState === "collapsed";

  // Auth store
  const currentOrg = useCurrentOrganization();
  const currentOrgRole = useCurrentOrgRole();
  const userOrganizations = useUserOrganizations();
  const switchOrganization = useAuthStore((s) => s.switchOrganization);
  const isLoadingOrgs = useAuthStore((s) => s.isLoadingOrgs);

  const [isOpen, setIsOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleOrgSelect = async (orgId: string) => {
    await switchOrganization(orgId);
    setIsOpen(false);
    // Optionally navigate to dashboard after switch
    navigate("/dashboard");
  };

  const handleCreateOrg = () => {
    setIsOpen(false);
    navigate("/organizations/new");
  };

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------

  if (isLoadingOrgs) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Skeleton className="h-8 w-8 rounded-md" />
        {!isCollapsed && <Skeleton className="h-4 w-24" />}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // No Organizations State
  // ---------------------------------------------------------------------------

  if (!currentOrg || userOrganizations.length === 0) {
    return (
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start gap-2 border-dashed",
          isCollapsed && "justify-center px-1.5",
        )}
        onClick={handleCreateOrg}
      >
        <IconPlus className="h-3.5 w-3.5" />
        {!isCollapsed && <span>{organization.create.button}</span>}
      </Button>
    );
  }

  // ---------------------------------------------------------------------------
  // Single Organization (No Dropdown)
  // ---------------------------------------------------------------------------

  if (userOrganizations.length === 1) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-2 py-1.5",
          isCollapsed && "justify-center px-1.5",
        )}
      >
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarImage src={getOrgLogoUrl(currentOrg) ?? undefined} />
          <AvatarFallback className="bg-primary/10 rounded-lg text-[10px] font-semibold">
            {getOrgInitials(currentOrg.name)}
          </AvatarFallback>
        </Avatar>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{currentOrg.name}</span>
            <Badge
              variant={getRoleBadgeVariant(currentOrgRole ?? "member")}
              className="mt-0.5 w-fit px-1 py-0 text-[8px]"
            >
              {currentOrgRole}
            </Badge>
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Multiple Organizations (Dropdown)
  // ---------------------------------------------------------------------------

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "h-auto w-full justify-start gap-2 px-2 py-1.5",
            isCollapsed && "justify-center px-1.5",
          )}
        >
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage src={getOrgLogoUrl(currentOrg) ?? undefined} />
            <AvatarFallback className="bg-primary/10 rounded-lg text-[10px] font-semibold">
              {getOrgInitials(currentOrg.name)}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-semibold">{currentOrg.name}</span>
                <Badge
                  variant={getRoleBadgeVariant(currentOrgRole ?? "member")}
                  className="mt-0.5 px-1 py-0 text-[8px]"
                >
                  {currentOrgRole}
                </Badge>
              </div>
              <IconChevronDown className="ml-auto h-3.5 w-3.5 opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="border-border w-64 rounded-xl border shadow-lg"
        align="start"
        sideOffset={8}
      >
        <DropdownMenuLabel className="text-muted-foreground/60 text-[10px] font-semibold tracking-tight">
          {organization.select.dropdownLabel}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {userOrganizations.map(({ organization, role }) => {
          const isSelected = organization.id === currentOrg.id;
          return (
            <DropdownMenuItem
              key={organization.id}
              onClick={() => handleOrgSelect(organization.id)}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg p-2",
                isSelected && "bg-muted",
              )}
            >
              <Avatar className="h-7 w-7 rounded-lg">
                <AvatarImage src={getOrgLogoUrl(organization) ?? undefined} />
                <AvatarFallback className="bg-primary/10 rounded-lg text-[9px] font-semibold">
                  {getOrgInitials(organization.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col">
                <span className="text-sm font-semibold">
                  {organization.name}
                </span>
                <Badge
                  variant={getRoleBadgeVariant(role)}
                  className="mt-0.5 w-fit px-1 py-0 text-[8px]"
                >
                  {role}
                </Badge>
              </div>
              {isSelected && <IconCheck className="text-primary h-3.5 w-3.5" />}
            </DropdownMenuItem>
          );
        })}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleCreateOrg}
          className="flex cursor-pointer items-center gap-2 rounded-lg p-2"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-dashed">
            <IconPlus className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-medium">
            {organization.create.button}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
