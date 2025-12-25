import { useMemo, useState } from "react";
import { IconClock, IconEdit, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

import { TimeEntryDialog } from "@/components/task/time-entry-dialog";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { tasks } from "@/constants";
import {
  useDeleteTimeEntry,
  useTimeEntries,
  useUpdateTimeEntry,
} from "@/hooks";
import { formatDateISO, formatTaskDate } from "@/lib/date-utils";
import { handlePocketBaseError } from "@/lib/error-handler";
import { formatTimeSpent } from "@/lib/time-utils";
import { formatUserName } from "@/lib/utils";
import type {
  TimeEntriesResponse,
  UsersResponse,
} from "@/lib/pocketbase-types";
import { useAuthUser } from "@/store/auth-store";

type TimeEntriesProps = {
  taskId: string;
  taskTitle: string;
  estimatedMinutes?: number;
};

type TimeEntryWithUser = TimeEntriesResponse<{ user?: UsersResponse }>;

export function TimeEntries({
  taskId,
  taskTitle,
  estimatedMinutes,
}: TimeEntriesProps) {
  const user = useAuthUser();
  const { data: timeEntries = [], isLoading } = useTimeEntries(taskId);
  const updateTimeEntry = useUpdateTimeEntry();
  const deleteTimeEntry = useDeleteTimeEntry();

  const [editingEntry, setEditingEntry] = useState<TimeEntryWithUser | null>(
    null,
  );

  const groupedEntries = useMemo(() => {
    const groups = new Map<string, TimeEntryWithUser[]>();
    timeEntries.forEach((entry) => {
      const dateKey = formatDateISO(entry.started_at || entry.created);
      const group = groups.get(dateKey) ?? [];
      group.push(entry);
      groups.set(dateKey, group);
    });
    return Array.from(groups.entries());
  }, [timeEntries]);

  const totalMinutes = useMemo(() => {
    return timeEntries.reduce((total, entry) => total + entry.minutes, 0);
  }, [timeEntries]);

  const handleEditSave = async (payload: {
    minutes: number;
    note?: string;
  }) => {
    if (!editingEntry) return;
    try {
      await updateTimeEntry.mutateAsync({
        id: editingEntry.id,
        updates: {
          minutes: payload.minutes,
          note: payload.note,
        },
      });
      toast.success("ورودی زمانی به‌روزرسانی شد");
      setEditingEntry(null);
    } catch (error) {
      handlePocketBaseError(error as Error);
    }
  };

  const handleDelete = (entryId: string) => {
    deleteTimeEntry.mutate(entryId, {
      onSuccess: () => toast.success("ورودی زمانی حذف شد"),
      onError: (error: unknown) => handlePocketBaseError(error as Error),
    });
  };

  if (isLoading) {
    return (
      <p className="text-muted-foreground text-right text-sm">
        در حال بارگذاری ورودی‌های زمانی...
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconClock className="text-primary/60 size-4" />
          <span className="text-muted-foreground text-[10px] font-black tracking-[0.3em] uppercase">
            {tasks.details.timeEntries.title}
          </span>
        </div>
        <span className="text-sm font-black">
          {formatTimeSpent(totalMinutes)}
        </span>
      </div>

      {groupedEntries.length === 0 ? (
        <p className="text-muted-foreground text-right text-sm">
          {tasks.details.timeEntries.empty}
        </p>
      ) : (
        <div className="space-y-6">
          {groupedEntries.map(([dateKey, entries]) => (
            <div key={dateKey} className="space-y-3">
              <div className="text-muted-foreground text-[10px] font-black tracking-[0.3em] uppercase">
                {dateKey}
              </div>
              <div className="space-y-3">
                {entries.map((entry) => {
                  const entryUser = entry.expand?.user;
                  const isOwner = entry.user === user?.id;
                  return (
                    <div
                      key={entry.id}
                      className="border-border/10 bg-card rounded-none border px-4 py-3 text-right shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            user={entryUser}
                            className="border-border/40 size-9 rounded-none border"
                          />
                          <div>
                            <p className="font-black">
                              {formatTimeSpent(entry.minutes)}
                            </p>
                            <p className="text-muted-foreground text-[12px]">
                              {entryUser
                                ? formatUserName(
                                    entryUser.first_name,
                                    entryUser.last_name,
                                    entryUser.username,
                                  )
                                : tasks.details.unknownUser}
                              {entry.note ? ` · ${entry.note}` : ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-[10px] uppercase">
                            {formatTaskDate(entry.started_at || entry.created)}
                          </span>
                          {isOwner && (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-none"
                                onClick={() => setEditingEntry(entry)}
                                disabled={updateTimeEntry.isPending}
                              >
                                <IconEdit className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 rounded-none text-rose-500"
                                onClick={() => handleDelete(entry.id)}
                                disabled={deleteTimeEntry.isPending}
                              >
                                <IconTrash className="size-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <TimeEntryDialog
        open={Boolean(editingEntry)}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        currentMinutes={editingEntry?.minutes ?? 0}
        estimatedMinutes={estimatedMinutes}
        onSave={handleEditSave}
        taskTitle={taskTitle}
        defaultNote={editingEntry?.note ?? ""}
      />
    </div>
  );
}
