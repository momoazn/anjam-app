import { Clock, AlertTriangle } from "lucide-react";
import { common, task } from "@/constants";
import { minutesToHoursAndMinutes } from "@/lib/time-utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";

interface TimeComparisonProps {
  estimatedMinutes?: number;
  actualMinutes?: number;
  className?: string;
}

export function TimeComparison({
  estimatedMinutes,
  actualMinutes,
  className = "",
}: TimeComparisonProps) {
  if (!estimatedMinutes && !actualMinutes) {
    return null;
  }

  const estimated = minutesToHoursAndMinutes(estimatedMinutes || 0);
  const actual = minutesToHoursAndMinutes(actualMinutes || 0);

  const isOverBudget =
    actualMinutes && estimatedMinutes && actualMinutes > estimatedMinutes;
  const variance =
    actualMinutes && estimatedMinutes ? actualMinutes - estimatedMinutes : 0;
  const varianceHours = minutesToHoursAndMinutes(Math.abs(variance));

  const formatDisplay = (value: { hours: number; minutes: number }) => {
    const parts: string[] = [];

    if (value.hours > 0) {
      parts.push(`${digitsEnToFa(value.hours)} ${common.time.hoursShort}`);
    }

    if (value.minutes > 0) {
      parts.push(`${digitsEnToFa(value.minutes)} ${common.time.minutesShort}`);
    }

    if (parts.length === 0) {
      parts.push(`${digitsEnToFa(0)} ${common.time.minutesShort}`);
    }

    return parts.join(" ");
  };

  return (
    <div className={`flex items-center gap-3 text-sm ${className}`}>
      {/* Estimated Time */}
      <div className="text-muted-foreground flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>{formatDisplay(estimated)}</span>
        <span className="text-xs">({task.timeSpent})</span>
      </div>

      {/* Actual Time */}
      {actualMinutes && (
        <>
          <div className="text-muted-foreground">→</div>
          <div
            className={`flex items-center gap-1 ${isOverBudget ? "text-red-600" : "text-green-600"}`}
          >
            <Clock className="h-3 w-3" />
            <span>{formatDisplay(actual)}</span>
            <span className="text-xs">({task.timeSpent})</span>
          </div>

          {/* Variance Indicator */}
          {variance !== 0 && (
            <div
              className={`flex items-center gap-1 text-xs ${isOverBudget ? "text-red-600" : "text-green-600"}`}
            >
              {isOverBudget ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <Clock className="h-3 w-3" />
              )}
              <span>
                {isOverBudget ? "+" : ""}
                {formatDisplay(varianceHours)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
