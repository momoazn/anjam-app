import { useMemo } from "react";
import { TaskListGroup } from "../components/task/task-list-group";
import { TaskListItem } from "../components/task/task-list-item";
import { useAuthStore } from "../store/auth-store";
import { Task, TaskStatus, useTaskStore } from "../store/task-store";

const statusLabels: Record<TaskStatus, string> = {
  pending: "Todo",
  in_progress: "In Progress",
  completed: "Done",
  overdue: "Overdue",
  canceled: "Canceled",
};

const statusOrder: TaskStatus[] = [
  "in_progress",
  "pending",
  "completed",
  "canceled",
];

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);

  const userTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (user?.role === "employee") {
        return task.assignedTo.includes(user?.username ?? "");
      }
      return true;
    });
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
