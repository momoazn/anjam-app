import { create } from "zustand";
import { persist } from "zustand/middleware";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "overdue"
  | "canceled";

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
  tags?: string[];
  comments: {
    id: string;
    userId: string;
    content: string;
    createdAt: string;
  }[];
}

interface TaskState {
  tasks: Task[];
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  bulkAssign: (taskIds: string[], userIds: string[]) => void;
}

// Mock departments
export const departments = [
  "Finance",
  "Human Resources",
  "Technical",
  "Marketing",
  "Support",
];

// Create mock tasks
const mockTasks: Task[] = Array.from({ length: 15 }, (_, i) => {
  const statusOptions: TaskStatus[] = [
    "pending",
    "in_progress",
    "completed",
    "overdue",
    "canceled",
  ];
  const priorityOptions: TaskPriority[] = ["low", "medium", "high"];
  const possibleTags = ["Bug", "Feature", "Improvement", "Question"];

  return {
    id: `TSK-${i + 1}`,
    title: `Sample Task ${i + 1}`,
    description: `This is the description for task number ${i + 1}.`,
    assignedTo: [`user-${(i % 3) + 1}`],
    department: departments[i % departments.length],
    priority: priorityOptions[i % priorityOptions.length],
    status: statusOptions[i % statusOptions.length],
    deadline: new Date(
      Date.now() + (i - 5) * 24 * 60 * 60 * 1000,
    ).toISOString(),
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(
      Date.now() - (i % 5) * 12 * 60 * 60 * 1000,
    ).toISOString(),
    tags: Array.from(
      { length: Math.floor(Math.random() * 3) },
      () => possibleTags[Math.floor(Math.random() * possibleTags.length)],
    ),
    comments: [],
  };
});

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
              : task,
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
              : task,
          ),
        })),
    }),
    {
      name: "task-storage",
    },
  ),
);
