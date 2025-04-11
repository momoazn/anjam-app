import { useState } from "react";
import {
  useTaskStore,
  TaskPriority,
  departments,
} from "../../store/task-store";

interface TaskFormProps {
  onClose: () => void;
}

export default function TaskForm({ onClose }: TaskFormProps) {
  const addTask = useTaskStore((state) => state.addTask);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedTo: [] as string[],
    department: departments[0],
    priority: "medium" as TaskPriority,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addTask({
      ...formData,
      status: "todo",
      comments: [],
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Task Title
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          required
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="h-24 w-full rounded-md border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Department
        </label>
        <select
          value={formData.department}
          onChange={(e) =>
            setFormData({ ...formData, department: e.target.value })
          }
          className="w-full rounded-md border px-3 py-2"
        >
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          value={formData.priority}
          onChange={(e) =>
            setFormData({
              ...formData,
              priority: e.target.value as TaskPriority,
            })
          }
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Deadline
        </label>
        <input
          type="date"
          required
          value={formData.deadline}
          onChange={(e) =>
            setFormData({ ...formData, deadline: e.target.value })
          }
          className="w-full rounded-md border px-3 py-2"
          min={new Date().toISOString().split("T")[0]}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Assigned Users
        </label>
        <input
          type="text"
          placeholder="Separate usernames with commas"
          value={formData.assignedTo.join(", ")}
          onChange={(e) =>
            setFormData({
              ...formData,
              assignedTo: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border px-4 py-2 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Create Task
        </button>
      </div>
    </form>
  );
}
