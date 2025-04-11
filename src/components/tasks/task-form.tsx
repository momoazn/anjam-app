import { useState } from 'react';
import { useTaskStore, TaskPriority, departments } from '../../store/task-store';

interface TaskFormProps {
  onClose: () => void;
}

export default function TaskForm({ onClose }: TaskFormProps) {
  const addTask = useTaskStore((state) => state.addTask);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: [] as string[],
    department: departments[0],
    priority: 'medium' as TaskPriority,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addTask({
      ...formData,
      status: 'pending',
      comments: [],
    });
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          عنوان وظیفه
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          توضیحات
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-md h-24"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          دپارتمان
        </label>
        <select
          value={formData.department}
          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          اولویت
        </label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="low">کم</option>
          <option value="medium">متوسط</option>
          <option value="high">زیاد</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          مهلت انجام
        </label>
        <input
          type="date"
          required
          value={formData.deadline}
          onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          کاربران مسئول
        </label>
        <input
          type="text"
          placeholder="نام کاربری‌ها را با کاما جدا کنید"
          value={formData.assignedTo.join(', ')}
          onChange={(e) => setFormData({
            ...formData,
            assignedTo: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
          })}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
        >
          انصراف
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          ایجاد وظیفه
        </button>
      </div>
    </form>
  );
} 