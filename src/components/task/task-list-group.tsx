import { TaskListItem } from "@/components/task/task-list-item";
import { Task, TaskStatus } from "@/store/task-store";
import { TaskListHeader } from "./task-list-header";

interface TaskListGroupProps {
  statusTitle: string;
  taskCount: number;
  status: TaskStatus;
  tasks: Task[];
}

export function TaskListGroup({
  statusTitle,
  taskCount,
  status,
  tasks,
}: TaskListGroupProps) {
  return (
    <section className="">
      <TaskListHeader
        statusTitle={statusTitle}
        taskCount={taskCount}
        status={status}
      />
      <div className="mt-2 space-y-1 pe-1">
        {tasks.map((task) => (
          <TaskListItem key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}
