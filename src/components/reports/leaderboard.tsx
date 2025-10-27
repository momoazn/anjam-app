import { digitsEnToFa } from "@persian-tools/persian-tools";
import { Trophy } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  rows: Array<{
    userId: string;
    name: string;
    completed: number;
    completionRate: number;
    onTimeRate: number;
  }>;
  onRowClick?: (userId: string) => void;
};

export function Leaderboard({ rows, onRowClick }: Props) {
  if (rows.length === 0) {
    return (
      <div className="text-muted-foreground flex h-48 items-center justify-center">
        هیچ داده‌ای برای نمایش وجود ندارد
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-4 w-4 text-yellow-500" />
        <h3 className="text-sm font-medium">برترین مجریان</h3>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>نام</TableHead>
            <TableHead className="text-center">تکمیل شده</TableHead>
            <TableHead className="text-center">نرخ تکمیل</TableHead>
            <TableHead className="text-center">نرخ به‌موقع</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={row.userId}
              onClick={() => onRowClick?.(row.userId)}
              className={onRowClick ? "hover:bg-muted/50 cursor-pointer" : ""}
            >
              <TableCell className="font-medium">
                {digitsEnToFa(index + 1)}
              </TableCell>
              <TableCell className="font-medium">{row.name}</TableCell>
              <TableCell className="text-center">
                {digitsEnToFa(row.completed)}
              </TableCell>
              <TableCell className="text-center">
                {digitsEnToFa(Math.round(row.completionRate * 100))}%
              </TableCell>
              <TableCell className="text-center">
                {digitsEnToFa(Math.round(row.onTimeRate * 100))}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
