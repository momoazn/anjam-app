import React from 'react';
import { Task } from '../../store/task-store';

interface TaskListGroupProps {
  statusTitle: string;
  tasks: Task[];
  children: React.ReactNode; // To render TaskListItems
}

export function TaskListGroup({ statusTitle, tasks, children }: TaskListGroupProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center mb-3 px-1">
        {/* TODO: Add icon based on status */}
        <h2 className="text-sm font-medium text-gray-600 ml-2">{statusTitle}</h2>
        <span className="text-sm text-gray-400">{tasks.length}</span>
        {/* TODO: Add group actions button (+) */}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
} 