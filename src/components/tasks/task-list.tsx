import { useState, useMemo } from "react";
import { useTaskStore, TaskStatus, TaskPriority } from "../../store/task-store"; // Removed Task import
import { useAuthStore } from "../../store/auth-store";

interface TaskFilterState {
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
  department: string | "all";
}

const statusLabels: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
  canceled: "Canceled", // Added canceled label
};

const priorityLabels: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const priorityColors: Record<TaskPriority, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusColors: Record<TaskStatus, string> = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
  canceled: "bg-gray-100 text-gray-500", // Added canceled color
};

export default function TaskList() {
  const user = useAuthStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);

  const [filters, setFilters] = useState<TaskFilterState>({
    status: "all",
    priority: "all",
    department: "all",
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (
        user?.role === "employee" &&
        !task.assignedTo.includes(user.username)
      ) {
        return false;
      }

      if (filters.status !== "all" && task.status !== filters.status) {
        return false;
      }

      if (filters.priority !== "all" && task.priority !== filters.priority) {
        return false;
      }

      if (
        filters.department !== "all" &&
        task.department !== filters.department
      ) {
        return false;
      }

      return true;
    });
  }, [tasks, filters, user]);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    updateTask(taskId, { status: newStatus });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 rounded-lg bg-white p-4 shadow">
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({
              ...filters,
              status: e.target.value as TaskStatus | "all",
            })
          }
          className="rounded-md border px-3 py-2"
        >
          <option value="all">All Statuses</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) =>
            setFilters({
              ...filters,
              priority: e.target.value as TaskPriority | "all",
            })
          }
          className="rounded-md border px-3 py-2"
        >
          <option value="all">All Priorities</option>
          {Object.entries(priorityLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="rounded-lg bg-white p-4 shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="mt-1 text-gray-600">{task.description}</p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-sm ${priorityColors[task.priority]}`}
                >
                  {priorityLabels[task.priority]}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-sm ${statusColors[task.status]}`}
                >
                  {statusLabels[task.status]}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <div>
                <span>Department: {task.department}</span>
                <span className="mx-2">•</span>
                <span>
                  Deadline:{" "}
                  {new Date(task.deadline).toLocaleDateString("en-US")}
                </span>
              </div>

              {(user?.role === "supervisor" ||
                task.assignedTo.includes(user?.username ?? "")) && (
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(task.id, e.target.value as TaskStatus)
                  }
                  className="rounded-md border px-2 py-1 text-sm"
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
