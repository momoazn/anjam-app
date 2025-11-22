import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fa } from "@/constants/text";

type TimeEstimateFieldsProps = {
  control: Control<{
    estimated_hours?: number;
    estimated_minutes?: number;
  }>;
};

export function TimeEstimateFields({ control }: TimeEstimateFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={control}
        name="estimated_hours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fa.tasks.estimatedHours}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                max="999"
                placeholder="0"
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="estimated_minutes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>{fa.tasks.estimatedMinutes}</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                {...field}
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}