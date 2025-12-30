import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Hash } from "lucide-react";
import { dashboard, tasks } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { UserAvatar } from "@/components/user-avatar";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns-jalali";
import type { TasksPriorityOptions } from "@/lib/pocketbase-types";

type AssigneePreview = {
  id?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
  collectionId?: string;
  collectionName?: string;
};

type Task = {
  id: string;
  title: string;
  priority: TasksPriorityOptions;
  deadline?: string;
  expand?: {
    assignee?: AssigneePreview;
  };
};

type OverdueTasksWidgetProps = {
  overdueTasks?: Task[];
};

export function OverdueTasksWidget({
  overdueTasks = [],
}: OverdueTasksWidgetProps) {
  const navigate = useNavigate();

  if (overdueTasks.length === 0) {
    return null;
  }

  return (
    <Card className="relative mt-8 overflow-hidden rounded-2xl border border-rose-200 bg-rose-50 shadow-sm dark:border-rose-900/50 dark:bg-rose-950/20">
      <CardHeader className="relative z-10 border-b border-rose-100 p-6 dark:border-rose-900/30">
        <CardTitle className="flex items-center gap-3 text-sm font-bold text-rose-600 dark:text-rose-400">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-100 text-rose-600 dark:border-rose-800 dark:bg-rose-900/50">
            <AlertTriangle className="size-4" />
          </div>
          <span className="flex-1">{dashboard.cards.overdueTasks}</span>
          <Badge
            variant="outline"
            className="border-rose-200 bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-600 dark:border-rose-800 dark:bg-rose-900/50 dark:text-rose-400"
          >
            {overdueTasks.length > 4
              ? `${digitsEnToFa(4)} / ${digitsEnToFa(overdueTasks.length)}`
              : `${digitsEnToFa(overdueTasks.length)}`}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {overdueTasks.slice(0, 4).map((task, idx) => (
            <Button
              key={task.id}
              variant="ghost"
              className="group/item bg-card flex h-auto cursor-pointer items-center justify-between rounded-xl border border-rose-100 p-4 transition-all duration-200 hover:border-rose-300 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-900/20"
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative">
                  <UserAvatar
                    user={task.expand?.assignee}
                    className="size-8 rounded-full border border-rose-200 shadow-sm transition-transform duration-300 group-hover/item:scale-105"
                  />
                </div>

                <div className="min-w-0 flex-1 text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold tracking-tight text-rose-500/60">
                      {dashboard.cards.task} {digitsEnToFa(idx + 1)}
                    </span>
                  </div>
                  <p className="text-foreground mt-0.5 truncate text-sm font-semibold">
                    {task.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Hash className="size-3 text-rose-500/40" />
                    <span className="text-[10px] font-medium text-rose-500/70">
                      {tasks.priority[task.priority]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-100 px-2 py-1 dark:border-rose-800 dark:bg-rose-900/50">
                  <Calendar className="size-3 text-rose-600" />
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                    {task.deadline
                      ? digitsEnToFa(format(new Date(task.deadline), "MM/dd"))
                      : ""}
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
