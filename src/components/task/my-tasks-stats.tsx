import { digitsEnToFa } from "@persian-tools/persian-tools";

import { Card, CardContent } from "@/components/ui/card";
import { common, myTasks as myTasksText } from "@/constants";

export type MyTasksStatsValues = {
  total: number;
  active: number;
  completed: number;
  canceled: number;
  overdue: number;
};

type MyTasksStatsProps = {
  stats: MyTasksStatsValues;
};

export function MyTasksStats({ stats }: MyTasksStatsProps) {
  return (
    <div className="mb-6 grid gap-4 md:grid-cols-5">
      <Card>
        <CardContent className="p-4">
          <div className="text-muted-foreground text-sm">{common.total}</div>
          <div className="text-2xl font-bold">{digitsEnToFa(stats.total)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-muted-foreground text-sm">
            {myTasksText.stats.active}
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {digitsEnToFa(stats.active)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-muted-foreground text-sm">
            {myTasksText.stats.completed}
          </div>
          <div className="text-2xl font-bold text-green-600">
            {digitsEnToFa(stats.completed)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-muted-foreground text-sm">
            {myTasksText.stats.overdue}
          </div>
          <div className="text-2xl font-bold text-red-600">
            {digitsEnToFa(stats.overdue)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-muted-foreground text-sm">
            {myTasksText.stats.canceled}
          </div>
          <div className="text-muted-foreground text-2xl font-bold">
            {digitsEnToFa(stats.canceled)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
