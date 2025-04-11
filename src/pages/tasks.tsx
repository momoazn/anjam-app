import { useState } from "react";
import TaskForm from "../components/tasks/task-form"; // Changed to default import
import TaskList from "../components/tasks/task-list"; // Changed to default import
import { useAuthStore } from "../store/auth-store";

export default function TasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        {user?.role === "supervisor" && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            New Task
          </button>
        )}
      </div>

      <TaskList />

      {isCreateModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-lg rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Create New Task</h2>
            <TaskForm onClose={() => setIsCreateModalOpen(false)} />
          </div>
        </div>
      )}
      {/* Task List is already rendered above, removing duplicate */}
    </div>
  );
}
