import { useState } from "react";
import { toast } from "sonner";

import DatePicker from "@/components/ui/date-picker";
import { Popover, PopoverContent } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { shared, tasks } from "@/constants";
import { useUpdateTask } from "@/hooks/tasks";
import { TASK_STATUS_CONFIG } from "@/lib/status-utils";
import { cn } from "@/lib/utils";
import { TaskPriority, TaskStatus, TaskWithProject } from "@/types/tasks";

interface TaskQuickEditProps {
  task: TaskWithProject;
  users: Array<{
    id: string;
    _id: string;
    username: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
  }>;
  children: React.ReactNode;
}

export function TaskQuickEdit({ children }: TaskQuickEditProps) {
  return <div className="relative">{children}</div>;
}

export function StatusQuickEdit({
  task,
  onValueChange,
}: {
  task: TaskWithProject;
  onValueChange: () => void;
  }) {
  const [isOpen, setIsOpen] = useState(false);
  const updateTask = useUpdateTask();

  const handleStatusChange = (status: string) => {
    const taskId = task.id ?? task._id;
    updateTask.mutate({
      id: taskId,
      updates: { status: status as TaskStatus },
    });
    toast.success(tasks.edit.success);
    onValueChange();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverContent className="w-[160px] p-1.5" align="start">
        <Select value={task.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="border-transparent bg-transparent h-8 text-right text-xs focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border rounded-lg border">
            {Object.values(TASK_STATUS_CONFIG).map((status) => (
              <SelectItem
                key={status.key}
                value={status.key}
                className="text-xs font-bold"
              >
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  );
}

export function PriorityQuickEdit({
  task,
  onValueChange,
}: {
  task: TaskWithProject;
  onValueChange: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const updateTask = useUpdateTask();

  const priorityOptions: Array<{ value: TaskPriority; label: string }> =
    [
      { value: "low", label: tasks.priority.low },
      { value: "medium", label: tasks.priority.medium },
      { value: "high", label: tasks.priority.high },
      { value: "urgent", label: tasks.priority.urgent },
    ];

  const handlePriorityChange = (priority: string) => {
    const taskId = task.id ?? task._id;
    updateTask.mutate({
      id: taskId,
      updates: { priority: priority as TaskPriority },
    });
    toast.success(tasks.edit.success);
    onValueChange();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverContent className="w-[140px] p-1.5" align="start">
        <Select value={task.priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="border-transparent bg-transparent h-8 text-right text-xs focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border rounded-lg border">
            {priorityOptions.map((priority) => (
              <SelectItem
                key={priority.value}
                value={priority.value}
                className="text-xs font-bold"
              >
                {priority.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  );
}

export function AssigneeQuickEdit({
  task,
  users,
  onValueChange,
}: {
  task: TaskWithProject;
  users: Array<{
    id: string;
    username: string;
    first_name?: string;
    last_name?: string;
  }>;
  onValueChange: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const updateTask = useUpdateTask();

  const handleAssigneeChange = (assigneeId: string) => {
    const taskId = task.id ?? task._id;
    updateTask.mutate({
      id: taskId,
      updates: { assigneeUserId: assigneeId || undefined },
    });
    toast.success(tasks.edit.success);
    onValueChange();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverContent className="w-[180px] p-1.5" align="start">
        <Select
          value={task.assigneeUserId || "__unassigned"}
          onValueChange={(value) =>
            handleAssigneeChange(value === "__unassigned" ? "" : value)
          }
        >
          <SelectTrigger className="border-transparent bg-transparent h-8 text-right text-xs focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border rounded-lg border">
            <SelectItem value="__unassigned" className="text-xs font-bold">
              {tasks.addTask.unassigned}
            </SelectItem>
            {users.length === 0 ? (
              <SelectItem value="__empty" disabled>
                {shared.noData}
              </SelectItem>
            ) : (
              users.map((user) => (
                <SelectItem
                  key={user.id}
                  value={user.id}
                  className="text-xs font-bold"
                >
                  {user.first_name || user.last_name
                    ? `${user.first_name} ${user.last_name}`
                    : user.username}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </PopoverContent>
    </Popover>
  );
}

export function DueDateQuickEdit({
  task,
  onValueChange,
}: {
  task: TaskWithProject;
  onValueChange: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    task.deadline ? new Date(task.deadline) : undefined,
  );
  const updateTask = useUpdateTask();

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    const taskId = task.id ?? task._id;
    updateTask.mutate({
      id: taskId,
      updates: { deadline: date ? date.getTime() : undefined },
    });
    toast.success(tasks.edit.success);
    onValueChange();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverContent className="w-auto p-2" align="start">
        <DatePicker date={selectedDate} setDate={handleDateChange} />
      </PopoverContent>
    </Popover>
  );
}

interface EditableFieldProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  onKeyUp?: (e: React.KeyboardEvent) => void;
}

export function EditableField({
  children,
  onClick,
  className,
  onKeyUp,
}: EditableFieldProps) {
  return (
    <button
      type="button"
      className={cn(
        "cursor-pointer hover:bg-muted/50 rounded transition-colors",
        className,
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      onKeyUp={onKeyUp}
    >
      {children}
    </button>
  );
}
