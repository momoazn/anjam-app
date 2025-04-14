import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TEXT } from "@/constants/text";
import { pb, TaskWithProject } from "@/lib/pocketbase";
import {
  TasksPriorityOptions,
  TasksRecord,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import {
  priorityColors,
  priorityIcons,
  taskStatusColors,
  taskStatusIcons,
} from "@/lib/tasks-utils";
import { cn, getUserInitials } from "@/lib/utils";
import { useSpecificProjectUsers } from "@/pb-hooks";
import { useAuthStore } from "@/store/auth-store";

interface TaskDetailsDialogProps {
  children: React.ReactNode;
  task: TaskWithProject;
  onSuccess?: () => void;
}

export function TaskDetailsDialog({
  children,
  task,
  onSuccess,
}: TaskDetailsDialogProps) {
  const user = useAuthStore().user;
  const queryClient = useQueryClient();
  const projectId = task.project;

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(task.title ?? "");
  const [description, setDescription] = useState(task.description ?? "");
  const [assignedUser, setAssignedUser] = useState<string>(
    task.assignee ?? TEXT.tasks.addTask.unassigned,
  );
  const [priority, setPriority] = useState<TasksPriorityOptions>(task.priority);
  const [status, setStatus] = useState<TasksStatusOptions>(task.status);

  // Fetch project users
  const { data: projectUsers } = useSpecificProjectUsers(
    projectId,
    Boolean(projectId),
  );

  const { mutate: updateTask, isPending: isUpdatingTask } = useMutation({
    mutationFn: (updates: Partial<TasksRecord>) =>
      pb.collection("tasks").update(task.id, updates),
    onSuccess: () => {
      onSuccess?.();
      queryClient.invalidateQueries({ queryKey: ["tasks-full-list"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    updateTask({
      title,
      description,
      priority,
      status,
      assignee:
        assignedUser !== TEXT.tasks.addTask.unassigned
          ? assignedUser
          : undefined,
    });

    setOpen(false);
  };

  const StatusIcon = taskStatusIcons[status];
  const statusIconColor = taskStatusColors[status];
  const PriorityIcon = priorityIcons[priority];
  const priorityIconColor = priorityColors[priority];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="overflow-y-auto sm:max-h-[95vh] sm:max-w-[800px]">
        <DialogTitle className="flex items-center gap-2 text-base">
          <span className="font-mono text-sm text-gray-400">
            {task.display_id}
          </span>
          <span>{TEXT.tasks.details.title}</span>
        </DialogTitle>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-0">
            <Input
              id="title"
              className="h-auto border-none p-0 text-xl font-semibold shadow-none focus-visible:ring-0"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={TEXT.tasks.addTask.issueTitle}
            />
          </div>

          <div className="mt-4 space-y-0">
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setDescription(e.target.value)
              }
              className="min-h-[60px] w-full resize-none border-none bg-transparent p-0 text-sm shadow-none outline-none focus-visible:ring-0"
              placeholder={TEXT.tasks.addTask.description}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 py-2">
            {/* Status Select */}
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as TasksStatusOptions)}
            >
              <SelectTrigger className="h-7 w-auto gap-1 border-dashed px-2 text-xs focus:ring-0 focus:ring-offset-0">
                <StatusIcon className={cn("size-4", statusIconColor)} />
                <SelectValue placeholder={TEXT.tasks.addTask.status} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">{TEXT.tasks.status.todo}</SelectItem>
                <SelectItem value="in_progress">
                  {TEXT.tasks.status.in_progress}
                </SelectItem>
                <SelectItem value="done">{TEXT.tasks.status.done}</SelectItem>
                <SelectItem value="canceled">
                  {TEXT.tasks.status.canceled}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Select */}
            <Select
              value={priority}
              onValueChange={(value) =>
                setPriority(value as TasksPriorityOptions)
              }
            >
              <SelectTrigger className="h-7 w-auto gap-1 border-dashed px-2 text-xs focus:ring-0 focus:ring-offset-0">
                <PriorityIcon className={cn("size-4", priorityIconColor)} />
                <SelectValue placeholder={TEXT.tasks.addTask.priority} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{TEXT.tasks.priority.low}</SelectItem>
                <SelectItem value="medium">
                  {TEXT.tasks.priority.medium}
                </SelectItem>
                <SelectItem value="high">{TEXT.tasks.priority.high}</SelectItem>
                <SelectItem value="urgent">
                  {TEXT.tasks.priority.urgent}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Assignee Select */}
            <Select value={assignedUser} onValueChange={setAssignedUser}>
              <SelectTrigger className="h-7 w-auto gap-1 border-dashed px-2 text-xs focus:ring-0 focus:ring-offset-0">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-muted text-[10px]">
                    {getUserInitials(assignedUser)}
                  </AvatarFallback>
                </Avatar>
                <SelectValue placeholder={TEXT.tasks.addTask.assignee} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TEXT.tasks.addTask.unassigned}>
                  {TEXT.tasks.addTask.unassigned}
                </SelectItem>
                {projectUsers &&
                  projectUsers?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                {task.tags.map((tag) => {
                  let tagColor = "bg-muted text-muted-foreground border-border";
                  if (tag === TEXT.tasks.tags.bug)
                    tagColor =
                      "bg-destructive/10 text-destructive border-destructive/20";
                  if (tag === TEXT.tasks.tags.feature)
                    tagColor = "bg-primary/10 text-primary border-primary/20";
                  if (tag === TEXT.tasks.tags.improvement)
                    tagColor = "bg-accent/10 text-accent border-accent/20";
                  return (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={`rounded px-1.5 py-0.5 text-xs font-medium ${tagColor}`}
                    >
                      {tag}
                    </Badge>
                  );
                })}
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 border-dashed"
              aria-label={TEXT.tasks.addTask.buttons.more}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              {TEXT.tasks.details.buttons.cancel}
            </Button>
            <Button size="sm" type="submit" disabled={isUpdatingTask}>
              {isUpdatingTask
                ? TEXT.tasks.details.buttons.saving
                : TEXT.tasks.details.buttons.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
