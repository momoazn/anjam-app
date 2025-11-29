import {
  Edit,
  Trash2,
  Building2,
  Users,
  Target,
  CheckCircle2,
  XCircle,
  Power,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fa } from "@/constants/text";
import { GroupsResponse, UsersResponse } from "@/lib/pocketbase-types";
import { digitsEnToFa } from "@persian-tools/persian-tools";

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
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Building2 className="text-muted-foreground h-4 w-4 flex-shrink-0" />
              <span className="block truncate">{group.name}</span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {group.code}
              </span>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className="flex items-center gap-1"
              >
                {isActive ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <XCircle className="h-3 w-3" />
                )}
                {isActive ? fa.groups.status.active : fa.groups.status.inactive}
              </Badge>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onEdit(group.id)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive h-6 w-6"
              onClick={() => onDelete(group.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${isActive ? "text-orange-600" : "text-green-600"}`}
              onClick={() => onToggleActive(group.id)}
            >
              <Power className="h-3 w-3" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {group.description && (
          <p className="text-muted-foreground line-clamp-2 text-sm">
            {group.description}
          </p>
        )}

        {stats && (
          <div className="flex items-center justify-around text-center">
            <div className="flex flex-col items-center">
              <Users className="text-muted-foreground mb-1 h-4 w-4" />
              <span className="text-sm font-medium">
                {digitsEnToFa(stats.users)}
              </span>
              <span className="text-muted-foreground text-xs">
                {fa.groups.stats.users}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Target className="text-muted-foreground mb-1 h-4 w-4" />
              <span className="text-sm font-medium">
                {digitsEnToFa(stats.projects)}
              </span>
              <span className="text-muted-foreground text-xs">
                {fa.groups.stats.projects}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Target className="text-muted-foreground mb-1 h-4 w-4" />
              <span className="text-sm font-medium">
                {digitsEnToFa(stats.tasks)}
              </span>
              <span className="text-muted-foreground text-xs">
                {fa.groups.stats.tasks}
              </span>
            </div>
          </div>
        )}

        {group.expand?.manager && (
          <div className="text-muted-foreground text-sm">
            <span className="font-medium">{fa.groups.form.manager}:</span>{" "}
            {group.expand.manager.first_name && group.expand.manager.last_name
              ? `${group.expand.manager.first_name} ${group.expand.manager.last_name}`
              : group.expand.manager.username}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
