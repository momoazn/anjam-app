import { lazy, useMemo } from "react";

import { pb } from "@/lib/pocketbase";
import { UsersRecord, UsersRoleOptions } from "@/lib/pocketbase-types";
import {
  statusLabels,
  statusOrder,
  Task,
  TaskStatus,
  useTaskStore,
} from "@/store/task-store";

const TaskListGroup = lazy(() =>
  import("@/components/task/task-list-group").then((module) => ({
    default: module.TaskListGroup,
  })),
);

export default function Dashboard() {
  const user = pb.authStore.record as unknown as UsersRecord;
  const tasks = useTaskStore((state) => state.tasks);

  const userTasks = useMemo(() => {
    return user?.role === UsersRoleOptions.employee
      ? tasks.filter((task) => task.assignedUser.includes(user?.username ?? ""))
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
    <div className="mt-4 flex flex-col space-y-4 bg-white pb-8 text-gray-900">
      {statusOrder?.map((status) => {
        const sortedTasks = groupedTasks[status]?.sort((a, b) => {
          if (a.priority === b.priority) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          if (a.priority === "urgent") return -1;
          if (b.priority === "urgent") return 1;
          if (a.priority === "high") return -1;
          if (b.priority === "high") return 1;
          if (a.priority === "medium") return -1;
          if (b.priority === "medium") return 1;
          if (a.priority === "low") return -1;
          if (b.priority === "low") return 1;
          return 0;
        });

        return (
          <TaskListGroup
            key={status}
            statusTitle={statusLabels[status]}
            taskCount={sortedTasks?.length}
            status={status}
            tasks={sortedTasks ?? []}
          />
        );
      })}
    </div>
  );
}
