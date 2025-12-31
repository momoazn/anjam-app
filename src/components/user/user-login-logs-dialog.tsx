import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { common, settings, users } from "@/constants";
import { formatDateTime } from "@/lib/date-utils";
import { pb } from "@/lib/pocketbase";
import { UsersResponse } from "@/lib/pocketbase-types";
import { digitsEnToFa } from "@persian-tools/persian-tools";

type LoginLog = {
  id: string;
  user: string;
  ip_address: string;
  user_agent: string;
  success: boolean;
  failure_reason: string;
  created: string;
};

type UserLoginLogsDialogProps = {
  user: UsersResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function UserLoginLogsDialog({
  user,
  open,
  onOpenChange,
}: UserLoginLogsDialogProps) {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${pb.baseURL}api/v1/users/${user.id}/login-logs?page=${pageNum}&perPage=20`,
          {
            headers: {
              Authorization: pb.authStore.token
                ? `Bearer ${pb.authStore.token}`
                : "",
            },
          },
        );

        if (!response.ok) {
          throw new Error(users.actions.fetchLogsError);
        }

        const data = await response.json();
        setLogs(data.items || []);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch {
        toast.error(settings.security.toast.fetchLogsError);
      } finally {
        setLoading(false);
      }
    },
    [user.id],
  );

  useEffect(() => {
    if (open && user) {
      fetchLogs(1);
    }
  }, [open, user, fetchLogs]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchLogs(newPage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {users.loginLogs.title.replace(
              "{name}",
              `${user.first_name} ${user.last_name}`,
            )}
          </DialogTitle>
          <DialogDescription>
            {users.loginLogs.columns.ip} {common.connectors.and}{" "}
            {users.loginLogs.columns.status}{" "}
            {common.pagination.loginAttemptsLabel}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pe-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              {users.loginLogs.empty}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">
                    {users.loginLogs.columns.date}
                  </TableHead>
                  <TableHead className="text-right">
                    {users.loginLogs.columns.time}
                  </TableHead>
                  <TableHead className="text-right">
                    {users.loginLogs.columns.ip}
                  </TableHead>
                  <TableHead className="text-center">
                    {users.loginLogs.columns.status}
                  </TableHead>
                  <TableHead className="text-right">
                    {users.loginLogs.columns.reason}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const { date, time } = formatDateTime(log.created);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="text-right">{date}</TableCell>
                      <TableCell className="text-right font-mono">
                        {digitsEnToFa(time)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {log.ip_address ? digitsEnToFa(log.ip_address) : "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={log.success ? "default" : "destructive"}
                          className="gap-1"
                        >
                          {log.success ? (
                            <>
                              <CheckCircle className="size-3" />
                              {users.loginLogs.status.success}
                            </>
                          ) : (
                            <>
                              <XCircle className="size-3" />
                              {users.loginLogs.status.failed}
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {log.failure_reason || "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </ScrollArea>

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t pt-4">
            <div className="text-muted-foreground text-sm">
              {common.pagination.page} {digitsEnToFa(page)}{" "}
              {common.pagination.of} {digitsEnToFa(totalPages)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
              >
                {common.pagination.previous}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
              >
                {common.pagination.next}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
