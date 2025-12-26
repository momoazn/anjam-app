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
    <Card className="border-destructive/40 bg-card shadow-destructive/5 mt-6 shadow-md">
      <CardHeader className="border-destructive/20 bg-destructive/10 border-b">
        <CardTitle className="text-destructive flex items-center gap-3 text-sm font-black tracking-tight uppercase">
          <div className="bg-destructive/10 text-destructive border-destructive/20 flex h-7 w-7 items-center justify-center rounded-none border">
            <AlertTriangle className="size-3.5" />
          </div>
          <span className="flex-1">{dashboard.cards.overdueTasks}</span>
          <Badge
            variant="outline"
            className="border-destructive/30 bg-destructive/10 text-destructive rounded-none text-[9px] font-black tracking-wider uppercase"
          >
            {overdueTasks.length > 4
              ? `${digitsEnToFa(4)} / ${digitsEnToFa(overdueTasks.length)}`
              : `${digitsEnToFa(overdueTasks.length)}`}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {overdueTasks.slice(0, 4).map((task) => (
            <Button
              key={task.id}
              variant="ghost"
              className="group hover:bg-destructive/10 bg-background/80 border-border/20 hover:border-destructive/30 flex h-auto cursor-pointer items-center justify-between rounded-none border p-3 transition-all"
              onClick={() => navigate(`/tasks/${task.id}`)}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="border-destructive/20 bg-destructive/5 group-hover:bg-destructive/40 flex h-1 w-1 shrink-0 rounded-none transition-colors" />
                <UserAvatar
                  user={task.expand?.assignee}
                  className="border-border size-7 rounded-none border shadow-sm transition-transform duration-300 group-hover:scale-110"
                />
                <div className="min-w-0 flex-1 text-right">
                  <p className="text-foreground truncate text-xs font-black tracking-tight">
                    {task.title}
                  </p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Hash className="text-muted-foreground/30 size-2" />
                    <span className="text-muted-foreground/50 text-[8px] font-bold uppercase">
                      PRIORITY
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge
                  variant="secondary"
                  className="border-border/20 bg-muted/50 rounded-none border text-[9px] font-black uppercase"
                >
                  {tasks.priority[task.priority]}
                </Badge>
                <div className="bg-destructive/10 border-destructive/30 flex items-center gap-1 rounded-none border px-1.5 py-0.5">
                  <Calendar className="text-destructive size-2.5" />
                  <span className="text-destructive text-[9px] font-black tracking-tight">
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
