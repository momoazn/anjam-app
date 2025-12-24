import {
  IconPencil,
  IconTrash,
  IconBuildingCommunity,
  IconUsers,
  IconTarget,
  IconPower,
  IconHash,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { groups } from "@/constants";
import { GroupsResponse, UsersResponse } from "@/lib/pocketbase-types";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { cn } from "@/lib/utils";

interface GroupListCardProps {
  group: GroupsResponse<{ manager: UsersResponse }>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  stats?: { users: number; projects: number; tasks: number };
}

export function GroupListCard({
  group,
  onEdit,
  onDelete,
  onToggleActive,
  stats,
}: GroupListCardProps) {
  const isActive = group.active;

  return (
    <div className="group border-border/40 bg-card hover:shadow-primary/5 relative flex flex-col overflow-hidden rounded-none border transition-all duration-300 hover:shadow-2xl">
      {/* Module Header */}
      <div className="bg-muted/20 relative border-b p-6 text-right">
        <div className="flex items-start justify-between">
          <div className="flex min-w-0 flex-1 flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground shadow-primary/20 flex size-12 items-center justify-center rounded-none shadow-lg transition-transform group-hover:rotate-12">
                <IconBuildingCommunity className="size-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-xl font-black tracking-tight">
                  {group.name}
                </h3>
                <div className="mt-1 flex items-center justify-end gap-2">
                  <span className="text-muted-foreground/60 text-[10px] font-black tracking-widest uppercase">
                    {group.id.slice(0, 8)}
                  </span>
                  <IconHash className="text-muted-foreground/40 size-3" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <span className="text-muted-foreground/40 text-[9px] font-black tracking-[0.2em] uppercase">
                Status_Flag
              </span>
              <Badge
                variant={isActive ? "outline" : "secondary"}
                className={cn(
                  "rounded-none px-2 py-0 text-[8px] font-black tracking-widest uppercase",
                  isActive
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {isActive ? groups.status.active : groups.status.inactive}
              </Badge>
            </div>
          </div>

          <div className="flex translate-x-2 flex-col items-center gap-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 hover:text-primary h-8 w-8 rounded-none"
              onClick={() => onEdit(group.id)}
            >
              <IconPencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-none ${isActive ? "text-amber-500 hover:bg-amber-500/10" : "text-emerald-500 hover:bg-emerald-500/10"}`}
              onClick={() => onToggleActive(group.id)}
            >
              <IconPower className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none text-rose-500 hover:bg-rose-500/10"
              onClick={() => onDelete(group.id)}
            >
              <IconTrash className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Module Content */}
      <div className="flex-1 space-y-6 p-6 text-right">
        {group.description && (
          <p className="text-muted-foreground/80 line-clamp-2 text-xs leading-relaxed font-medium">
            {group.description}
          </p>
        )}

        {group.expand?.manager && (
          <div className="bg-muted/10 border-border/20 space-y-1 border p-3">
            <span className="text-muted-foreground/40 block text-[8px] font-black tracking-[0.3em] uppercase">
              Designated_Manager
            </span>
            <div className="flex items-center justify-end gap-2">
              <span className="text-[11px] font-black tracking-tight uppercase">
                {group.expand.manager.first_name &&
                group.expand.manager.last_name
                  ? `${group.expand.manager.first_name} ${group.expand.manager.last_name}`
                  : group.expand.manager.username}
              </span>
              <IconShieldCheck className="text-primary/60 size-3" />
            </div>
          </div>
        )}

        {stats && (
          <div className="bg-border/20 border-border/20 grid grid-cols-3 gap-px overflow-hidden border">
            <div className="bg-muted/5 flex flex-col items-center gap-1 p-3">
              <IconUsers className="text-primary/40 size-3" />
              <span className="text-sm font-black tabular-nums">
                {digitsEnToFa(stats.users)}
              </span>
              <span className="text-[7px] font-black tracking-widest uppercase opacity-40">
                {groups.stats.users}
              </span>
            </div>
            <div className="bg-muted/5 flex flex-col items-center gap-1 p-3">
              <IconTarget className="text-primary/40 size-3" />
              <span className="text-sm font-black tabular-nums">
                {digitsEnToFa(stats.projects)}
              </span>
              <span className="text-[7px] font-black tracking-widest uppercase opacity-40">
                {groups.stats.projects}
              </span>
            </div>
            <div className="bg-muted/5 flex flex-col items-center gap-1 p-3">
              <IconTarget className="text-primary/40 size-3" />
              <span className="text-sm font-black tabular-nums">
                {digitsEnToFa(stats.tasks)}
              </span>
              <span className="text-[7px] font-black tracking-widest uppercase opacity-40">
                {groups.stats.tasks}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Signal Bar */}
      <div
        className={cn(
          "h-1 w-full transition-all duration-500",
          isActive ? "bg-primary/20 group-hover:bg-primary" : "bg-muted",
        )}
      />
    </div>
  );
}
