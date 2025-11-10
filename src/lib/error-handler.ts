import { toast } from "sonner";
import { fa } from "@/constants/text";

type ValidationError = {
  code: string;
  message: string;
};

type PocketBaseError = {
  data?: {
    data?: Record<string, ValidationError>;
  };
  message?: string;
  status?: number;
};

function isPocketBaseError(
  error: Error | PocketBaseError,
): error is PocketBaseError {
  return (
    typeof error === "object" &&
    error !== null &&
    ("data" in error || "status" in error || "message" in error)
  );
}

export function handlePocketBaseError(error: Error | PocketBaseError): void {
  console.error(error);

  if (!isPocketBaseError(error)) {
    toast.error(fa.auth.errors.serverError);
    return;
  }

  const pbError = error;

  // Handle PocketBase validation errors
  if (pbError?.data?.data) {
    const validationErrors = pbError.data.data;

    // Check for specific field validation errors
    if (validationErrors.password?.code === "validation_min_text_constraint") {
      toast.error(fa.auth.errors.passwordMinLength);
    } else if (
      validationErrors.username?.code === "validation_min_text_constraint"
    ) {
      toast.error(fa.auth.errors.usernameMinLength);
    } else if (
      validationErrors.username?.code === "validation_max_text_constraint"
    ) {
      toast.error(fa.auth.errors.usernameMaxLength);
    } else if (
      validationErrors.password?.code === "validation_max_text_constraint"
    ) {
      toast.error(fa.auth.errors.passwordMaxLength);
    } else if (
      validationErrors.username?.code === "validation_invalid_username"
    ) {
      toast.error(fa.auth.errors.usernameInvalid);
    } else if (
      validationErrors.password?.code === "validation_invalid_password"
    ) {
      toast.error(fa.auth.errors.passwordInvalid);
    } else if (
      validationErrors.username?.code === "validation_unique_constraint"
    ) {
      toast.error(fa.auth.errors.userAlreadyExists);
    } else {
      // Display the first validation error message if available
      const firstError = Object.values(validationErrors)[0];
      if (firstError?.message) {
        toast.error(firstError.message);
      } else {
        toast.error(fa.auth.errors.serverError);
      }
    }
  } else if (pbError?.status === 400) {
    // Handle authentication failures
    toast.error(fa.auth.errors.invalidCredentials);
  } else if (pbError?.message) {
    toast.error(pbError.message);
  } else {
    toast.error(fa.auth.errors.serverError);
  }
}
