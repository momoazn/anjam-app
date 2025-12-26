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
      className="border-border/40 mb-8 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-center sm:justify-between"
      data-animate-stagger
    >
      {selectedIds.length > 0 ? (
        <div className="bg-primary/5 border-primary/20 flex flex-wrap items-center gap-2 rounded-none border p-1.5">
          <div className="bg-primary text-primary-foreground px-3 py-1 text-[10px] font-black tracking-tight uppercase">
            {digitsEnToFa(selectedIds.length)} {notificationsText.selected}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onBulkMarkRead}
            className="hover:bg-primary/10 h-8 rounded-none text-[9px] font-black tracking-tight uppercase"
          >
            <IconCheck className="ms-1.5 size-3.5" />
            {notificationsText.actions.markAsRead}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onBulkDelete}
            disabled={isBulkDeletePending}
            className="h-8 rounded-none text-[9px] font-black tracking-tight text-rose-500 uppercase hover:bg-rose-500/10"
          >
            <IconTrash className="ms-1.5 size-3.5" />
            {notificationsText.actions.delete}
          </Button>
          <div className="bg-primary/20 mx-1 h-4 w-px" />
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
            className="h-8 rounded-none text-[9px] font-black tracking-tight uppercase opacity-60"
          >
            <IconX className="ms-1.5 size-3.5" />
            {notificationsText.deselectAll}
          </Button>
        </div>
      ) : (
        <Tabs
          value={filter}
          onValueChange={(value) => onFilterChange(value as NotificationFilter)}
          className="bg-muted/20 border-border/40 rounded-none border p-1"
        >
          <TabsList className="h-9 gap-1 bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-card data-[state=active]:border-border/40 h-full rounded-none border border-transparent text-[10px] font-black tracking-tight uppercase data-[state=active]:shadow-sm"
            >
              {notificationsText.filters.all}
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="data-[state=active]:bg-card data-[state=active]:border-border/40 h-full rounded-none border border-transparent text-[10px] font-black tracking-tight uppercase data-[state=active]:shadow-sm"
            >
              {notificationsText.filters.unread}
            </TabsTrigger>
            <TabsTrigger
              value="read"
              className="data-[state=active]:bg-card data-[state=active]:border-border/40 h-full rounded-none border border-transparent text-[10px] font-black tracking-tight uppercase data-[state=active]:shadow-sm"
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
            className="border-border bg-card h-10 rounded-none border text-[10px] font-black tracking-tight uppercase shadow-md transition-all active:shadow-none dark:shadow-[-4px_4px_0px_0px_rgba(255,255,255,0.05)]"
          >
            <IconSortAscending className="ms-2 size-4" />
            {notificationsText.sort[sort]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="border-border bg-card rounded-none border"
        >
          <DropdownMenuItem
            onClick={() => onSortChange("newest")}
            className="rounded-none p-3 text-[9px] font-black tracking-tight uppercase"
          >
            {notificationsText.sort.newest}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSortChange("oldest")}
            className="rounded-none p-3 text-[9px] font-black tracking-tight uppercase"
          >
            {notificationsText.sort.oldest}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
