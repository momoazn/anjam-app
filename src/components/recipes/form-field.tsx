import type { ReactNode } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";

import {
  FormControl,
  FormField as ShadcnFormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { tokens } from "@/design/tokens";
import { cn } from "@/lib/utils";

type FieldType = "input" | "textarea" | "select" | "file-upload";

type SelectOption = {
  value: string;
  label: string;
};

type FormFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  type: FieldType;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  options?: SelectOption[];
  multiple?: boolean;
  accept?: string;
  children?: ReactNode;
};

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  type,
  placeholder,
  className,
  required = false,
  disabled = false,
  autoFocus = false,
  options,
  multiple,
  accept,
  children,
}: FormFieldProps<T>) {
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-foreground/60 flex items-center gap-2 text-[10px] font-bold tracking-tight">
            <div className="bg-foreground/20 h-1.5 w-1.5 rounded-full" />
            {label}
            {required ? (
              <span className="text-primary font-bold">*</span>
            ) : null}
          </FormLabel>
          <FormControl>
            {children ? (
              children
            ) : type === "input" ? (
              <Input
                {...field}
                placeholder={placeholder}
                autoFocus={autoFocus}
                disabled={disabled}
                className={cn(
                  "border-border bg-background focus:border-primary/40 focus:bg-primary/[0.02] border font-bold transition-all focus:ring-0",
                  "h-[var(--ds-sizing-formControlHeight)] rounded-[var(--ds-radius-input)]",
                  className,
                )}
              />
            ) : type === "textarea" ? (
              <Textarea
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "border-border bg-background focus:border-primary/40 focus:bg-primary/[0.02] border font-medium transition-all focus:ring-0",
                  "rounded-[var(--ds-radius-input)]",
                  className,
                )}
              />
            ) : type === "select" ? (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={disabled}
              >
                <SelectTrigger
                  className={cn(
                    "border-border bg-background focus:border-primary/40 focus:bg-primary/[0.02] border text-right text-xs font-bold tracking-tight transition-all focus:ring-0",
                    "h-[var(--ds-sizing-formControlHeight)] rounded-[var(--ds-radius-input)]",
                    className,
                  )}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent
                  className="border-border bg-background border shadow-lg"
                  style={{ borderRadius: tokens.radius.card }}
                >
                  {options?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-[10px] font-bold tracking-tight"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === "file-upload" ? (
              <Input
                type="file"
                multiple={multiple}
                accept={accept}
                disabled={disabled}
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) {
                    field.onChange(multiple ? Array.from(files) : files[0]);
                  }
                }}
                className={cn(
                  "border-border bg-background focus:border-primary/40 focus:bg-primary/[0.02] border pt-2.5 font-bold transition-all focus:ring-0",
                  "h-[var(--ds-sizing-formControlHeight)] rounded-[var(--ds-radius-input)]",
                  className,
                )}
              />
            ) : (
              <Input
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "border-border bg-background focus:border-primary/40 focus:bg-primary/[0.02] border font-bold transition-all focus:ring-0",
                  "h-[var(--ds-sizing-formControlHeight)] rounded-[var(--ds-radius-input)]",
                  className,
                )}
              />
            )}
          </FormControl>
          <FormMessage className="text-destructive text-[10px] font-bold" />
        </FormItem>
      )}
    />
  );
}

export type { FieldType, FormFieldProps, SelectOption };
