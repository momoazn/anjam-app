import { useState } from 'react';
import { useAuthStore } from '../store/auth-store';
import TaskList from '../components/tasks/task-list';
import TaskForm from '../components/tasks/task-form';

export default function TasksPage() {
  const user = useAuthStore((state) => state.user);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-4 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">مدیریت وظایف</h1>
          {user?.role === 'supervisor' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              وظیفه جدید
            </button>
          )}
        </div>

        {/* Task Creation Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
              <h2 className="text-xl font-semibold mb-4">ایجاد وظیفه جدید</h2>
              <TaskForm onClose={() => setIsCreateModalOpen(false)} />
            </div>
          </div>
        )}

        {/* Task List */}
        <TaskList />
      </div>
    </div>
  );
} 