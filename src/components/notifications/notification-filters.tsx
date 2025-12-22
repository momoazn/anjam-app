import { digitsEnToFa } from "@persian-tools/persian-tools";
import { IconSortAscending } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notifications as notificationsText } from "@/constants";

export type NotificationFilter = "all" | "unread" | "read";
export type NotificationSort = "newest" | "oldest";

type NotificationFiltersProps = {
  filter: NotificationFilter;
  sort: NotificationSort;
  selectedIds: string[];
  onFilterChange: (value: NotificationFilter) => void;
  onSortChange: (value: NotificationSort) => void;
  onBulkMarkRead: () => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  isBulkDeletePending: boolean;
};

export function NotificationFilters({
  filter,
  sort,
  selectedIds,
  onFilterChange,
  onSortChange,
  onBulkMarkRead,
  onBulkDelete,
  onClearSelection,
  isBulkDeletePending,
}: NotificationFiltersProps) {
  return (
    <div
      className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      data-animate-stagger
    >
      {selectedIds.length > 0 ? (
        <div className="bg-muted flex flex-wrap items-center gap-2 rounded-lg p-2">
          <span className="text-sm font-medium">
            {digitsEnToFa(selectedIds.length)} {notificationsText.selected}
          </span>
          <Button size="sm" variant="outline" onClick={onBulkMarkRead}>
            {notificationsText.actions.markAsRead}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={onBulkDelete}
            disabled={isBulkDeletePending}
          >
            {notificationsText.actions.delete}
          </Button>
          <Button size="sm" variant="ghost" onClick={onClearSelection}>
            {notificationsText.deselectAll}
          </Button>
        </div>
      ) : (
        <Tabs
          value={filter}
          onValueChange={(value) => onFilterChange(value as NotificationFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">
              {notificationsText.filters.all}
            </TabsTrigger>
            <TabsTrigger value="unread">
              {notificationsText.filters.unread}
            </TabsTrigger>
            <TabsTrigger value="read">
              {notificationsText.filters.read}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <IconSortAscending className="ml-1 h-4 w-4" />
            {notificationsText.sort[sort]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onSortChange("newest")}>
            {notificationsText.sort.newest}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onSortChange("oldest")}>
            {notificationsText.sort.oldest}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
