import { formatDistanceToNow } from "date-fns-jalali";
import { CheckCircle2, MinusCircle, PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { fa } from "@/constants/text";
import { useResourceAuditLogs } from "@/hooks/audit-logs";
import type { AuditLogsResponse } from "@/lib/pocketbase-types";
import { formatDateTime } from "@/lib/date-utils";
import { formatUserName } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { cn } from "@/lib/utils";

type FieldDiff = {
  old: unknown;
  new: unknown;
};

type ActivityStreamProps = {
  resource: string;
  resourceId: string;
  className?: string;
};

function getActionIcon(action: string) {
  switch (action) {
    case "create":
      return <PlusCircle className="h-4 w-4 text-green-500" />;
    case "update":
      return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    case "delete":
      return <Trash2 className="h-4 w-4 text-red-500" />;
    default:
      return <MinusCircle className="h-4 w-4 text-gray-500" />;
  }
}

function formatActionMessage(
  log: AuditLogsResponse,
  actorName: string,
): string {
  const resourceName = log.resource === "tasks" ? "تسک" : log.resource === "projects" ? "پروژه" : log.resource;
  
  switch (log.action) {
    case "create":
      return fa.auditLogs.activityStream.created
        .replace("{actor}", actorName)
        .replace("{resource}", resourceName);
    case "delete":
      return fa.auditLogs.activityStream.deleted
        .replace("{actor}", actorName)
        .replace("{resource}", resourceName);
    case "update":
      const changes = typeof log.changes === "string" 
        ? JSON.parse(log.changes) as Record<string, FieldDiff>
        : (log.changes as Record<string, FieldDiff> | null);
      
      if (changes && Object.keys(changes).length > 0) {
        const firstChange = Object.entries(changes)[0];
        const [field, diff] = firstChange;
        const oldVal = diff.old !== null && diff.old !== undefined ? String(diff.old) : "خالی";
        const newVal = diff.new !== null && diff.new !== undefined ? String(diff.new) : "خالی";
        
        return fa.auditLogs.activityStream.updated
          .replace("{actor}", actorName)
          .replace("{field}", field)
          .replace("{old}", oldVal)
          .replace("{new}", newVal);
      }
      return fa.auditLogs.activityStream.changed
        .replace("{actor}", actorName)
        .replace("{resource}", resourceName);
    default:
      return `${actorName} عملیات ${log.action} را انجام داد`;
  }
}

function AuditLogItem({ log }: { log: AuditLogsResponse<Record<string, FieldDiff>, { actor?: { first_name?: string; last_name?: string; username?: string; avatar?: string; id?: string } }> }) {
  const [expanded, setExpanded] = useState(false);
  
  const actor = log.expand?.actor;
  const actorName = actor
    ? formatUserName(actor.first_name, actor.last_name, actor.username)
    : log.actor_type === "system"
    ? "سیستم"
    : "نامشخص";

  const changes = typeof log.changes === "string"
    ? JSON.parse(log.changes) as Record<string, FieldDiff> | null
    : (log.changes as Record<string, FieldDiff> | null);

  const hasChanges = changes && Object.keys(changes).length > 0;
  const relativeTime = log.created
    ? formatDistanceToNow(new Date(log.created), { addSuffix: true })
    : "";

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 pt-1">
            {getActionIcon(log.action)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-1">
                {actor && (
                  <UserAvatar
                    user={actor}
                    className="h-6 w-6"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{formatActionMessage(log, actorName)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {fa.auditLogs.actions[log.action as keyof typeof fa.auditLogs.actions] || log.action}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {relativeTime ? digitsEnToFa(relativeTime) : ""}
                    </span>
                  </div>
                </div>
              </div>
              {hasChanges && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="text-xs"
                >
                  {expanded
                    ? fa.auditLogs.activityStream.hideDetails
                    : fa.auditLogs.activityStream.showDetails}
                </Button>
              )}
            </div>

            {expanded && hasChanges && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">{fa.auditLogs.table.changes}:</p>
                <div className="space-y-2">
                  {Object.entries(changes).map(([field, diff]) => (
                    <div key={field} className="text-sm">
                      <div className="font-medium mb-1">{field}:</div>
                      <div className="flex gap-4 text-muted-foreground">
                        <div>
                          <span className="text-xs">قبل: </span>
                          <span className="font-mono text-xs">
                            {diff.old !== null && diff.old !== undefined
                              ? String(diff.old).substring(0, 50)
                              : "خالی"}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs">بعد: </span>
                          <span className="font-mono text-xs">
                            {diff.new !== null && diff.new !== undefined
                              ? String(diff.new).substring(0, 50)
                              : "خالی"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ActivityStream({
  resource,
  resourceId,
  className,
}: ActivityStreamProps) {
  const { data, isLoading, error } = useResourceAuditLogs(resource, resourceId, {
    perPage: 100,
  });

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-10", className)}>
        <p className="text-destructive">خطا در بارگذاری تاریخچه</p>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className={cn("text-center py-10", className)}>
        <p className="text-muted-foreground">{fa.auditLogs.activityStream.empty}</p>
      </div>
    );
  }

  return (
    <ScrollArea className={cn("h-[600px]", className)}>
      <div className="space-y-2">
        {data.items.map((log) => (
          <AuditLogItem key={log.id} log={log} />
        ))}
      </div>
    </ScrollArea>
  );
}

