import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconHash, IconTerminal, IconX } from "@tabler/icons-react";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { dashboard, reports, tasks } from "@/constants";

type TaskRow = {
  id: string;
  title: string;
  status: string;
  priority: string;
  deadline: string | null;
  ageDays: number;
  assigneeName: string;
  projectName: string;
  tags: string[];
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: TaskRow[];
  title: string;
};

const STATUS_LABELS = {
  todo: reports.todo,
  in_progress: reports.inProgress,
  done: reports.completed,
  canceled: reports.canceled,
  pending: reports.pending,
  blocked: reports.blocked,
  review: reports.review,
  testing: reports.testing,
  ready: reports.ready,
  on_hold: reports.on_hold,
};

const PRIORITY_LABELS = {
  urgent: tasks.priority.urgent,
  high: reports.high,
  medium: reports.medium,
  low: reports.low,
};

export function DrilldownDrawer({ open, onOpenChange, rows, title }: Props) {
  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return dashboard.fallbacks.noDeadline;
    return digitsEnToFa(new Date(deadline).toLocaleDateString("fa-IR"));
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-border bg-card max-h-[85vh] rounded-t-2xl border-t-2 shadow-[0_-8px_24px_rgba(0,0,0,0.2)]">
        <DrawerHeader className="border-border/40 bg-muted/20 flex flex-row items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <IconTerminal className="text-primary size-4" />
            <DrawerTitle className="text-sm font-bold tracking-tight">
              {title}
            </DrawerTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="hover:bg-muted hover:border-border/40 rounded-lg border border-transparent p-2 transition-colors"
          >
            <IconX className="size-4" />
          </button>
        </DrawerHeader>

        <div className="scrollbar-none flex-1 overflow-auto">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center opacity-30 grayscale">
              <IconHash className="mb-4 size-10 stroke-1" />
              <p className="text-[10px] font-bold tracking-tight">
                {reports.noTasksFound}
              </p>
            </div>
          ) : (
            <div className="bg-border/40 divide-border/10 grid grid-cols-1 gap-px divide-y">
              {/* Table Head Mockup */}
              <div className="bg-muted/30 border-border/40 sticky top-0 z-10 grid h-10 grid-cols-8 border-b backdrop-blur-sm">
                {[
                  reports.title,
                  reports.taskStatus,
                  reports.taskPriority,
                  reports.deadline,
                  reports.age,
                  reports.assignee,
                  reports.project,
                  reports.tags,
                ].map((head) => (
                  <div
                    key={head}
                    className="text-muted-foreground/60 border-border/10 flex items-center justify-center border-s text-[8px] font-bold tracking-tight last:border-s-0"
                  >
                    {head}
                  </div>
                ))}
              </div>

              {/* Table Body Modules */}
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="group bg-card hover:bg-muted/30 relative grid grid-cols-8 overflow-hidden text-right transition-all"
                >
                  <div className="border-border/10 flex items-center justify-end truncate border-s p-4 text-xs font-bold">
                    {row.title}
                  </div>
                  <div className="border-border/10 flex items-center justify-center border-s p-4 text-[10px] font-bold tracking-tight opacity-60">
                    {STATUS_LABELS[row.status as keyof typeof STATUS_LABELS] ||
                      row.status}
                  </div>
                  <div className="border-border/10 flex items-center justify-center border-s p-4 text-[10px] font-bold tracking-tight opacity-60">
                    {PRIORITY_LABELS[
                      row.priority as keyof typeof PRIORITY_LABELS
                    ] || row.priority}
                  </div>
                  <div className="border-border/10 flex items-center justify-center border-s p-4 text-[10px] font-bold tabular-nums opacity-60">
                    {formatDeadline(row.deadline)}
                  </div>
                  <div className="border-border/10 flex items-center justify-center border-s p-4 text-[10px] font-bold tabular-nums opacity-60">
                    {digitsEnToFa(row.ageDays)}
                  </div>
                  <div className="border-border/10 flex items-center justify-end truncate border-s p-4 text-[10px] font-bold">
                    {row.assigneeName}
                  </div>
                  <div className="border-border/10 flex items-center justify-end truncate border-s p-4 text-[10px] font-bold opacity-60">
                    {row.projectName}
                  </div>
                  <div className="flex items-center justify-end p-4 text-[9px] font-bold tracking-tight opacity-40">
                    {row.tags?.length ? row.tags.join(", ") : "—"}
                  </div>

                  <div className="bg-primary absolute end-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-muted/20 border-border/40 flex items-center justify-between border-t px-6 py-2">
          <span className="text-muted-foreground/40 text-[8px] font-bold tracking-tight">
            {reports.filters.activeDump}
          </span>
          <span className="text-[10px] font-bold tabular-nums">
            {digitsEnToFa(rows.length)} {reports.filters.entries}
          </span>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
