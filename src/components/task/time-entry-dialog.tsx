import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { parseTimeInput, minutesToHoursAndMinutes } from "@/lib/time-utils";
import { common, task, tasks } from "@/constants";
import { digitsEnToFa } from "@persian-tools/persian-tools";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const timeEntrySchema = z.object({
  hours: z.coerce.number().min(0).max(999),
  minutes: z.coerce.number().min(0).max(59),
});

type TimeEntryForm = z.infer<typeof timeEntrySchema>;

interface TimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMinutes: number;
  estimatedMinutes?: number;
  onSave: (minutes: number) => Promise<void>;
  taskTitle: string;
}

export function TimeEntryDialog({
  open,
  onOpenChange,
  currentMinutes,
  estimatedMinutes,
  onSave,
  taskTitle,
}: TimeEntryDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { hours: currentHours, minutes: currentMins } =
    minutesToHoursAndMinutes(currentMinutes);

  const form = useForm<TimeEntryForm>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      hours: currentHours,
      minutes: currentMins,
    },
  });

  const handleSubmit = async (data: TimeEntryForm) => {
    setIsSubmitting(true);
    try {
      const totalMinutes = parseTimeInput(data.hours, data.minutes);
      await onSave(totalMinutes);
      onOpenChange(false);
    } catch {
      // Error handling is done by the parent component via onSave callback
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate if current input exceeds estimate
  const currentInputMinutes = parseTimeInput(
    Number(form.watch("hours") || 0),
    Number(form.watch("minutes") || 0),
  );
  const willExceedEstimate =
    estimatedMinutes && currentInputMinutes > estimatedMinutes;

  const handleAddQuickTime = (minutes: number) => {
    const current = parseTimeInput(
      form.getValues("hours"),
      form.getValues("minutes"),
    );
    const newTotal = minutesToHoursAndMinutes(current + minutes);
    form.setValue("hours", newTotal.hours);
    form.setValue("minutes", newTotal.minutes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task.logTime}</DialogTitle>
          <DialogDescription className="text-sm">{taskTitle}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{task.hours}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="999"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{task.minutes}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        placeholder="0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel>{task.quickAdd}</FormLabel>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddQuickTime(15)}
                >
                  +15{task.min}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddQuickTime(30)}
                >
                  +30{task.min}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddQuickTime(60)}
                >
                  +1{task.hour}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddQuickTime(120)}
                >
                  +2{task.hour}
                </Button>
              </div>
            </div>

            {willExceedEstimate && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  {tasks.details.timeTracking.exceedsEstimate
                    .replace(
                      "{hours}",
                      digitsEnToFa(Math.floor(estimatedMinutes / 60)),
                    )
                    .replace("{minutes}", digitsEnToFa(estimatedMinutes % 60))}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                {common.cancel}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? common.saving : common.save}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
