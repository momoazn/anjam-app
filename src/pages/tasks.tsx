import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskListGroup } from "@/components/task/task-list-group";
import { TEXT } from "@/constants/text";
import { TaskWithProject } from "@/lib/pocketbase";
import {
  TasksPriorityOptions,
  TasksStatusOptions,
  UsersResponse,
} from "@/lib/pocketbase-types"; // Added Priority & UsersResponse
import { statusOrder } from "@/lib/tasks-utils";
import { useTasks, useUsers } from "@/pb-hooks"; // Added useUsers
import { useMemo, useState } from "react";

// Assuming priority order/values - replace if defined elsewhere
const priorityOrder: TasksPriorityOptions[] = [
  // TODO: Get this from types or constants if available
  TasksPriorityOptions.low,
  TasksPriorityOptions.medium,
  TasksPriorityOptions.high,
];

export default function Tasks() {
  const [searchTerm, setSearchTerm] = useState("");
  const ALL_FILTER_VALUE = "all"; // Define a constant for the "all" value
  const [selectedStatus, setSelectedStatus] = useState<
    TasksStatusOptions | typeof ALL_FILTER_VALUE
  >(ALL_FILTER_VALUE);
  const [selectedPriority, setSelectedPriority] = useState<
    TasksPriorityOptions | typeof ALL_FILTER_VALUE
  >(ALL_FILTER_VALUE);
  const [selectedAssignee, setSelectedAssignee] = useState<
    string | typeof ALL_FILTER_VALUE
  >(ALL_FILTER_VALUE); // Use string | "all"
  // Removed duplicate state declarations
  const { data: userTasks, isPending: isLoadingTasks } = useTasks(
    undefined,
    "project,assignee", // Expand project and assignee
  );
  const { data: users, isPending: isLoadingUsers } = useUsers(); // Fetch users

  const filteredTasks = useMemo(() => {
    if (!userTasks) return [];
    return userTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) || // Corrected: Use 'title' instead of 'name'
        (task.expand?.assignee as UsersResponse)?.username // Type assertion for expanded assignee
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
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
  }, [
    userTasks,
    searchTerm,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
  ]); // Added selectedAssignee dependency

  const groupedTasks = useMemo(() => {
    // Prevent grouping during load state to avoid brief flash of unfiltered/empty groups
    if (isLoadingTasks || !filteredTasks) {
      return {} as Record<TasksStatusOptions, TaskWithProject[]>;
    }
    return filteredTasks.reduce(
      (acc, task) => {
        (acc[task.status] = acc[task.status] || []).push(task);
        return acc;
      },
      {} as Record<TasksStatusOptions, TaskWithProject[]>,
    );
  }, [filteredTasks, isLoadingTasks]);

  return (
    <div className="bg-card text-foreground mt-4 flex flex-col space-y-4 pb-8">
      <h1 className="ps-3 text-2xl font-bold">{TEXT.tasks.allTasks}</h1>

      {/* Search and Filter Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-4 px-3">
        <Input
          placeholder={"جستجو بر اساس عنوان یا مسئول تسک..."} // Fallback: Key not found
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          // Removed duplicate attributes
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
            {/* Adjusted width */}
            <SelectValue placeholder={"فیلتر بر اساس وضعیت"} />{" "}
            {/* Fallback: Key not found */}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>{"همه وضعیت‌ها"}</SelectItem>{" "}
            {/* Use "all" value */}
            {statusOrder.map((status) => (
              <SelectItem key={status} value={status}>
                {TEXT.tasks.status[status]} {/* Use TEXT */}
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
            {" "}
            {/* Adjusted width */}
            <SelectValue placeholder={"فیلتر بر اساس اولویت"} />{" "}
            {/* Fallback: Key not found */}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>{"همه اولویت‌ها"}</SelectItem>{" "}
            {/* Use "all" value */}
            {priorityOrder.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {TEXT.tasks.priority[priority]} {/* Use TEXT */}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedAssignee}
          onValueChange={(value) =>
            setSelectedAssignee(value as string | typeof ALL_FILTER_VALUE)
          }
          disabled={isLoadingUsers} // Disable while users load
        >
          <SelectTrigger className="w-auto min-w-[150px]">
            <SelectValue placeholder={"فیلتر بر اساس مسئول"} />{" "}
            {/* Fallback: Key not found */}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FILTER_VALUE}>{"همه مسئولین"}</SelectItem>{" "}
            {/* Use "all" value */}
            {users?.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {/* Display format: First Last (Username) */}
                {`${user.first_name || ""} ${user.last_name || ""} (${user.username})`.trim()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* TODO: Consider adding a "Clear Filters" button */}
      </div>

      {/* Task List */}
      {isLoadingTasks && ( // Correct syntax for conditional rendering
        <p className="text-muted-foreground px-3">
          {"در حال بارگذاری تسک‌ها..."}
        </p>
      )}
      {!isLoadingTasks &&
        filteredTasks.length === 0 && ( // Correct syntax for conditional rendering
          <p className="text-muted-foreground px-3">
            {"هیچ تسکی با فیلترهای فعلی مطابقت ندارد."}
          </p>
        )}
      {!isLoadingTasks &&
        filteredTasks.length > 0 &&
        statusOrder?.map((status) => {
          const tasksInGroup = groupedTasks?.[status] ?? [];

          // Only render the group if it contains tasks after filtering
          if (tasksInGroup.length === 0) {
            return null;
          }

          return (
            <TaskListGroup
              key={status}
              taskCount={tasksInGroup.length}
              status={status as TasksStatusOptions}
              tasks={tasksInGroup}
              showProject={true} // Keep showing project for the main tasks page
            />
          );
        })}
    </div>
  );
}
