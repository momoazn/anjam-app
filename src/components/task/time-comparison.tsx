import { Clock, AlertTriangle } from "lucide-react";
import { fa } from "@/constants/text";
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

  return (
    <div className={`flex items-center gap-3 text-sm ${className}`}>
      {/* Estimated Time */}
      <div className="text-muted-foreground flex items-center gap-1">
        <Clock className="h-3 w-3" />
        <span>
          {estimated.hours > 0 && `${digitsEnToFa(estimated.hours)}h `}
          {estimated.minutes > 0 && `${digitsEnToFa(estimated.minutes)}m`}
          {!estimated.hours && !estimated.minutes && "۰m"}
        </span>
        <span className="text-xs">({fa.task.timeSpent})</span>
      </div>

      {/* Actual Time */}
      {actualMinutes && (
        <>
          <div className="text-muted-foreground">→</div>
          <div
            className={`flex items-center gap-1 ${isOverBudget ? "text-red-600" : "text-green-600"}`}
          >
            <Clock className="h-3 w-3" />
            <span>
              {actual.hours > 0 && `${digitsEnToFa(actual.hours)}h `}
              {actual.minutes > 0 && `${digitsEnToFa(actual.minutes)}m`}
              {!actual.hours && !actual.minutes && "۰m"}
            </span>
            <span className="text-xs">({fa.task.timeSpent})</span>
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
                {varianceHours.hours > 0 &&
                  `${digitsEnToFa(varianceHours.hours)}h `}
                {varianceHours.minutes > 0 &&
                  `${digitsEnToFa(varianceHours.minutes)}m`}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
