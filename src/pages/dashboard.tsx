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
    return userTasks.reduce((acc, task) => {
      (acc[task.status] = acc[task.status] || []).push(task);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
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
    <div className="flex flex-col h-screen bg-white text-gray-900">
      <header className="border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-0 bg-white z-10">
        <Tabs defaultValue="all" className="flex-grow">
          <TabsList className="bg-transparent p-0 space-x-1">
            <TabsTrigger
              value="all"
              className="text-sm font-medium px-3 py-1.5 rounded-md data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              All Issues
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="text-sm font-medium px-3 py-1.5 rounded-md data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>{" "}
              Active
            </TabsTrigger>
            <TabsTrigger
              value="backlog"
              className="text-sm font-medium px-3 py-1.5 rounded-md data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <div className="w-2 h-2 border border-gray-400 rounded-full mr-2"></div>{" "}
              Backlog
            </TabsTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              <ClipboardList className="w-4 h-4" />
            </Button>
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
          >
            <Bell className="w-4 h-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="w-6 h-6 cursor-pointer">
                <AvatarImage
                  src={`https://avatar.vercel.sh/${user?.username}.png`}
                />
                <AvatarFallback className="text-xs bg-gray-200">
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

      <div className="border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-[57px] bg-white z-10">
        <Button
          variant="ghost"
          size="sm"
          className="text-sm text-gray-600 hover:bg-gray-100"
        >
          <Filter className="w-3.5 h-3.5 mr-1.5" />
          Filter
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm text-gray-600 hover:bg-gray-100"
            >
              <List className="w-3.5 h-3.5 mr-1.5" /> Display{" "}
              <ChevronDown className="w-3.5 h-3.5 ml-1" />
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
