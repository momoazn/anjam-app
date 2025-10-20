import { Button } from "@/components/ui/button";
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
  selectedDateRange,
  selectedTag,
  setSearchTerm,
  setSelectedStatus,
  setSelectedPriority,
  setSelectedAssignee,
  setSelectedDateRange,
  setSelectedTag,
  users,
  isLoadingUsers,
}: TaskFiltersProps) {
  return (
    <div className="mb-4 space-y-3 px-3 md:space-y-4">
      {/* Main filters row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <Input
          placeholder={"جستجو بر اساس عنوان یا مسئول تسک..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-full flex-grow sm:max-w-xs sm:flex-grow-0"
        />
        <div className="flex flex-wrap gap-2 sm:gap-4">
          <Select
            value={selectedStatus}
            onValueChange={(value) =>
              setSelectedStatus(
                value as TasksStatusOptions | typeof ALL_FILTER_VALUE,
              )
            }
          >
            <SelectTrigger className="w-full min-w-[140px] sm:w-auto sm:min-w-[150px]">
              <SelectValue placeholder={"فیلتر بر اساس وضعیت"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUE}>{"همه وضعیت‌ها"}</SelectItem>
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
            <SelectTrigger className="w-full min-w-[140px] sm:w-auto sm:min-w-[150px]">
              <SelectValue placeholder={"فیلتر بر اساس اولویت"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUE}>
                {"همه اولویت‌ها"}
              </SelectItem>
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
            <SelectTrigger className="w-full min-w-[140px] sm:w-auto sm:min-w-[150px]">
              <SelectValue placeholder={"فیلتر بر اساس مسئول"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUE}>{"همه مسئولین"}</SelectItem>
              {users?.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {`${user.first_name || ""} ${user.last_name || ""} (${user.username})`.trim()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Advanced filters row */}
      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <span className="text-muted-foreground text-xs sm:text-sm">
          فیلترهای پیشرفته:
        </span>

        {/* Date range filter */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs sm:text-sm">
            تاریخ:
          </span>
          <Select
            value={selectedDateRange}
            onValueChange={setSelectedDateRange}
          >
            <SelectTrigger className="w-full min-w-[120px] sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه تاریخ‌ها</SelectItem>
              <SelectItem value="today">امروز</SelectItem>
              <SelectItem value="week">این هفته</SelectItem>
              <SelectItem value="month">این ماه</SelectItem>
              <SelectItem value="overdue">گذشته‌موعد</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags filter */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs sm:text-sm">
            برچسب‌ها:
          </span>
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full min-w-[120px] sm:w-auto">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه برچسب‌ها</SelectItem>
              <SelectItem value="اشکال">اشکال</SelectItem>
              <SelectItem value="ویژگی">ویژگی</SelectItem>
              <SelectItem value="بهبود">بهبود</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear filters button */}
        {(searchTerm ||
          selectedStatus !== ALL_FILTER_VALUE ||
          selectedPriority !== ALL_FILTER_VALUE ||
          selectedAssignee !== ALL_FILTER_VALUE ||
          selectedDateRange !== "all" ||
          selectedTag !== "all") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedStatus(ALL_FILTER_VALUE);
              setSelectedPriority(ALL_FILTER_VALUE);
              setSelectedAssignee(ALL_FILTER_VALUE);
              setSelectedDateRange("all");
              setSelectedTag("all");
            }}
            className="w-full gap-2 sm:w-auto"
          >
            پاک کردن فیلترها
          </Button>
        )}
      </div>
    </div>
  );
}
