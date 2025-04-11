import { Task } from '../../store/task-store';
import { Badge } from '../ui/badge'; // Assuming badge is installed here

interface TaskListItemProps {
  task: Task;
}

// Helper to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fa-IR', {
    month: 'short',
    day: 'numeric',
  });
};

export function TaskListItem({ task }: TaskListItemProps) {
  // TODO: Add icon based on task type/priority?
  // TODO: Add assignee avatar

  return (
    <div className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 rounded transition-colors duration-150 cursor-pointer">
      <div className="flex items-center min-w-0">
        {/* Placeholder for status/priority icon */}
        <div className="w-4 h-4 bg-gray-300 rounded-full mr-3"></div>
        <span className="text-sm text-gray-500 mr-2 flex-shrink-0">{task.id}</span>
        <span className="text-sm text-gray-800 truncate mr-3" title={task.title}>
          {task.title}
        </span>
      </div>
      <div className="flex items-center flex-shrink-0">
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center mr-3 space-x-1 space-x-reverse">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="px-1.5 py-0.5 text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {/* Placeholder for assignee */}
        <div className="w-5 h-5 bg-gray-400 rounded-full mr-3"></div>
        <span className="text-xs text-gray-500">
          {formatDate(task.updatedAt)}
        </span>
      </div>
    </div>
  );
} 