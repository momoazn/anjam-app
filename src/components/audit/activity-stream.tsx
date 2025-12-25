import { formatDistanceToNow } from "date-fns-jalali";
import {
  IconCircleCheck,
  IconCircle,
  IconCirclePlus,
  IconTrash,
  IconChevronDown,
  IconChevronUp,
  IconClock,
  IconHistory,
  IconActivity,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auditLogs } from "@/constants";
import { useResourceAuditLogs } from "@/hooks/audit-logs";
import type { AuditLogsResponse, UsersResponse } from "@/lib/pocketbase-types";
import type { FieldDiff } from "@/lib/audit-log-service";
import { formatUserName } from "@/lib/utils";
import { UserAvatar } from "@/components/user-avatar";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { cn } from "@/lib/utils";
import { pb } from "@/lib/pocketbase";
import { queryKeys } from "@/hooks/query-keys";

type AuditLog = AuditLogsResponse<
  Record<string, FieldDiff> | null,
  { actor?: UsersResponse }
>;

type ActivityStreamProps = {
  resource: string;
  resourceId: string;
  className?: string;
};

function getActionIcon(action: string) {
  switch (action) {
    case "create":
      return <IconCirclePlus className="h-4 w-4 text-emerald-500" />;
    case "update":
      return <IconCircleCheck className="text-primary h-4 w-4" />;
    case "delete":
      return <IconTrash className="h-4 w-4 text-rose-500" />;
    default:
      return <IconCircle className="text-muted-foreground/40 h-4 w-4" />;
  }
}

function formatActionMessage(log: AuditLog, actorName: string): string {
  const resourceName =
    log.resource === "tasks"
      ? auditLogs.resources.task
      : log.resource === "projects"
        ? auditLogs.resources.project
        : log.resource;

  switch (log.action) {
    case "create":
      return auditLogs.activityStream.created
        .replace("{actor}", actorName)
        .replace("{resource}", resourceName);
    case "delete":
      return auditLogs.activityStream.deleted
        .replace("{actor}", actorName)
        .replace("{resource}", resourceName);
    case "update": {
      const changes =
        typeof log.changes === "string"
          ? (JSON.parse(log.changes) as Record<string, FieldDiff>)
          : (log.changes as Record<string, FieldDiff> | null);

      if (changes && Object.keys(changes).length > 0) {
        const firstChange = Object.entries(changes)[0];
        const [field, diff] = firstChange;
        const oldVal =
          diff.old !== null && diff.old !== undefined
            ? String(diff.old)
            : auditLogs.empty.empty;
        const newVal =
          diff.new !== null && diff.new !== undefined
            ? String(diff.new)
            : auditLogs.empty.empty;

        return auditLogs.activityStream.updated
          .replace("{actor}", actorName)
          .replace("{field}", field)
          .replace("{old}", oldVal)
          .replace("{new}", newVal);
      }
      return auditLogs.activityStream.changed
        .replace("{actor}", actorName)
        .replace("{resource}", resourceName);
    }
    default:
      return auditLogs.activityStream.defaultMessage
        .replace("{actor}", actorName)
        .replace("{action}", log.action);
  }
}

function AuditLogItem({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);

  const actor = log.expand?.actor;
  const actorName = actor
    ? formatUserName(actor.first_name, actor.last_name, actor.username)
    : log.actor_type === "system"
      ? auditLogs.actorTypes.system
      : auditLogs.actorTypes.unknown;

  const changes =
    typeof log.changes === "string"
      ? (JSON.parse(log.changes) as Record<string, FieldDiff> | null)
      : (log.changes as Record<string, FieldDiff> | null);

  const hasChanges = changes && Object.keys(changes).length > 0;
  const relativeTime = log.created
    ? formatDistanceToNow(new Date(log.created), { addSuffix: true })
    : "";

  return (
    <div className="group bg-card hover:bg-muted/30 border-border/10 relative flex flex-col overflow-hidden border-b text-right transition-all">
      <div className="flex items-start gap-4 p-4">
        <div className="mt-1">{getActionIcon(log.action)}</div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-right text-sm leading-relaxed font-bold opacity-90">
                {formatActionMessage(log, actorName)}
              </p>
              <div className="mt-2 flex items-center justify-end gap-3 opacity-40">
                <span className="text-[10px] font-black tracking-tight uppercase">
                  {relativeTime ? digitsEnToFa(relativeTime) : ""}
                </span>
                <IconClock className="size-2.5" />
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <UserAvatar
                user={actor}
                className="border-border/20 size-8 rounded-none border shadow-sm"
              />
              <Badge
                variant="outline"
                className="border-primary/20 bg-primary/5 text-primary rounded-none text-[8px] font-black tracking-tight uppercase"
              >
                {auditLogs.actions[
                  log.action as keyof typeof auditLogs.actions
                ] || log.action}
              </Badge>
            </div>
          </div>

          {hasChanges && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="text-muted-foreground/60 hover:bg-muted/50 h-7 gap-2 rounded-none text-[9px] font-black tracking-tight uppercase"
              >
                {expanded ? (
                  <>
                    Hide Details <IconChevronUp className="size-3" />
                  </>
                ) : (
                  <>
                    View Details <IconChevronDown className="size-3" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {expanded && hasChanges && (
        <div className="bg-muted/10 border-border/10 animate-in fade-in slide-in-from-top-2 space-y-4 border-t p-6 text-right font-mono text-[10px]">
          {Object.entries(changes!).map(([field, diff]) => (
            <div
              key={field}
              className="border-border/5 grid grid-cols-12 gap-4 border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="border-border/10 col-span-3 flex flex-col items-end border-s">
                <span className="mb-1 text-[8px] font-black tracking-tight uppercase opacity-40">
                  Field
                </span>
                <span className="text-primary/80 font-black uppercase">
                  {field}
                </span>
              </div>
              <div className="border-border/10 col-span-4 flex flex-col items-end border-s pe-4">
                <span className="mb-1 text-[8px] font-black tracking-tight uppercase opacity-40">
                  Original
                </span>
                <span className="w-full truncate opacity-60">
                  {String(diff.old || "EMPTY")}
                </span>
              </div>
              <div className="col-span-5 flex flex-col items-end pe-4">
                <span className="mb-1 text-[8px] font-black tracking-tight uppercase opacity-40">
                  Updated
                </span>
                <span className="text-foreground w-full truncate font-black">
                  {String(diff.new || "EMPTY")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-primary absolute end-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
    </div>
  );
}

export function ActivityStream({
  resource,
  resourceId,
  className,
}: ActivityStreamProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!resourceId) return;

    const filter = `resource = "${resource}" && resource_id = "${resourceId}"`;
    const subscribePromise = pb.collection("audit_logs").subscribe(
      "*",
      () => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.auditLogs.resource(resource, resourceId),
        });
      },
      { filter },
    );

    return () => {
      subscribePromise
        .then((unsubscribeFn) => unsubscribeFn())
        .catch(() => {
          // Ignore cleanup errors
        });
    };
  }, [queryClient, resource, resourceId]);

  const { data, isLoading, error } = useResourceAuditLogs(
    resource,
    resourceId,
    {
      perPage: 100,
    },
  );

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-muted/10 border-border/10 h-24 w-full animate-pulse border"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "py-12 text-center text-xs font-black text-rose-500 uppercase",
          className,
        )}
      >
        <IconActivity className="mx-auto mb-4 size-8 opacity-20" />
        {auditLogs.errors.loadHistoryFailed}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div
        className={cn(
          "text-muted-foreground/40 py-12 text-center text-xs font-black uppercase opacity-30 grayscale",
          className,
        )}
      >
        <IconHistory className="mx-auto mb-4 size-8" />
        {auditLogs.activityStream.empty}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-border/40 bg-muted/5 overflow-hidden border",
        className,
      )}
    >
      <div className="bg-muted/20 border-border/40 flex items-center justify-between border-b px-4 py-2">
        <span className="text-muted-foreground/40 text-[8px] font-black tracking-tight uppercase">
          Activity Log
        </span>
        <span className="text-[9px] font-black tabular-nums">
          {digitsEnToFa(data.items.length)} EVENTS
        </span>
      </div>
      <div className="divide-border/5 divide-y">
        {data.items.map((log) => (
          <AuditLogItem key={log.id} log={log} />
        ))}
      </div>
    </div>
  );
}
