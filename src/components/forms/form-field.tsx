import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
  FormField as ShadcnFormField,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReactNode } from "react";
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

  // For select fields
  options?: SelectOption[];

  // For file upload
  multiple?: boolean;
  accept?: string;

  // Custom child component (for complex fields)
  children?: ReactNode;
};

/**
 * Generic FormField wrapper component industrialized for Anjam
 */
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
        <FormItem className="space-y-1.5">
          <FormLabel className="text-muted-foreground/60 text-[10px] font-black tracking-tight uppercase">
            {label}
            {required && (
              <span className="text-primary me-1 opacity-40">*</span>
            )}
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
                  "border-border/40 bg-muted/5 focus:border-primary/40 h-11 rounded-none font-bold focus:ring-0",
                  className,
                )}
              />
            ) : type === "textarea" ? (
              <Textarea
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "border-border/40 bg-muted/5 focus:border-primary/40 min-h-[120px] rounded-none leading-relaxed font-medium focus:ring-0",
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
                    "border-border/40 bg-muted/5 h-11 rounded-none text-right text-[11px] font-black tracking-tight uppercase focus:ring-0",
                    className,
                  )}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="border-border bg-card rounded-none border">
                  {options?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-[10px] font-black uppercase"
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
                  "border-border/40 bg-muted/5 focus:border-primary/40 h-11 rounded-none pt-2 focus:ring-0",
                  className,
                )}
              />
            ) : (
              <Input
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "border-border/40 bg-muted/5 focus:border-primary/40 h-11 rounded-none font-bold focus:ring-0",
                  className,
                )}
              />
            )}
          </FormControl>
          <FormMessage className="text-[10px] font-bold" />
        </FormItem>
      )}
    />
  );
}
