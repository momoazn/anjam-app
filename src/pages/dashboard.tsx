import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, ChevronDown, ClipboardList, Filter, List } from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
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

  const getUserInitials = (username?: string) => {
    return username
      ? username
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "U";
  };

  return (
    <div className="flex h-screen flex-col bg-white text-gray-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <Tabs defaultValue="all" className="flex-grow">
          <TabsList className="space-x-1 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900"
            >
              All Issues
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900"
            >
              <div className="mr-2 h-2 w-2 rounded-full bg-blue-500"></div>{" "}
              Active
            </TabsTrigger>
            <TabsTrigger
              value="backlog"
              className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900"
            >
              <div className="mr-2 h-2 w-2 rounded-full border border-gray-400"></div>{" "}
              Backlog
            </TabsTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              <ClipboardList className="h-4 w-4" />
            </Button>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-6 w-6 cursor-pointer">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${user?.username}.png`}
                />
                <AvatarFallback className="bg-gray-200 text-xs">
                  {getUserInitials(user?.username)}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>{user?.username}</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="sticky top-[57px] z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-gray-600 hover:bg-gray-100"
        >
          <Filter className="mr-1.5 h-3.5 w-3.5" />
          Filter
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-gray-600 hover:bg-gray-100"
            >
              <List className="mr-1.5 h-3.5 w-3.5" /> Display{" "}
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Group by: Status</DropdownMenuItem>
            <DropdownMenuItem>Sort by: Priority</DropdownMenuItem>
            <DropdownMenuItem>Show completed</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <main className="flex-grow overflow-y-auto p-4">
        <div className="space-y-0">
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
      </main>
    </div>
  );
}
