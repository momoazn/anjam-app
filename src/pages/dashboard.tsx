import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, UserRole } from "../store/auth-store";
import { Task, TaskStatus, useTaskStore } from "../store/task-store"; // Removed TaskPriority
import { TaskListGroup } from "../components/task/task-list-group";
import { TaskListItem } from "../components/task/task-list-item";

const statusLabels: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
  canceled: "Canceled",
};

const userRoles: Record<UserRole, string> = {
  employee: "Employee",
  supervisor: "Supervisor",
  admin: "Admin",
};

// Define the order of statuses for display
const statusOrder: TaskStatus[] = [
  "in_progress",
  "pending",
  "completed",
  "canceled",
  "overdue",
];

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const tasks = useTaskStore((state) => state.tasks);

  const userTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (user?.role === "employee") {
        return task.assignedTo.includes(user.username);
      }
      return true;
    });
  }, [tasks, user]);

  // Group tasks by status
  const groupedTasks = useMemo(() => {
    return userTasks.reduce(
      (acc, task) => {
        (acc[task.status] = acc[task.status] || []).push(task);
        return acc;
      },
      {} as Record<TaskStatus, Task[]>,
    );
  }, [userTasks]);

  const taskStats = useMemo(() => {
    const stats = {
      total: userTasks.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
      overdue: 0,
      canceled: 0, // Add canceled status
      high_priority: 0,
    };

    userTasks.forEach((task) => {
      if (task.status in stats) {
        // Check if status exists before incrementing
        stats[task.status as keyof typeof stats]++; // Type assertion needed here
      }
      if (task.priority === "high") {
        stats.high_priority++;
      }
    });

    return stats;
  }, [userTasks]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Task Management System
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{user?.username}</span>
            <span className="text-gray-700">•</span>
            <span className="text-gray-700">
              {userRoles[user?.role as UserRole]}
            </span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
              <p className="mt-1 text-2xl font-semibold">{taskStats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="mt-1 text-2xl font-semibold text-yellow-600">
                {taskStats.pending}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
              <p className="mt-1 text-2xl font-semibold text-blue-600">
                {taskStats.in_progress}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="mt-1 text-2xl font-semibold text-green-600">
                {taskStats.completed}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">
                High Priority
              </h3>
              <p className="mt-1 text-2xl font-semibold text-red-600">
                {taskStats.high_priority}
              </p>
            </div>
          </div>

          {/* NEW Task List Section */}
          <div className="mt-8">
            {statusOrder.map((status) => {
              const tasksInGroup = groupedTasks[status] || [];
              if (tasksInGroup.length === 0) return null; // Don't render empty groups

              return (
                <TaskListGroup
                  key={status}
                  statusTitle={statusLabels[status]}
                  tasks={tasksInGroup}
                >
                  {tasksInGroup.map((task) => (
                    <TaskListItem key={task.id} task={task} />
                  ))}
                </TaskListGroup>
              );
            })}
          </div>

          {/* Role-specific Actions */}
          {user?.role === "supervisor" && (
            <div className="mt-8 bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/tasks")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create New Task
                </button>
                <button
                  onClick={() => navigate("/tasks")}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Manage Tasks
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
