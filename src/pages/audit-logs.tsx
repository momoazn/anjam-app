import { digitsEnToFa } from "@persian-tools/persian-tools";
import { FileText, History, Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { Navigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageTransition } from "@/components/page-transition";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fa } from "@/constants/text";
import { useAuditLogs } from "@/hooks/audit-logs";
import type { AuditLogsResponse, AuditLogsActionOptions, AuditLogsClientOptions } from "@/lib/pocketbase-types";
import { formatDateTime } from "@/lib/date-utils";
import { formatUserName } from "@/lib/utils";
import { useAuthUser } from "@/store/auth-store";
import { UsersRoleOptions } from "@/lib/pocketbase-types";

type FieldDiff = {
  old: unknown;
  new: unknown;
};

function parseChanges(changes: string | Record<string, FieldDiff> | null | undefined): Record<string, FieldDiff> | null {
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
    <PageTransition className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold md:text-3xl">
            <History className="h-5 w-5 md:h-6 md:w-6" />
            {fa.auditLogs.title}
          </h1>
          {data && (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm">
              {digitsEnToFa(data.totalItems)}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">{fa.auditLogs.filters.clear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">
                {fa.auditLogs.filters.resource}
              </label>
              <Select value={resource} onValueChange={setResource}>
                <SelectTrigger>
                  <SelectValue placeholder="همه" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه</SelectItem>
                  <SelectItem value="tasks">تسک‌ها</SelectItem>
                  <SelectItem value="projects">پروژه‌ها</SelectItem>
                  <SelectItem value="users">کاربران</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                {fa.auditLogs.filters.action}
              </label>
              <Select value={action} onValueChange={(v) => setAction(v as AuditLogsActionOptions | "")}>
                <SelectTrigger>
                  <SelectValue placeholder="همه" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه</SelectItem>
                  <SelectItem value="create">{fa.auditLogs.actions.create}</SelectItem>
                  <SelectItem value="update">{fa.auditLogs.actions.update}</SelectItem>
                  <SelectItem value="delete">{fa.auditLogs.actions.delete}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                {fa.auditLogs.filters.client}
              </label>
              <Select value={client} onValueChange={(v) => setClient(v as AuditLogsClientOptions | "")}>
                <SelectTrigger>
                  <SelectValue placeholder="همه" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">همه</SelectItem>
                  <SelectItem value="web">{fa.auditLogs.clients.web}</SelectItem>
                  <SelectItem value="cli">{fa.auditLogs.clients.cli}</SelectItem>
                  <SelectItem value="automation">{fa.auditLogs.clients.automation}</SelectItem>
                  <SelectItem value="unknown">{fa.auditLogs.clients.unknown}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                {fa.auditLogs.filters.search}
              </label>
              <div className="flex gap-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={fa.auditLogs.filters.search}
                  className="flex-1"
                />
                {hasFilters && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setResource("");
                      setAction("");
                      setClient("");
                      setSearch("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{fa.auditLogs.table.timestamp}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-full items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">خطا در بارگذاری سوابق</p>
            </div>
          ) : !data || data.items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{fa.auditLogs.empty.noResults}</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{fa.auditLogs.table.timestamp}</TableHead>
                    <TableHead>{fa.auditLogs.table.actor}</TableHead>
                    <TableHead>{fa.auditLogs.table.action}</TableHead>
                    <TableHead>{fa.auditLogs.table.resource}</TableHead>
                    <TableHead>{fa.auditLogs.table.client}</TableHead>
                    <TableHead>{fa.auditLogs.table.message}</TableHead>
                    <TableHead>{fa.auditLogs.table.changes}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.map((log) => {
                    const actor = log.expand?.actor;
                    const actorName = actor
                      ? formatUserName(actor.first_name, actor.last_name, actor.username)
                      : log.actor_type === "system"
                      ? "سیستم"
                      : "نامشخص";
                    const changes = parseChanges(log.changes);
                    const hasChanges = changes && Object.keys(changes).length > 0;

                    return (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {log.created ? formatDateTime(log.created) : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{actorName}</span>
                            {log.actor_role && (
                              <span className="text-muted-foreground text-xs">
                                {log.actor_role}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {fa.auditLogs.actions[log.action as keyof typeof fa.auditLogs.actions] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{log.resource}</span>
                            <span className="text-muted-foreground font-mono text-xs">
                              {log.resource_id}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.client ? (
                            <Badge variant="secondary" className="text-xs">
                              {fa.auditLogs.clients[log.client as keyof typeof fa.auditLogs.clients] || log.client}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={log.message || ""}>
                            {log.message || "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {hasChanges ? (
                            <Accordion type="single" collapsible>
                              <AccordionItem value={log.id} className="border-none">
                                <AccordionTrigger className="text-xs py-1">
                                  {fa.auditLogs.table.viewChanges}
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-2 text-xs">
                                    {Object.entries(changes!).map(([field, diff]) => (
                                      <div key={field} className="border-l-2 pl-2">
                                        <div className="font-medium">{field}:</div>
                                        <div className="text-muted-foreground">
                                          <div>
                                            قبل:{" "}
                                            <span className="font-mono">
                                              {diff.old !== null && diff.old !== undefined
                                                ? String(diff.old).substring(0, 50)
                                                : "خالی"}
                                            </span>
                                          </div>
                                          <div>
                                            بعد:{" "}
                                            <span className="font-mono">
                                              {diff.new !== null && diff.new !== undefined
                                                ? String(diff.new).substring(0, 50)
                                                : "خالی"}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              {fa.auditLogs.table.noChanges}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="text-muted-foreground text-sm">
                {fa.common.pagination.page} {digitsEnToFa(page)} {fa.common.pagination.of}{" "}
                {digitsEnToFa(data.totalPages)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  قبلی
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                >
                  بعدی
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </PageTransition>
  );
}

