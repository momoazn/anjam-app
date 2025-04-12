import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { TaskListGroup } from "@/components/task/task-list-group";
import { pb } from "@/lib/pocketbase";
import {
  TasksRecord,
  TasksStatusOptions,
  UsersRoleOptions,
} from "@/lib/pocketbase-types";
import { useAuthStore } from "@/store/auth-store";
import { statusLabels, statusOrder } from "@/store/task-store";

export default function Dashboard() {
  const user = useAuthStore().user;

  const { data: userTasks, isPending: isLoadingTasks } = useQuery({
    queryKey: ["tasks", user?.id],
    queryFn: () => {
      return pb.collection("tasks").getFullList<TasksRecord>({
        batch: 100,
        filter:
          user?.role === UsersRoleOptions.employee
            ? `assignee = "${user?.id}"`
            : "",
        expand: "creator,assignee",
      });
    },
  });

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
