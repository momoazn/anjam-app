import { TaskWithProject } from "@/lib/pocketbase";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
  UsersResponse,
} from "@/lib/pocketbase-types"; // Removed unused TasksResponse
import { useUsers } from "@/pb-hooks";
import { useMemo, useState } from "react";

export const ALL_FILTER_VALUE = "all"; // Export for use in components

// Define the shape of the filters state
export interface TaskFiltersState {
  searchTerm: string;
  selectedStatus: TasksStatusOptions | typeof ALL_FILTER_VALUE;
  selectedPriority: TasksPriorityOptions | typeof ALL_FILTER_VALUE;
  selectedAssignee: string | typeof ALL_FILTER_VALUE;
}

// Define the return type of the hook
export interface UseTaskFiltersReturn extends TaskFiltersState {
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setSelectedStatus: React.Dispatch<
    React.SetStateAction<TasksStatusOptions | typeof ALL_FILTER_VALUE>
  >;
  setSelectedPriority: React.Dispatch<
    React.SetStateAction<TasksPriorityOptions | typeof ALL_FILTER_VALUE>
  >;
  setSelectedAssignee: React.Dispatch<
    React.SetStateAction<string | typeof ALL_FILTER_VALUE>
  >;
  filteredTasks: TaskWithProject[]; // Or TasksResponse based on input? Let's stick with TaskWithProject for now
  users: UsersResponse[] | undefined;
  isLoadingUsers: boolean;
}

// The custom hook
export function useTaskFilters(
  tasks: TaskWithProject[] | undefined, // Accept the raw task list
): UseTaskFiltersReturn {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    TasksStatusOptions | typeof ALL_FILTER_VALUE
  >(ALL_FILTER_VALUE);
  const [selectedPriority, setSelectedPriority] = useState<
    TasksPriorityOptions | typeof ALL_FILTER_VALUE
  >(ALL_FILTER_VALUE);
  const [selectedAssignee, setSelectedAssignee] = useState<
    string | typeof ALL_FILTER_VALUE
  >(ALL_FILTER_VALUE);

  const { data: users, isPending: isLoadingUsers } = useUsers(); // Fetch users within the hook

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    return tasks.filter((task) => {
      // Search logic
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.expand?.assignee as UsersResponse)?.username
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      // Filter logic
      const matchesStatus =
        selectedStatus === ALL_FILTER_VALUE
          ? true
          : task.status === selectedStatus;
      const matchesPriority =
        selectedPriority === ALL_FILTER_VALUE
          ? true
          : task.priority === selectedPriority;
      const matchesAssignee =
        selectedAssignee === ALL_FILTER_VALUE
          ? true
          : task.assignee === selectedAssignee;

      return (
        matchesSearch && matchesStatus && matchesPriority && matchesAssignee
      );
    });
  }, [tasks, searchTerm, selectedStatus, selectedPriority, selectedAssignee]);

  return {
    searchTerm,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    setSearchTerm,
    setSelectedStatus,
    setSelectedPriority,
    setSelectedAssignee,
    filteredTasks,
    users,
    isLoadingUsers,
  };
}
