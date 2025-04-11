import { columns } from "@/components/task-group-table/columns";
import { TasksTable } from "@/components/task-group-table/table";
import { useMemo } from "react";
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
      {statusOrder.map((status) => {
        const tasksInGroup = groupedTasks[status] ?? [];

        return (
          <div key={status}>
            <h2 className="ps-2 text-lg font-bold">{statusLabels[status]}</h2>
            <TasksTable columns={columns} data={tasksInGroup} />
          </div>
        );
        // return (
        //   <TaskListGroup
        //     key={status}
        //     statusTitle={statusLabels[status]}
        //     taskCount={tasksInGroup.length}
        //     status={status}
        //   >
        //     {tasksInGroup.map((task) => (
        //       <TaskListItem key={task.id} task={task} />
        //     ))}
        //   </TaskListGroup>
        // );
      })}
    </div>
  );
}
