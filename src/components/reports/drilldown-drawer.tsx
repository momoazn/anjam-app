import { X } from "lucide-react";
import { fa } from "@/constants/text";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  todo: fa.reports.todo,
  in_progress: fa.reports.inProgress,
  done: fa.reports.completed,
  canceled: fa.reports.canceled,
};

const PRIORITY_LABELS = {
  urgent: fa.tasks.priority.urgent,
  high: fa.reports.high,
  medium: fa.reports.medium,
  low: fa.reports.low,
};

export function DrilldownDrawer({ open, onOpenChange, rows, title }: Props) {
  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return fa.dashboard.fallbacks.noDeadline;
    return new Date(deadline).toLocaleDateString("fa-IR");
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>{title}</DrawerTitle>
          <button
            onClick={() => onOpenChange(false)}
            className="ring-offset-background focus:ring-ring cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </DrawerHeader>

        <div className="flex-1 overflow-auto p-4">
          {rows.length === 0 ? (
            <div className="text-muted-foreground flex h-32 items-center justify-center">
              {fa.reports.noTasksFound}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{fa.reports.title}</TableHead>
                  <TableHead>{fa.reports.taskStatus}</TableHead>
                  <TableHead>{fa.reports.taskPriority}</TableHead>
                  <TableHead>{fa.reports.deadline}</TableHead>
                  <TableHead>
                    {fa.reports.age} {fa.reports.ageUnit}
                  </TableHead>
                  <TableHead>{fa.reports.assignee}</TableHead>
                  <TableHead>{fa.reports.project}</TableHead>
                  <TableHead>{fa.reports.tags}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>
                      {STATUS_LABELS[
                        row.status as keyof typeof STATUS_LABELS
                      ] || row.status}
                    </TableCell>
                    <TableCell>
                      {PRIORITY_LABELS[
                        row.priority as keyof typeof PRIORITY_LABELS
                      ] || row.priority}
                    </TableCell>
                    <TableCell>{formatDeadline(row.deadline)}</TableCell>
                    <TableCell>{row.ageDays}</TableCell>
                    <TableCell>{row.assigneeName}</TableCell>
                    <TableCell>{row.projectName}</TableCell>
                    <TableCell>
                      {row.tags?.length ? row.tags.join(", ") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
