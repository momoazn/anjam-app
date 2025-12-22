import { format } from "date-fns-jalali";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { datePicker } from "@/constants";
import { cn } from "@/lib/utils";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { CalendarIcon } from "lucide-react";

type DatePickerProps = {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  buttonProps?: React.ComponentProps<typeof Button>;
};

export default function DatePicker({
  date,
  setDate,
  buttonProps,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "inline-flex w-[240px] items-center justify-start text-left font-normal",
            !date && "text-muted-foreground",
          )}
          {...buttonProps}
        >
          <CalendarIcon className="size-4 pb-0.5" />
          {date ? (
            <span>{digitsEnToFa(format(date, "P"))}</span>
          ) : (
            <span>{datePicker.placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={setDate} autoFocus />
      </PopoverContent>
    </Popover>
  );
}
