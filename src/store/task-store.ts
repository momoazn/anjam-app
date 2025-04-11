import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string[];
  department: string;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string;
  createdAt: string;
  updatedAt: string;
  comments: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
  }[];
}

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  bulkAssign: (taskIds: string[], userIds: string[]) => void;
}

// Mock departments
export const departments = [
  'مالی',
  'منابع انسانی',
  'فنی',
  'بازاریابی',
  'پشتیبانی',
];

// Create mock tasks
const mockTasks: Task[] = Array.from({ length: 10 }, (_, i) => ({
  id: `task-${i + 1}`,
  title: `وظیفه شماره ${i + 1}`,
  description: `توضیحات مربوط به وظیفه شماره ${i + 1}`,
  assignedTo: [`user-${i % 3 + 1}`],
  department: departments[i % departments.length],
  priority: ['low', 'medium', 'high'][i % 3] as TaskPriority,
  status: ['pending', 'in_progress', 'completed', 'overdue'][i % 4] as TaskStatus,
  deadline: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  comments: [],
}));

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: mockTasks,
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: `task-${state.tasks.length + 1}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),
      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),
      bulkAssign: (taskIds, userIds) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            taskIds.includes(task.id)
              ? {
                  ...task,
                  assignedTo: [...new Set([...task.assignedTo, ...userIds])],
                  updatedAt: new Date().toISOString(),
                }
              : task
          ),
        })),
    }),
    {
      name: 'task-storage',
    }
  )
); 