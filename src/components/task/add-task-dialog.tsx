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
import users from "@/data/users.json";
import { cn, getUserInitials } from "@/lib/utils";
import {
  priorityColors,
  priorityIcons,
  TaskPriority,
  TaskStatus,
  taskStatusColors,
  taskStatusIcons,
  useTaskStore,
} from "@/store/task-store";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface AddTaskDialogProps {
  children: React.ReactNode;
  initialStatus?: TaskStatus;
}

export function AddTaskDialog({
  children,
  initialStatus = "todo",
}: AddTaskDialogProps) {
  const addTask = useTaskStore((state) => state.addTask);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUser, setAssignedUser] = useState("unassigned");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>(initialStatus);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
      title,
      description,
      assignedUser,
      priority,
      status,
      department: "Unassigned",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      comments: [],
    });

    setOpen(false);
    setTitle("");
    setDescription("");
    setAssignedUser("unassigned");
    setPriority("medium");
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
            <span>New issue</span>
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
              placeholder="Issue title"
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
              placeholder="Add description..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 py-2">
            {/* Status Select */}
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as TaskStatus)}
            >
              <SelectTrigger className="h-7 w-auto gap-1 border-dashed px-2 text-xs focus:ring-0 focus:ring-offset-0">
                <StatusIcon className={cn("size-4", statusIconColor)} />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">Todo</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Select */}
            <Select
              value={priority}
              onValueChange={(value) => setPriority(value as TaskPriority)}
            >
              <SelectTrigger className="h-7 w-auto gap-1 border-dashed px-2 text-xs focus:ring-0 focus:ring-offset-0">
                <PriorityIcon className={cn("size-4", priorityIconColor)} />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
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
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-7 w-7 border-dashed"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center justify-end pt-0">
            <Button size="sm" type="submit">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
