import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tasks } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { ChevronLeft, ChevronRight, Hash } from "lucide-react";

export type TaskPaginationProps = {
  totalTasks: number;
  pageStart: number;
  pageEnd: number;
  currentPage: number;
  totalPages: number;
  currentPerPage: number;
  onPerPageChange: (value: string) => void;
  onPageChange: (nextPage: number) => void;
};

export function TaskPagination({
  totalTasks,
  pageStart,
  pageEnd,
  currentPage,
  totalPages,
  currentPerPage,
  onPerPageChange,
  onPageChange,
}: TaskPaginationProps) {
  if (totalTasks === 0) return null;

  return (
    <div className="border-border/15 bg-card flex flex-col gap-6 rounded-none border p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Hash className="text-primary/40 size-4" />
        <div className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
          {tasks.pagination.range
            .replace("{start}", digitsEnToFa(pageStart))
            .replace("{end}", digitsEnToFa(pageEnd))
            .replace("{total}", digitsEnToFa(totalTasks))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground/40 text-[8px] font-black tracking-tight uppercase">
            Page_Size
          </span>
          <Select
            value={currentPerPage.toString()}
            onValueChange={onPerPageChange}
          >
            <SelectTrigger className="border-border/15 bg-muted/5 h-8 w-[120px] rounded-none text-[10px] font-black tracking-tight uppercase focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border rounded-none border">
              {[25, 50, 100, 200, 500].map((size) => (
                <SelectItem
                  key={size}
                  value={size.toString()}
                  className="text-[10px] font-bold uppercase"
                >
                  {digitsEnToFa(size)} ITEMS
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-border/15 hidden h-6 w-px sm:block" />

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="border-border/15 hover:bg-primary/10 hover:text-primary size-8 rounded-none border transition-all active:scale-95"
          >
            <ChevronRight className="size-4" />
          </Button>

          <div className="flex flex-col items-center">
            <span className="text-muted-foreground/40 mb-1 text-[8px] leading-none font-black tracking-tight uppercase">
              Index
            </span>
            <span className="text-xs font-black tabular-nums">
              {digitsEnToFa(currentPage)}{" "}
              <span className="text-muted-foreground/30 mx-1 text-[10px] font-bold">
                /
              </span>{" "}
              {digitsEnToFa(totalPages)}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="border-border/15 hover:bg-primary/10 hover:text-primary size-8 rounded-none border transition-all active:scale-95"
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
