import { useMutation } from "@tanstack/react-query";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
import { pb } from "@/lib/pocketbase";
import {
  TasksPriorityOptions,
  TasksRecord,
  TasksStatusOptions,
} from "@/lib/pocketbase-types";
import { cn, getUserInitials } from "@/lib/utils";
import {
  priorityColors,
  priorityIcons,
  taskStatusColors,
  taskStatusIcons,
} from "@/store/task-store";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { TEXT } from "@/constants/text";

interface AddTaskDialogProps {
  children: React.ReactNode;
  initialStatus?: TasksStatusOptions;
}

export function AddTaskDialog({
  children,
  initialStatus = TasksStatusOptions.todo,
}: AddTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUser, setAssignedUser] = useState(TEXT.tasks.addTask.unassigned);
  const [priority, setPriority] = useState<TasksPriorityOptions>(
    TasksPriorityOptions.medium,
  );
  const [status, setStatus] = useState<TasksStatusOptions>(
    TasksStatusOptions.todo,
  );

  const { mutate: createTask, isPending: isCreatingTask } = useMutation({
    mutationFn: (task: Omit<TasksRecord, "id" | "created" | "updated">) =>
      pb.collection("tasks").create(task),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // createTask({
    //   title,
    //   description,
    //   assignee: assignedUser,
    //   priority,
    //   status,
    //   deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    //     .toISOString()
    //     .split("T")[0],
    // });

    setOpen(false);
    setTitle("");
    setDescription("");
    setAssignedUser(TEXT.tasks.addTask.unassigned);
    setPriority(TasksPriorityOptions.medium);
    setStatus(initialStatus);
  };

  const StatusIcon = taskStatusIcons[status];
  const statusIconColor = taskStatusColors[status];
  const PriorityIcon = priorityIcons[priority];
  const priorityIconColor = priorityColors[priority];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        aria-describedby=""
        className="gap-0 border-none p-0 sm:max-w-[640px]"
      >
        <DialogHeader className="mt-1 flex flex-row items-center justify-between border-b px-4 py-2">
          <DialogTitle className="text-muted-foreground flex items-center gap-2 text-sm font-normal">
            <ChevronRight className="size-4" />
            <span>{TEXT.tasks.addTask.title}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-1 p-4">
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
                <SelectItem value="in_progress">{TEXT.tasks.status.in_progress}</SelectItem>
                <SelectItem value="done">{TEXT.tasks.status.done}</SelectItem>
                <SelectItem value="canceled">{TEXT.tasks.status.canceled}</SelectItem>
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
                <SelectItem value="medium">{TEXT.tasks.priority.medium}</SelectItem>
                <SelectItem value="high">{TEXT.tasks.priority.high}</SelectItem>
                <SelectItem value="urgent">{TEXT.tasks.priority.urgent}</SelectItem>
              </SelectContent>
            </Select>

            {/* Assignee Select */}
            <Select
              value={assignedUser}
              onValueChange={(value) => setAssignedUser(value)}
            >
              <SelectTrigger className="h-7 w-auto gap-1 border-dashed px-2 text-xs focus:ring-0 focus:ring-offset-0">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-gray-200 text-[10px]">
                    {getUserInitials(assignedUser)}
                  </AvatarFallback>
                </Avatar>
                <SelectValue placeholder={TEXT.tasks.addTask.assignee} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">{TEXT.tasks.addTask.unassigned}</SelectItem>
                {/* {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username}
                  </SelectItem>
                ))} */}
              </SelectContent>
            </Select>
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

          <div className="flex items-center justify-end pt-0">
            <Button size="sm" type="submit" disabled={isCreatingTask}>
              {isCreatingTask ? TEXT.tasks.addTask.buttons.creating : TEXT.tasks.addTask.buttons.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
