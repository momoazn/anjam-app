import { useMemo } from "react";
import { TaskListGroup } from "../components/task/task-list-group";
import { TaskListItem } from "../components/task/task-list-item";
import { useAuthStore } from "../store/auth-store";
import { Task, TaskStatus, useTaskStore } from "../store/task-store";

const statusLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
};

const statusOrder: TaskStatus[] = ["todo", "in_progress", "done", "canceled"];

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);

  const userTasks = useMemo(() => {
    return user?.role === "employee"
      ? tasks.filter((task) => task.assignedTo.includes(user?.username ?? ""))
      : tasks;
  }, [tasks, user]);

  const groupedTasks = useMemo(() => {
    return userTasks.reduce(
      (acc, task) => {
        (acc[task.status] = acc[task.status] || []).push(task);
        return acc;
      },
      {} as Record<TaskStatus, Task[]>,
    );
  }, [userTasks]);

  return (
    <div className="flex h-screen flex-col bg-white text-gray-900">
      {statusOrder.map((status) => {
        const tasksInGroup = groupedTasks[status] || [];

        return (
          <TaskListGroup
            key={status}
            statusTitle={statusLabels[status]}
            taskCount={tasksInGroup.length}
            status={status}
          >
            {tasksInGroup.map((task) => (
              <TaskListItem key={task.id} task={task} />
            ))}
          </TaskListGroup>
        );
      })}
    </div>
  );
}
