import { useMutation, useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";

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
import { pb } from "@/lib/pocketbase";
import {
  ProjectsResponse,
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
import { useParams } from "react-router-dom";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface AddTaskDialogProps {
  children: React.ReactNode;
  initialStatus?: TasksStatusOptions;
  onSuccess?: () => void;
}

export function AddTaskDialog({
  children,
  initialStatus = TasksStatusOptions.todo,
  onSuccess,
}: AddTaskDialogProps) {
  const user = useAuthStore().user;
  const { id: projectId } = useParams<{ id: string }>();
  const isInProject = Boolean(projectId);

  console.log(isInProject);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedUser, setAssignedUser] = useState<string>(
    TEXT.tasks.addTask.unassigned,
  );
  const [priority, setPriority] = useState<TasksPriorityOptions>(
    TasksPriorityOptions.medium,
  );
  const [status, setStatus] = useState<TasksStatusOptions>(initialStatus);
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? "");

  // Fetch available projects
  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => pb.collection("projects").getFullList<ProjectsResponse>(),
    enabled: !isInProject, // Only fetch if we're not in a project view
  });

  // Fetch project users when in project context
  const { data: projectUsers } = useSpecificProjectUsers(
    projectId ?? "",
    Boolean(projectId), // Enable only when we have a project ID
  );

  // Fetch all users when not in project context
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => pb.collection("users").getFullList(),
    enabled: !projectId, // Enable only when we don't have a project ID
  });

  // Use projectUsers when in project context, otherwise use all users
  const assignees = projectId ? projectUsers : users;

  const { mutate: createTask, isPending: isCreatingTask } = useMutation({
    mutationFn: (task: Omit<TasksRecord, "id" | "created" | "updated">) =>
      pb.collection("tasks").create(task),
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    createTask({
      title,
      description,
      creator: user.id,
      priority,
      project: projectId ?? selectedProjectId,
      status,
      assignee:
        assignedUser !== TEXT.tasks.addTask.unassigned
          ? assignedUser
          : undefined,
    });

    setOpen(false);
    setTitle("");
    setDescription("");
    setAssignedUser(TEXT.tasks.addTask.unassigned);
    setPriority(TasksPriorityOptions.medium);
    setStatus(initialStatus);
    if (!projectId) {
      setSelectedProjectId("");
    }
  };

  const StatusIcon = taskStatusIcons[status];
  const statusIconColor = taskStatusColors[status];
  const PriorityIcon = priorityIcons[priority];
  const priorityIconColor = priorityColors[priority];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogTitle className="sr-only">{TEXT.tasks.addTask.title}</DialogTitle>
      <DialogContent className="sm:max-w-[640px]">
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
            {/* Project Select */}
            {!projectId && (
              <Select
                value={selectedProjectId}
                onValueChange={setSelectedProjectId}
                required
              >
                <SelectTrigger className="h-7 w-auto gap-1 border-dashed px-2 text-xs focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder={TEXT.tasks.addTask.selectProject} />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

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
                {assignees &&
                  assignees?.map((user) => (
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
              aria-label={TEXT.tasks.addTask.buttons.more}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center justify-end pt-0">
            <Button size="sm" type="submit" disabled={isCreatingTask}>
              {isCreatingTask
                ? TEXT.tasks.addTask.buttons.creating
                : TEXT.tasks.addTask.buttons.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
