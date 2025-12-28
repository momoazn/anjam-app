import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="border-border/40 rounded-2xl shadow-sm">
      <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Hash className="text-primary/40 size-4" />
          <div className="text-muted-foreground/60 text-[10px] font-bold tracking-tight">
            {tasks.pagination.range
              .replace("{start}", digitsEnToFa(pageStart))
              .replace("{end}", digitsEnToFa(pageEnd))
              .replace("{total}", digitsEnToFa(totalTasks))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground/40 text-[9px] font-bold tracking-tight">
              Page Size
            </span>
            <Select
              value={currentPerPage.toString()}
              onValueChange={onPerPageChange}
            >
              <SelectTrigger className="bg-muted/30 h-8 w-[120px] rounded-xl border-none text-[10px] font-bold tracking-tight focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border/40 rounded-xl border shadow-lg">
                {[25, 50, 100, 200, 500].map((size) => (
                  <SelectItem
                    key={size}
                    value={size.toString()}
                    className="text-[10px] font-medium"
                  >
                    {digitsEnToFa(size)} Items
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
              className="hover:bg-primary/10 hover:text-primary size-8 rounded-xl transition-all active:scale-95"
            >
              <ChevronRight className="size-4" />
            </Button>

            <div className="flex flex-col items-center">
              <span className="text-muted-foreground/40 mb-1 text-[9px] leading-none font-bold tracking-tight">
                Page
              </span>
              <span className="text-xs font-bold tabular-nums">
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
              className="hover:bg-primary/10 hover:text-primary size-8 rounded-xl transition-all active:scale-95"
            >
              <ChevronLeft className="size-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
