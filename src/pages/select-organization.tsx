import { useNavigate } from "react-router-dom";
import { IconPlus } from "@tabler/icons-react";

import { organization } from "@/constants";
import {
  useUserOrganizations,
  useCurrentOrganization,
  useAuthStore,
} from "@/store/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { pb } from "@/lib/pocketbase";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getOrgInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

import type { OrganizationsResponse } from "@/lib/pocketbase-types";

function getOrgLogoUrl(org: OrganizationsResponse | null): string | undefined {
  if (!org?.logo) return undefined;
  const url = pb.files.getURL(org, org.logo, { thumb: "100x100" });
  return url ?? undefined;
}

function getRoleBadgeVariant(
  role: string,
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

export function SelectOrganizationPage() {
  const navigate = useNavigate();
  const userOrganizations = useUserOrganizations();
  const currentOrg = useCurrentOrganization();

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold tracking-tight">
          {organization.select.title}
        </h1>
        <p className="text-muted-foreground">
          {organization.select.description}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Create New Organization Card */}
        <button
          onClick={() => navigate("/organizations/new")}
          className="group border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/5 relative flex flex-col items-center justify-center gap-4 rounded-[var(--ds-radius-card)] border border-dashed p-8 transition-all"
        >
          <div className="border-muted-foreground/25 group-hover:border-primary/50 flex h-16 w-16 items-center justify-center rounded-full border border-dashed transition-colors">
            <IconPlus className="text-muted-foreground group-hover:text-primary h-8 w-8 transition-colors" />
          </div>
          <div className="text-center">
            <span className="text-lg font-bold">
              {organization.select.createNew}
            </span>
          </div>
        </button>

        {/* Organization Cards */}
        {userOrganizations.map(({ organization: org, role }) => {
          const isSelected = currentOrg?.id === org.id;
          return (
            <button
              key={org.id}
              onClick={() => {
                // Switch to this organization
                useAuthStore.getState().switchOrganization(org.id);
                navigate("/dashboard");
              }}
              className={cn(
                "group relative flex flex-col items-center gap-4 rounded-[var(--ds-radius-card)] border p-[var(--ds-spacing-cardPadding)] text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/5",
              )}
            >
              {isSelected && (
                <div className="absolute -top-3 -right-3">
                  <Badge variant="default" className="rounded-lg text-[10px]">
                    انتخاب شده
                  </Badge>
                </div>
              )}
              <Avatar className="h-20 w-20 rounded-xl">
                <AvatarImage src={getOrgLogoUrl(org)} />
                <AvatarFallback className="rounded-xl text-xl font-bold">
                  {getOrgInitials(org.name)}
                </AvatarFallback>
              </Avatar>
              <div className="w-full text-center">
                <h3 className="truncate text-lg font-bold">{org.name}</h3>
                <Badge
                  variant={getRoleBadgeVariant(role)}
                  className="mx-auto mt-2 block w-fit rounded-lg"
                >
                  {role}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
