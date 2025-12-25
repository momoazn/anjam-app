import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconHistory,
  IconTerminal,
  IconX,
  IconActivity,
  IconFilter,
  IconServer,
  IconHash,
} from "@tabler/icons-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageTransition } from "@/components/page-transition";
import { PageHeader } from "@/components/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { auditLogs } from "@/constants";
import { useAuditLogs } from "@/hooks/audit-logs";
import type {
  AuditLogsActionOptions,
  AuditLogsClientOptions,
} from "@/lib/pocketbase-types";
import { UsersRoleOptions } from "@/lib/pocketbase-types";
import type { FieldDiff } from "@/lib/audit-log-service";
import { formatDateTime } from "@/lib/date-utils";
import { formatUserName } from "@/lib/utils";
import { useAuthUser } from "@/store/auth-store";

function parseChanges(
  changes: string | Record<string, FieldDiff> | null | undefined,
): Record<string, FieldDiff> | null {
  if (!changes) return null;
  if (typeof changes === "string") {
    try {
      return JSON.parse(changes) as Record<string, FieldDiff>;
    } catch {
      return null;
    }
  }
  return changes as Record<string, FieldDiff>;
}

export default function AuditLogs() {
  const authUser = useAuthUser();
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);
  const [resource, setResource] = useState<string>("");
  const [action, setAction] = useState<AuditLogsActionOptions | "">("");
  const [client, setClient] = useState<AuditLogsClientOptions | "">("");
  const [search, setSearch] = useState("");

  const isAdmin = authUser?.role === UsersRoleOptions.admin;

  const { data, isLoading, error } = useAuditLogs({
    page,
    perPage,
    resource: resource || undefined,
    action: action || undefined,
    client: client || undefined,
    search: search || undefined,
  });

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const hasFilters = !!resource || !!action || !!client || !!search;

  return (
    <PageTransition className="container mx-auto max-w-[1600px] p-4 md:p-6">
      <PageHeader
        title={auditLogs.title}
        description={
          data
            ? `${digitsEnToFa(data.totalItems)} total entries recorded`
            : "System-wide activity registry"
        }
        icon={IconHistory}
        nodeId="Security_Audit_Kernel"
      />

      <div className="space-y-10">
        {/* Registry Filter Logic */}
        <section className="space-y-4">
          <div className="bg-border/40 border-border/40 flex items-center gap-px overflow-hidden border shadow-sm">
            <div className="bg-muted/20 border-border/20 flex h-10 shrink-0 items-center gap-2 border-s px-3">
              <IconTerminal className="text-primary/60 size-3" />
              <span className="text-muted-foreground/60 text-[9px] font-black tracking-[0.2em] uppercase">
                Search
              </span>
            </div>
            <div className="group relative h-10 flex-1">
              <IconTerminal className="text-muted-foreground/30 absolute end-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Query_String..."
                className="h-full w-full rounded-none border-none bg-transparent pe-11 text-xs font-bold tracking-tight transition-all outline-none focus:ring-0"
              />
            </div>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setResource("");
                  setAction("");
                  setClient("");
                  setSearch("");
                }}
                className="border-border/20 h-10 gap-2 rounded-none border-e px-4 text-[9px] font-black tracking-widest text-rose-500 uppercase transition-all hover:bg-rose-500/10"
              >
                <IconX className="size-3" />
                Reset_Filters
              </Button>
            )}
          </div>

          <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden border shadow-sm sm:grid-cols-3">
            <div className="bg-card border-border/10 flex h-16 flex-col justify-between border-s p-3">
              <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[7px] font-black tracking-[0.3em] uppercase">
                <IconFilter className="size-2" /> {auditLogs.filters.resource}
              </span>
              <Select value={resource} onValueChange={setResource}>
                <SelectTrigger className="bg-muted/10 h-7 w-full rounded-none border-none px-2 text-right text-[11px] font-black tracking-tight uppercase focus:ring-0">
                  <SelectValue placeholder={auditLogs.filters.allPlaceholder} />
                </SelectTrigger>
                <SelectContent className="border-foreground bg-card rounded-none border-2">
                  <SelectItem
                    value="all"
                    className="text-[10px] font-black uppercase"
                  >
                    {auditLogs.filters.all}
                  </SelectItem>
                  <SelectItem
                    value="tasks"
                    className="text-[10px] font-black uppercase"
                  >
                    {auditLogs.resources.tasks}
                  </SelectItem>
                  <SelectItem
                    value="projects"
                    className="text-[10px] font-black uppercase"
                  >
                    {auditLogs.resources.projects}
                  </SelectItem>
                  <SelectItem
                    value="users"
                    className="text-[10px] font-black uppercase"
                  >
                    {auditLogs.resources.users}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-card border-border/10 flex h-16 flex-col justify-between border-s p-3">
              <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[7px] font-black tracking-[0.3em] uppercase">
                <IconActivity className="size-2" /> {auditLogs.filters.action}
              </span>
              <Select
                value={action}
                onValueChange={(v) =>
                  setAction(v as AuditLogsActionOptions | "")
                }
              >
                <SelectTrigger className="bg-muted/10 h-7 w-full rounded-none border-none px-2 text-right text-[11px] font-black tracking-tight uppercase focus:ring-0">
                  <SelectValue placeholder={auditLogs.filters.allPlaceholder} />
                </SelectTrigger>
                <SelectContent className="border-foreground bg-card rounded-none border-2">
                  <SelectItem
                    value="all"
                    className="text-[10px] font-black uppercase"
                  >
                    {auditLogs.filters.all}
                  </SelectItem>
                  <SelectItem
                    value="create"
                    className="text-[10px] font-black uppercase"
                  >
                    {auditLogs.actions.create}
                  </SelectItem>
                  <SelectItem
                    value="update"
                    className="text-[10px] font-black uppercase"
                  >
                    {auditLogs.actions.update}
                  </SelectItem>
                  <SelectItem
                    value="delete"
                    className="text-[10px] font-black uppercase"
                  >
                    {auditLogs.actions.delete}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-card flex h-16 flex-col justify-between p-3">
              <span className="text-muted-foreground/40 flex items-center gap-1.5 text-[7px] font-black tracking-[0.3em] uppercase">
                <IconServer className="size-2" /> {auditLogs.filters.client}
              </span>
              <Select
                value={client}
                onValueChange={(v) =>
                  setClient(v as AuditLogsClientOptions | "")
                }
              >
                <SelectTrigger className="bg-muted/10 h-7 w-full rounded-none border-none px-2 text-right text-[11px] font-black tracking-tight uppercase focus:ring-0">
                  <SelectValue placeholder={auditLogs.filters.allPlaceholder} />
                </SelectTrigger>
                <SelectContent className="border-foreground bg-card rounded-none border-2">
                  <SelectItem
                    value="all"
                    className="text-[10px] font-black uppercase"
                  >
                    {auditLogs.filters.all}
                  </SelectItem>
                  <SelectItem
                    value="web"
                    className="text-[10px] font-black uppercase"
                  >
                    {auditLogs.clients.web}
                  </SelectItem>
                  <SelectItem
                    value="cli"
                    className="text-[10px] font-black uppercase"
                  >
                    {auditLogs.clients.cli}
                  </SelectItem>
                  <SelectItem
                    value="automation"
                    className="text-[10px] font-black uppercase"
                  >
                    {auditLogs.clients.automation}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Registry Console Table */}
        <section className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-primary/60 text-[10px] font-black tracking-[0.3em] uppercase">
              02_Event_Registry
            </span>
            <div className="bg-border/20 h-px flex-1" />
          </div>

          <div className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden border shadow-xl">
            {/* Table Head Protocol */}
            <div className="bg-muted/20 border-border/40 sticky top-0 z-10 grid h-10 grid-cols-12 border-b backdrop-blur-sm">
              <div className="border-border/10 col-span-2 flex items-center justify-end border-s px-4">
                <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
                  {auditLogs.table.timestamp}
                </span>
              </div>
              <div className="border-border/10 col-span-2 flex items-center justify-end border-s px-4">
                <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
                  {auditLogs.table.actor}
                </span>
              </div>
              <div className="border-border/10 col-span-1 flex items-center justify-center border-s">
                <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
                  {auditLogs.table.action}
                </span>
              </div>
              <div className="border-border/10 col-span-2 flex items-center justify-end border-s px-4">
                <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
                  {auditLogs.table.resource}
                </span>
              </div>
              <div className="border-border/10 col-span-1 flex items-center justify-center border-s">
                <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
                  {auditLogs.table.client}
                </span>
              </div>
              <div className="col-span-4 flex items-center justify-end px-4">
                <span className="text-[9px] font-black tracking-widest uppercase opacity-60">
                  {auditLogs.table.message}
                </span>
              </div>
            </div>

            {/* Registry Modules */}
            <ScrollArea className="bg-card h-[70vh]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 opacity-20">
                  <IconHistory className="size-12 animate-spin" />
                </div>
              ) : error ? (
                <div className="p-12 text-center text-xs font-black text-rose-500 uppercase">
                  {auditLogs.errors.loadFailed}
                </div>
              ) : !data || data.items.length === 0 ? (
                <div className="text-muted-foreground/40 p-12 text-center text-xs font-black uppercase">
                  {auditLogs.empty.noResults}
                </div>
              ) : (
                <div className="divide-border/10 divide-y">
                  {data.items.map((log) => {
                    const actor = log.expand?.actor;
                    const actorName = actor
                      ? formatUserName(
                          actor.first_name,
                          actor.last_name,
                          actor.username,
                        )
                      : log.actor_type === "system"
                        ? auditLogs.actorTypes.system
                        : auditLogs.actorTypes.unknown;
                    const changes = parseChanges(log.changes);
                    const hasChanges =
                      changes && Object.keys(changes).length > 0;

                    return (
                      <div
                        key={log.id}
                        className="group bg-card hover:bg-muted/20 flex flex-col text-right transition-all"
                      >
                        <div className="relative grid grid-cols-12 overflow-hidden">
                          <div className="border-border/10 col-span-2 flex items-center justify-end border-s p-4 font-mono text-[10px] font-black tracking-widest uppercase opacity-60">
                            {log.created
                              ? `${formatDateTime(log.created).date} ${formatDateTime(log.created).time}`
                              : "—"}
                          </div>
                          <div className="border-border/10 col-span-2 flex flex-col items-end justify-center border-s p-4">
                            <span className="text-[11px] font-black tracking-tight uppercase">
                              {actorName}
                            </span>
                            <span className="text-[8px] font-bold uppercase opacity-40">
                              {log.actor_role || "External"}
                            </span>
                          </div>
                          <div className="border-border/10 col-span-1 flex items-center justify-center border-s p-4">
                            <Badge
                              variant="outline"
                              className="border-primary/20 bg-primary/5 text-primary rounded-none text-[8px] font-black tracking-widest uppercase"
                            >
                              {auditLogs.actions[
                                log.action as keyof typeof auditLogs.actions
                              ] || log.action}
                            </Badge>
                          </div>
                          <div className="border-border/10 col-span-2 flex flex-col items-end justify-center border-s p-4">
                            <span className="text-[11px] font-black tracking-tight uppercase">
                              {log.resource}
                            </span>
                            <div className="flex items-center gap-1.5 opacity-40">
                              <IconHash className="size-2.5" />
                              <span className="font-mono text-[8px] font-black tracking-widest uppercase">
                                {log.resource_id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                          <div className="border-border/10 col-span-1 flex items-center justify-center border-s p-4 font-mono text-[10px] font-black uppercase opacity-40">
                            {log.client || "—"}
                          </div>
                          <div className="col-span-4 flex items-center justify-end p-4 text-xs leading-relaxed font-medium opacity-80">
                            {log.message || "—"}
                          </div>

                          <div className="bg-primary absolute end-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
                        </div>

                        {/* Expandable Changes Area */}
                        {hasChanges && (
                          <Accordion
                            type="single"
                            collapsible
                            className="w-full"
                          >
                            <AccordionItem
                              value={log.id}
                              className="border-none"
                            >
                              <AccordionTrigger className="bg-muted/5 border-border/10 h-8 flex-row-reverse gap-3 border-y px-4 hover:no-underline">
                                <div className="flex items-center gap-2">
                                  <IconTerminal className="text-primary/40 size-3" />
                                  <span className="text-[9px] font-black tracking-[0.3em] uppercase opacity-40">
                                    {auditLogs.table.viewChanges}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="p-0">
                                <div className="bg-muted/10 space-y-4 p-6 text-right font-mono text-[10px]">
                                  {changes &&
                                    Object.entries(changes).map(
                                      ([field, diff]) => (
                                        <div
                                          key={field}
                                          className="group/field border-border/10 grid grid-cols-12 gap-4 border-b pb-4 last:border-0 last:pb-0"
                                        >
                                          <div className="border-border/10 col-span-2 flex flex-col items-end border-s">
                                            <span className="mb-1 text-[8px] font-black tracking-widest uppercase opacity-40">
                                              Field
                                            </span>
                                            <span className="text-primary/80 font-black uppercase">
                                              {field}
                                            </span>
                                          </div>
                                          <div className="border-border/10 col-span-5 flex flex-col items-end border-s pe-4">
                                            <span className="mb-1 text-[8px] font-black tracking-widest uppercase opacity-40">
                                              Before
                                            </span>
                                            <span className="w-full truncate opacity-60">
                                              {String(diff.old || "EMPTY")}
                                            </span>
                                          </div>
                                          <div className="col-span-5 flex flex-col items-end pe-4">
                                            <span className="mb-1 text-[8px] font-black tracking-widest uppercase opacity-40">
                                              After
                                            </span>
                                            <span className="text-foreground w-full truncate font-black">
                                              {String(diff.new || "EMPTY")}
                                            </span>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>

            {/* Pagination Protocol */}
            {data && data.totalPages > 1 && (
              <div className="bg-muted/20 border-border/40 flex items-center justify-between border-t px-6 py-3">
                <div className="text-muted-foreground/60 text-[10px] font-black tracking-widest uppercase">
                  Registry_Page_Index :: {digitsEnToFa(page)} /{" "}
                  {digitsEnToFa(data.totalPages)}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/40 h-8 rounded-none text-[9px] font-black tracking-widest uppercase transition-all active:scale-95 disabled:opacity-20"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous_Block
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/40 h-8 rounded-none text-[9px] font-black tracking-widest uppercase transition-all active:scale-95 disabled:opacity-20"
                    onClick={() =>
                      setPage((p) => Math.min(data.totalPages, p + 1))
                    }
                    disabled={page === data.totalPages}
                  >
                    Next_Block
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
