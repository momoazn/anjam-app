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
        <FormItem className="space-y-2">
          <FormLabel className="text-foreground/60 flex items-center gap-2 text-[10px] font-black tracking-widest uppercase">
            <div className="bg-foreground/20 h-1.5 w-1.5" />
            {label}
            {required && <span className="text-primary font-black">*</span>}
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
                  "border-foreground/10 bg-background focus:border-foreground focus:bg-foreground/[0.02] h-12 border-2 font-bold focus:ring-0",
                  className,
                )}
              />
            ) : type === "textarea" ? (
              <Textarea
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "border-foreground/10 bg-background focus:border-foreground focus:bg-foreground/[0.02] border-2 font-medium focus:ring-0",
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
                    "border-foreground/10 bg-background focus:border-foreground focus:bg-foreground/[0.02] h-12 border-2 text-right text-xs font-black tracking-tight uppercase focus:ring-0",
                    className,
                  )}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="border-foreground bg-background rounded-none border-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  {options?.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-[10px] font-black tracking-tight uppercase"
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
                  "border-foreground/10 bg-background focus:border-foreground focus:bg-foreground/[0.02] h-12 border-2 pt-2.5 font-bold focus:ring-0",
                  className,
                )}
              />
            ) : (
              <Input
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "border-foreground/10 bg-background focus:border-foreground focus:bg-foreground/[0.02] h-12 border-2 font-bold focus:ring-0",
                  className,
                )}
              />
            )}
          </FormControl>
          <FormMessage className="text-destructive font-mono text-[10px] font-black uppercase" />
        </FormItem>
      )}
    />
  );
}
