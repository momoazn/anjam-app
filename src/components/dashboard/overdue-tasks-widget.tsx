import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { fa } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { UserAvatar } from "@/components/user-avatar";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns-jalali";
import type { TasksPriorityOptions } from "@/lib/pocketbase-types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Task = {
  id: string;
  title: string;
  priority: TasksPriorityOptions;
  deadline?: string;
  expand?: {
    assignee?: any;
  };
};

type OverdueTasksWidgetProps = {
  overdueTasks?: Task[];
};

export function OverdueTasksWidget({ overdueTasks = [] }: OverdueTasksWidgetProps) {
  const navigate = useNavigate();

  if (overdueTasks.length === 0) {
    return null;
  }

  return (
    <Card className="border-destructive/20 bg-destructive/5 mt-6">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {fa.dashboard.cards.overdueTasks}{" "}
          <span className="text-muted-foreground text-sm font-normal">
            {overdueTasks.length > 4
              ? `(${digitsEnToFa(4)} / ${digitsEnToFa(overdueTasks.length)})`
              : `(${digitsEnToFa(overdueTasks.length)})`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {overdueTasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className="border-destructive/20 bg-background/80 hover:bg-background flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors"
              onClick={() => navigate(`/tasks/${task.id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/tasks/${task.id}`);
                }
              }}
              tabIndex={0}
              role="button"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <UserAvatar
                  user={task.expand?.assignee as any}
                  className="h-7 w-7"
                />
                <span className="truncate text-sm font-medium">
                  {task.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {fa.tasks.priority[task.priority]}
                </Badge>
                <span className="text-destructive text-xs font-medium">
                  {task.deadline
                    ? digitsEnToFa(format(new Date(task.deadline), "MM/dd"))
                    : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
