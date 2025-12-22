import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { tasks } from "@/constants";

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
    <Card className="mt-6">
      <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground text-sm">
          {tasks.pagination.range
            .replace("{start}", pageStart.toString())
            .replace("{end}", pageEnd.toString())
            .replace("{total}", totalTasks.toString())}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={currentPerPage.toString()}
            onValueChange={onPerPageChange}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[25, 50, 100, 200, 500].map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {tasks.pagination.perPage.replace("{count}", size.toString())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              {tasks.pagination.prev}
            </Button>
            <span className="text-muted-foreground text-sm">
              {tasks.pagination.page
                .replace("{page}", currentPage.toString())
                .replace("{total}", totalPages.toString())}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              {tasks.pagination.next}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
