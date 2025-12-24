import { digitsEnToFa } from "@persian-tools/persian-tools";
import {
  IconTrophy,
  IconCircleCheck,
  IconClock,
  IconActivity,
} from "@tabler/icons-react";

import { reports } from "@/constants";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col items-center justify-center py-24 text-center opacity-30 grayscale">
        <div className="border-foreground/40 mb-6 flex h-20 w-20 items-center justify-center border-2">
          <IconTrophy className="size-10 stroke-[1]" />
        </div>
        <p className="text-[10px] font-black tracking-[0.3em] uppercase">
          {reports.noData}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-2 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <IconTrophy className="size-4 text-amber-500" />
          <h3 className="text-sm font-black tracking-widest uppercase">
            {reports.topPerformers}
          </h3>
        </div>
        <div className="bg-border/20 h-px flex-1" />
      </div>

      <div
        className="bg-border/40 border-border/40 grid grid-cols-1 gap-px overflow-hidden border"
        data-animate-stagger
      >
        {rows.map((row, index) => {
          const completionRate = Math.round((row.completionRate || 0) * 100);
          const onTimeRate = Math.round((row.onTimeRate || 0) * 100);

          return (
            <button
              key={row.userId}
              type="button"
              onClick={() => onRowClick?.(row.userId)}
              className={cn(
                "group bg-card hover:bg-muted/30 relative flex items-stretch overflow-hidden text-right transition-all",
                onRowClick && "cursor-pointer",
              )}
            >
              {/* Rank Zone */}
              <div className="border-border/10 bg-muted/5 flex w-14 shrink-0 items-center justify-center border-l">
                <span className="text-xl font-black tracking-tighter opacity-20 transition-opacity group-hover:opacity-40">
                  {digitsEnToFa(index + 1)}
                </span>
              </div>

              {/* Identity Zone */}
              <div className="flex-1 px-6 py-4">
                <div className="mb-1 flex items-center justify-end gap-2">
                  <span className="text-muted-foreground/40 text-[8px] font-black tracking-[0.2em] uppercase">
                    Operator_Protocol
                  </span>
                  <IconActivity className="text-primary/40 size-2.5" />
                </div>
                <h4 className="group-hover:text-primary text-sm font-black tracking-tight uppercase transition-colors">
                  {row.name}
                </h4>
              </div>

              {/* Metrics Cluster */}
              <div className="border-border/10 bg-muted/5 flex items-center gap-8 border-r px-8">
                <div className="flex flex-col items-end">
                  <div className="mb-1 flex items-center gap-1.5 opacity-40">
                    <span className="text-[8px] font-black tracking-widest uppercase">
                      Completed
                    </span>
                    <IconCircleCheck className="size-2.5" />
                  </div>
                  <span className="text-base font-black tabular-nums">
                    {digitsEnToFa(row.completed)}
                  </span>
                </div>

                <div className="flex flex-col items-end">
                  <div className="mb-1 flex items-center gap-1.5 opacity-40">
                    <span className="text-[8px] font-black tracking-widest uppercase">
                      Efficiency
                    </span>
                    <IconClock className="size-2.5" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-black tabular-nums">
                      {digitsEnToFa(completionRate)}
                    </span>
                    <span className="text-[10px] font-bold opacity-30">%</span>
                  </div>
                </div>

                <div className="flex min-w-[80px] flex-col items-end">
                  <div className="mb-1 flex items-center gap-1.5 opacity-40">
                    <span className="text-[8px] font-black tracking-widest uppercase">
                      Timeliness
                    </span>
                    <IconActivity className="size-2.5" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        "text-base font-black tabular-nums",
                        onTimeRate < 50 ? "text-rose-500" : "text-emerald-500",
                      )}
                    >
                      {digitsEnToFa(onTimeRate)}
                    </span>
                    <span className="text-[10px] font-bold opacity-30">%</span>
                  </div>
                </div>
              </div>

              <div className="bg-primary absolute right-0 bottom-0 h-0.5 w-0 transition-all duration-500 group-hover:w-full" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
