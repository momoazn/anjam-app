import { TEXT } from "@/constants/text";
import { TasksResponse, TasksStatusOptions } from "@/lib/pocketbase-types";
import { TaskListHeader } from "./task-list-header";
import { TaskListItem } from "./task-list-item";

interface TaskListGroupProps {
  taskCount: number;
  status: TasksStatusOptions;
  tasks: TasksResponse[];
}

export function TaskListGroup({
  taskCount,
  status,
  tasks,
}: TaskListGroupProps) {
  return (
    <section className="transition-colors duration-200">
      <TaskListHeader taskCount={taskCount} status={status} />
      <div className="mt-2 min-h-[30px] space-y-1 pe-1">
        {tasks?.length > 0 ? (
          tasks?.map((task) => <TaskListItem key={task.id} task={task} />)
        ) : (
          <div className="text-center text-sm text-gray-500">
            {TEXT.tasks.list.noTasks}
          </div>
        )}
      </div>
    </section>
  );
}
