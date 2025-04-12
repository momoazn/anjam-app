import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Task } from "@/store/task-store";
import {
  IconAntennaBars2,
  IconAntennaBars3,
  IconAntennaBars4,
  IconAntennaBars5,
} from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TEXT } from "@/constants/text";

// Helper to get user initials
const getUserInitials = (username?: string) => {
  // Assuming assignedTo contains usernames like 'user-1'
  // If it contains full names, this logic needs adjustment
  return username
    ? username.substring(0, 2).toUpperCase() // Simple initials for 'user-X'
    : "?";
};

const priorityIcon = {
  urgent: <IconAntennaBars5 className="text-red-500" />,
  high: <IconAntennaBars4 className="text-orange-500" />,
  medium: <IconAntennaBars3 className="text-yellow-500" />,
  low: <IconAntennaBars2 className="text-green-500" />,
};

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label={TEXT.tasks.table.selectAll}
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={TEXT.tasks.table.selectRow}
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "Title",
    header: ({ table }) => {
      // @ts-expect-error meta is not typed
      const groupName = table.options.meta?.groupName;
      return <h3 className="ps-2 text-xs font-bold">{groupName}</h3>;
    },
  },
  {
    accessorKey: "priority",
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.priority;
      const b = rowB.original.priority;
      if (a === b) return 0;
      if (a === "urgent") return -1;
      if (b === "urgent") return 1;
      if (a === "high") return -1;
      if (b === "high") return 1;
      if (a === "medium") return -1;
      if (b === "medium") return 1;
      return 0;
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="transition-colors duration-300 ease-in-out hover:bg-gray-200"
        >
          Priority
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const priority = row.original.priority;

      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>{priorityIcon[priority]}</TooltipTrigger>
              <TooltipContent className="h-8">
                <p>{priority}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    accessorKey: "id",
    header: TEXT.tasks.table.columns.id,
  },
  {
    accessorKey: "status",
    header: TEXT.tasks.table.columns.status,
  },
  {
    accessorKey: "title",
    header: TEXT.tasks.table.columns.title,
  },
  {
    accessorKey: "deadline",
    header: TEXT.tasks.table.columns.deadline,
  },
  {
    accessorKey: "assignedTo",
    header: TEXT.tasks.table.columns.assignedUser,
    cell: ({ row }) => {
      const assignedTo = row.original.assignedUser;
      return (
        <Avatar>
          <AvatarFallback>{getUserInitials(assignedTo[0])}</AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    id: "Actions",
    header: TEXT.tasks.table.columns.actions,
    cell: ({ row }) => {
      const task = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(task.id)}
            >
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
