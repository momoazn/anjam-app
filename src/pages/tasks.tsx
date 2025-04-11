import { useState } from "react";
import TaskForm from "../components/tasks/task-form"; // Changed to default import
import TaskList from "../components/tasks/task-list"; // Changed to default import
import { useAuthStore } from "../store/auth-store";

export default function TasksPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
        {user?.role === "supervisor" && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            New Task
          </button>
        )}
      </div>

      <TaskList />

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
            <TaskForm onClose={() => setIsCreateModalOpen(false)} />
          </div>
        </div>
      )}
      {/* Task List is already rendered above, removing duplicate */}
    </div>
  );
}
