import { useState, useMemo } from 'react';
import { useTaskStore, Task, TaskStatus, TaskPriority } from '../../store/task-store';
import { useAuthStore } from '../../store/auth-store';

interface TaskFilterState {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  department: string | 'all';
}

const statusLabels: Record<TaskStatus, string> = {
  pending: 'در انتظار',
  in_progress: 'در حال انجام',
  completed: 'تکمیل شده',
  overdue: 'تاخیر دار',
};

const priorityLabels: Record<TaskPriority, string> = {
  low: 'کم',
  medium: 'متوسط',
  high: 'زیاد',
};

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const statusColors: Record<TaskStatus, string> = {
  pending: 'bg-gray-100 text-gray-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
};

export default function TaskList() {
  const user = useAuthStore((state) => state.user);
  const tasks = useTaskStore((state) => state.tasks);
  const updateTask = useTaskStore((state) => state.updateTask);

  const [filters, setFilters] = useState<TaskFilterState>({
    status: 'all',
    priority: 'all',
    department: 'all',
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (user?.role === 'employee' && !task.assignedTo.includes(user.username)) {
        return false;
      }

      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }

      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      if (filters.department !== 'all' && task.department !== filters.department) {
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
      <div className="flex gap-4 p-4 bg-white rounded-lg shadow">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value as TaskStatus | 'all' })}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">همه وضعیت‌ها</option>
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value as TaskPriority | 'all' })}
          className="px-3 py-2 border rounded-md"
        >
          <option value="all">همه اولویت‌ها</option>
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
          <div key={task.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <p className="text-gray-600 mt-1">{task.description}</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-sm ${priorityColors[task.priority]}`}>
                  {priorityLabels[task.priority]}
                </span>
                <span className={`px-2 py-1 rounded-full text-sm ${statusColors[task.status]}`}>
                  {statusLabels[task.status]}
                </span>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
              <div>
                <span>دپارتمان: {task.department}</span>
                <span className="mx-2">•</span>
                <span>مهلت: {new Date(task.deadline).toLocaleDateString('fa-IR')}</span>
              </div>
              
              {(user?.role === 'supervisor' || task.assignedTo.includes(user?.username ?? '')) && (
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                  className="px-2 py-1 border rounded-md text-sm"
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