import {
  Icon,
  IconAntennaBars2,
  IconAntennaBars3,
  IconAntennaBars4,
  IconAntennaBars5,
  IconCircle,
  IconCircleCheck,
  IconCircleHalf2,
  IconCircleX,
} from "@tabler/icons-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import mockTasks from "@/data/tasks.json";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "canceled";

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedUser: string;
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
}

export const priorityColors: Record<TaskPriority, string> = {
  low: "text-green-500",
  medium: "text-yellow-500",
  high: "text-orange-500",
  urgent: "text-red-500",
};

export const priorityIcons: Record<TaskPriority, Icon> = {
  low: IconAntennaBars2,
  medium: IconAntennaBars3,
  high: IconAntennaBars4,
  urgent: IconAntennaBars5,
};

export const statusLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
  canceled: "Canceled",
};

export const taskStatusBgColors: Record<TaskStatus, string> = {
  todo: "bg-slate-50",
  in_progress: "bg-yellow-50",
  done: "bg-purple-50",
  canceled: "bg-gray-100",
};

export const taskStatusColors: Record<TaskStatus, string> = {
  todo: "text-gray-400",
  in_progress: "text-yellow-500",
  done: "text-purple-600",
  canceled: "text-gray-500",
};

export const taskStatusIcons: Record<TaskStatus, Icon> = {
  todo: IconCircle,
  in_progress: IconCircleHalf2,
  done: IconCircleCheck,
  canceled: IconCircleX,
};

export const statusOrder: TaskStatus[] = [
  "todo",
  "in_progress",
  "done",
  "canceled",
];

// Mock departments
export const departments = [
  "Finance",
  "Human Resources",
  "Technical",
  "Marketing",
  "Support",
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: mockTasks as Task[],
      addTask: (task) =>
        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: `TSK-${state.tasks.length + 1}`,
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
    }),
    {
      name: "task-storage",
    },
  ),
);
