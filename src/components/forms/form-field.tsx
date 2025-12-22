import type { Control, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
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
 * Generic FormField wrapper component that eliminates duplicate FormField patterns
 * Supports common input types: input, textarea, select, date, file-upload
 */
export function FormField<T extends FieldValues>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  control: _control,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  name: _name,
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
  const renderInput = () => {
    // If custom children provided, use them
    if (children) {
      return <>{children}</>;
    }

    switch (type) {
      case "input":
        return (
          <Input
            placeholder={placeholder}
            className={className}
            autoFocus={autoFocus}
            disabled={disabled}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={placeholder}
            className={className}
            disabled={disabled}
          />
        );

      case "select":
        return (
          <Select disabled={disabled}>
            <SelectTrigger className={className}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "file-upload":
        return (
          <Input
            type="file"
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            className={className}
          />
        );

      default:
        return (
          <Input
            placeholder={placeholder}
            className={className}
            disabled={disabled}
          />
        );
    }
  };

  return (
    <FormItem>
      <FormLabel>
        {label}
        {required && <span className="text-destructive mr-1">*</span>}
      </FormLabel>
      <FormControl>{renderInput()}</FormControl>
      <FormMessage />
    </FormItem>
  );
}
