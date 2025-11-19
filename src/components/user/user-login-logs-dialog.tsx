import { digitsEnToFa } from "@persian-tools/persian-tools";
import { format } from "date-fns-jalali";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

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
import { fa } from "@/constants/text";
import { UsersResponse } from "@/lib/pocketbase-types";
import { pb } from "@/lib/pocketbase";

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

  useEffect(() => {
    if (open && user) {
      fetchLogs(1);
    }
  }, [open, user]);

  const fetchLogs = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${pb.baseUrl}api/tm/users/${user.id}/login-logs?page=${pageNum}&perPage=20`,
        {
          headers: {
            Authorization: pb.authStore.token,
          },
        },
      );

      if (!response.ok) {
        throw new Error(fa.users.actions.fetchLogsError);
      }

      const data = await response.json();
      setLogs(data.items || []);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching login logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchLogs(newPage);
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const dateStr = format(date, "yyyy/MM/dd");
      const timeStr = format(date, "HH:mm:ss");
      return { date: digitsEnToFa(dateStr), time: digitsEnToFa(timeStr) };
    } catch {
      return { date: "-", time: "-" };
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {fa.users.loginLogs.title.replace(
              "{name}",
              `${user.first_name} ${user.last_name}`,
            )}
          </DialogTitle>
          <DialogDescription>
            {fa.users.loginLogs.columns.ip} و{" "}
            {fa.users.loginLogs.columns.status}{" "}
            {fa.common.pagination.loginAttemptsLabel}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">
              {fa.users.loginLogs.empty}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">
                    {fa.users.loginLogs.columns.date}
                  </TableHead>
                  <TableHead className="text-right">
                    {fa.users.loginLogs.columns.time}
                  </TableHead>
                  <TableHead className="text-right">
                    {fa.users.loginLogs.columns.ip}
                  </TableHead>
                  <TableHead className="text-center">
                    {fa.users.loginLogs.columns.status}
                  </TableHead>
                  <TableHead className="text-right">
                    {fa.users.loginLogs.columns.reason}
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
                        {time}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {log.ip_address || "-"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={log.success ? "default" : "destructive"}
                          className="gap-1"
                        >
                          {log.success ? (
                            <>
                              <CheckCircle className="size-3" />
                              {fa.users.loginLogs.status.success}
                            </>
                          ) : (
                            <>
                              <XCircle className="size-3" />
                              {fa.users.loginLogs.status.failed}
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
              {fa.common.pagination.page} {digitsEnToFa(page)}{" "}
              {fa.common.pagination.of} {digitsEnToFa(totalPages)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1 || loading}
              >
                {fa.common.pagination.previous}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages || loading}
              >
                {fa.common.pagination.next}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
