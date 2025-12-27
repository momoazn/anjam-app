import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconSortAscending,
  IconCheck,
  IconTrash,
  IconX,
} from "@tabler/icons-react";

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
      className="border-border mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between"
      data-animate-stagger
    >
      {selectedIds.length > 0 ? (
        <div className="bg-primary/5 border-primary/20 flex flex-wrap items-center gap-2 rounded-xl border p-1.5">
          <div className="bg-primary text-primary-foreground rounded-lg px-3 py-1 text-xs font-bold">
            {digitsEnToFa(selectedIds.length)} {notificationsText.selected}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onBulkMarkRead}
            className="h-8 rounded-md text-xs font-bold"
          >
            <IconCheck className="ms-1.5 size-3.5" />
            {notificationsText.actions.markAsRead}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onBulkDelete}
            disabled={isBulkDeletePending}
            className="h-8 rounded-md text-xs font-bold text-rose-500 hover:bg-rose-500/10"
          >
            <IconTrash className="ms-1.5 size-3.5" />
            {notificationsText.actions.delete}
          </Button>
          <div className="bg-primary/20 mx-1 h-4 w-px" />
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="h-8 rounded-md text-xs font-bold opacity-60"
          >
            <IconX className="ms-1.5 size-3.5" />
            {notificationsText.deselectAll}
          </Button>
        </div>
      ) : (
        <Tabs
          value={filter}
          onValueChange={(value) => onFilterChange(value as NotificationFilter)}
          className="bg-muted/30 border-border rounded-xl border p-1"
        >
          <TabsList className="h-9 gap-1 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-card h-full rounded-lg border border-transparent text-xs font-bold data-[state=active]:shadow-sm"
            >
              {notificationsText.filters.all}
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="data-[state=active]:bg-card h-full rounded-lg border border-transparent text-xs font-bold data-[state=active]:shadow-sm"
            >
              {notificationsText.filters.unread}
            </TabsTrigger>
            <TabsTrigger
              value="read"
              className="data-[state=active]:bg-card h-full rounded-lg border border-transparent text-xs font-bold data-[state=active]:shadow-sm"
            >
              {notificationsText.filters.read}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="border-border bg-card h-10 rounded-xl border text-xs font-bold shadow-sm"
          >
            <IconSortAscending className="ms-2 size-4" />
            {notificationsText.sort[sort]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-border bg-card rounded-xl border shadow-lg"
        >
          <DropdownMenuItem
            onClick={() => onSortChange("newest")}
            className="rounded-lg p-3 text-xs font-bold"
          >
            {notificationsText.sort.newest}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSortChange("oldest")}
            className="rounded-lg p-3 text-xs font-bold"
          >
            {notificationsText.sort.oldest}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
