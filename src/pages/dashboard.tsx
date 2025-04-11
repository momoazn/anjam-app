import { lazy, useMemo } from "react";

import { pb } from "@/lib/pocketbase";
import {
  TasksRecord,
  TasksStatusOptions,
  UsersRecord,
  UsersRoleOptions,
} from "@/lib/pocketbase-types";
import { statusLabels, statusOrder } from "@/store/task-store";
import { useQuery } from "@tanstack/react-query";

const TaskListGroup = lazy(() =>
  import("@/components/task/task-list-group").then((module) => ({
    default: module.TaskListGroup,
  })),
);

export default function Dashboard() {
  const user = pb.authStore.record as unknown as UsersRecord;

  const { data: userTasks, isPending: isLoadingTasks } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: () =>
      pb.collection("tasks").getFullList<TasksRecord>({
        batch: 100,
        filter:
          user.role === UsersRoleOptions.employee
            ? `assignee = "${user?.id}"`
            : "",
      }),
  });

  // const userTasks = useMemo(() => {
  //   return user?.role === UsersRoleOptions.employee
  //     ? tasks.filter((task) => task.assignedUser.includes(user?.username ?? ""))
  //     : tasks;
  // }, [tasks, user]);

  const groupedTasks = useMemo(() => {
    return isLoadingTasks
      ? ([] as unknown as Record<TasksStatusOptions, TasksRecord[]>)
      : userTasks?.reduce(
          (acc, task) => {
            (acc[task.status] = acc[task.status] || []).push(task);
            return acc;
          },
          {} as Record<TasksStatusOptions, TasksRecord[]>,
        );
  }, [userTasks, isLoadingTasks]);

  return (
    <div className="mt-4 flex flex-col space-y-4 bg-white pb-8 text-gray-900">
      {statusOrder?.map((status) => {
        const sortedTasks = groupedTasks?.[status]?.sort((a, b) => {
          if (a.priority === b.priority) {
            return (
              new Date(b.created ?? "").getTime() -
              new Date(a.created ?? "").getTime()
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
            taskCount={sortedTasks?.length ?? 0}
            status={status as TasksStatusOptions}
            tasks={sortedTasks ?? []}
          />
        );
      })}
    </div>
  );
}
