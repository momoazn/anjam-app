import { TasksResponse, TasksStatusOptions } from "@/lib/pocketbase-types";
import { TEXT } from "@/constants/text";
import { TaskListHeader } from "./task-list-header";
import { TaskListItem } from "./task-list-item";

interface TaskListGroupProps {
  statusTitle: string;
  taskCount: number;
  status: TasksStatusOptions;
  tasks: TasksResponse[];
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
        {tasks?.length > 0 ? (
          tasks?.map((task) => <TaskListItem key={task.id} task={task} />)
        ) : (
          <div className="text-center text-sm text-gray-500">{TEXT.tasks.list.noTasks}</div>
        )}
      </div>
    </section>
  );
}
