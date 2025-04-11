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
  const possibleTags = ["Bug", "Feature", "Improvement"];

  const taskIndex = i + 1;
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() + (i - 7));

  let currentStatus = statusOptions[i % statusOptions.length];
  let currentTags = Array.from(
    { length: Math.floor(Math.random() * 2) + 1 },
    () => possibleTags[Math.floor(Math.random() * possibleTags.length)]
  );
  let title = `Sample Task ${taskIndex}`;

  if (taskIndex === 12) {
    title = "Another test";
    currentStatus = "in_progress";
    currentTags = ["Bug", "Feature"];
  }
  if (taskIndex === 11) {
    title = "Testttt";
    currentStatus = "pending";
    currentTags = ["Bug"];
  }
  if (taskIndex === 10) {
    title = "Test";
    currentStatus = "pending";
    currentTags = ["Bug"];
  }
  if (taskIndex === 13) {
    title = "Another one yet";
    currentStatus = "completed";
    currentTags = ["Bug", "Feature"];
  }
  if (taskIndex === 14) {
    title = "Just testing things out";
    currentStatus = "canceled";
    currentTags = ["Bug", "Feature", "Improvement"];
  }
  if (taskIndex === 1) {
    title = "Welcome to Linear 👋";
    currentStatus = "canceled";
    currentTags = ["Feature"];
  }
  if (taskIndex === 2) {
    title = "Try 3 ways to navigate Linear: Command line, keyboard or mouse";
    currentStatus = "canceled";
    currentTags = [];
  }

  return {
    id: `TSK-${taskIndex}`,
    title: title,
    description: `This is the description for task TSK-${taskIndex}.`,
    assignedTo: [`user-${(i % 3) + 1}`],
    department: departments[i % departments.length],
    priority: priorityOptions[i % priorityOptions.length],
    status: currentStatus,
    deadline: deadlineDate.toISOString(),
    createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(
      Date.now() - (i % 5) * 12 * 60 * 60 * 1000
    ).toISOString(),
    tags: [...new Set(currentTags)],
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
      name: "task-storage",
    }
  )
);
