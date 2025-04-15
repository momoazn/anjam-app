// src/components/task/task-filters.tsx
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEXT } from "@/constants/text";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
} from "@/lib/pocketbase-types"; // Removed unused UsersResponse
import { statusOrder } from "@/lib/tasks-utils";
import {
  ALL_FILTER_VALUE,
  UseTaskFiltersReturn,
} from "@/hooks/use-task-filters"; // Import hook return type and constant

// Define priority order here or import from a central place if needed elsewhere
const priorityOrder: TasksPriorityOptions[] = [
  TasksPriorityOptions.low,
  TasksPriorityOptions.medium,
  TasksPriorityOptions.high,
  TasksPriorityOptions.urgent,
];

// Define props based on the hook's return type, excluding filteredTasks
type TaskFiltersProps = Omit<UseTaskFiltersReturn, "filteredTasks">;

export function TaskFilters({
  searchTerm,
  selectedStatus,
  selectedPriority,
  selectedAssignee,
  setSearchTerm,
  setSelectedStatus,
  setSelectedPriority,
  setSelectedAssignee,
  users,
  isLoadingUsers,
}: TaskFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-4 px-3">
      <Input
        placeholder={"جستجو بر اساس عنوان یا مسئول تسک..."} // Fallback
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-xs flex-grow sm:flex-grow-0"
      />
      <Select
        value={selectedStatus}
        onValueChange={(value) =>
          setSelectedStatus(
            value as TasksStatusOptions | typeof ALL_FILTER_VALUE,
          )
        }
      >
        <SelectTrigger className="w-auto min-w-[150px]">
          <SelectValue placeholder={"فیلتر بر اساس وضعیت"} /> {/* Fallback */}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_FILTER_VALUE}>{"همه وضعیت‌ها"}</SelectItem>{" "}
          {/* Fallback */}
          {statusOrder.map((status) => (
            <SelectItem key={status} value={status}>
              {TEXT.tasks.status[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedPriority}
        onValueChange={(value) =>
          setSelectedPriority(
            value as TasksPriorityOptions | typeof ALL_FILTER_VALUE,
          )
        }
      >
        <SelectTrigger className="w-auto min-w-[150px]">
          <SelectValue placeholder={"فیلتر بر اساس اولویت"} /> {/* Fallback */}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_FILTER_VALUE}>{"همه اولویت‌ها"}</SelectItem>{" "}
          {/* Fallback */}
          {priorityOrder.map((priority) => (
            <SelectItem key={priority} value={priority}>
              {TEXT.tasks.priority[priority]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedAssignee}
        onValueChange={(value) =>
          setSelectedAssignee(value as string | typeof ALL_FILTER_VALUE)
        }
        disabled={isLoadingUsers}
      >
        <SelectTrigger className="w-auto min-w-[150px]">
          <SelectValue placeholder={"فیلتر بر اساس مسئول"} /> {/* Fallback */}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_FILTER_VALUE}>{"همه مسئولین"}</SelectItem>{" "}
          {/* Fallback */}
          {users?.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {`${user.first_name || ""} ${user.last_name || ""} (${user.username})`.trim()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {/* TODO: Consider adding a "Clear Filters" button here */}
    </div>
  );
}
