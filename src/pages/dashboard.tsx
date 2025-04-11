import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, UserRole } from "../store/auth-store";
import { TaskPriority, TaskStatus, useTaskStore } from "../store/task-store";

const statusLabels: Record<TaskStatus, string> = {
  pending: "در انتظار",
  in_progress: "در حال انجام",
  completed: "تکمیل شده",
  overdue: "تاخیر دار",
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "کم",
  medium: "متوسط",
  high: "زیاد",
};

const statusColors: Record<TaskStatus, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

const userRoles: Record<UserRole, string> = {
  employee: "کارمند",
  supervisor: "مدیر",
  admin: "مدیر سیستم",
};

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

  const taskStats = useMemo(() => {
    const stats = {
      total: userTasks.length,
      pending: 0,
      in_progress: 0,
      completed: 0,
      overdue: 0,
      high_priority: 0,
    };

    userTasks.forEach((task) => {
      stats[task.status]++;
      if (task.priority === "high") {
        stats.high_priority++;
      }
    });

    return stats;
  }, [userTasks]);

  const recentTasks = useMemo(() => {
    return [...userTasks]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .slice(0, 5);
  }, [userTasks]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            سامانه مدیریت وظایف
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
              خروج
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">کل وظایف</h3>
              <p className="mt-1 text-2xl font-semibold">{taskStats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">در انتظار</h3>
              <p className="mt-1 text-2xl font-semibold text-yellow-600">
                {taskStats.pending}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">
                در حال انجام
              </h3>
              <p className="mt-1 text-2xl font-semibold text-blue-600">
                {taskStats.in_progress}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">تکمیل شده</h3>
              <p className="mt-1 text-2xl font-semibold text-green-600">
                {taskStats.completed}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500">اولویت بالا</h3>
              <p className="mt-1 text-2xl font-semibold text-red-600">
                {taskStats.high_priority}
              </p>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">وظایف اخیر</h2>
              <button
                onClick={() => navigate("/tasks")}
                className="text-blue-600 hover:text-blue-800"
              >
                مشاهده همه
              </button>
            </div>
            <div className="divide-y">
              {recentTasks.map((task) => (
                <div key={task.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {task.description}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        statusColors[task.status]
                      }`}
                    >
                      {statusLabels[task.status]}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>
                      مهلت:{" "}
                      {new Date(task.deadline).toLocaleDateString("fa-IR")}
                    </span>
                    <span className="mx-2">•</span>
                    <span>دپارتمان: {task.department}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Role-specific Actions */}
          {user?.role === "supervisor" && (
            <div className="mt-8 bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">اقدامات سریع</h2>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate("/tasks")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  ایجاد وظیفه جدید
                </button>
                <button
                  onClick={() => navigate("/tasks")}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  مدیریت وظایف
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
