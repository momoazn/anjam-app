import { toast } from "sonner";
import { fa } from "@/constants/text";

type ValidationError = {
  code: string;
  message: string;
};

type PocketBaseError = {
  data?: {
    data?: Record<string, ValidationError>;
    message?: string;
  };
  message?: string;
  status?: number;
  response?: {
    message?: string;
    data?: Record<string, ValidationError>;
  };
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
  if (import.meta.env.DEV) {
    console.error("PocketBase error:", error);
    try {
      console.error("Error structure:", JSON.stringify(error, null, 2));
    } catch {
      console.error("Could not stringify error");
    }
  }

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
  } else {
    // Check for error message in multiple possible locations
    const errorMessage =
      pbError?.message || pbError?.data?.message || pbError?.response?.message;

    if (import.meta.env.DEV) {
      console.log("Extracted error message:", errorMessage);
    }

    if (errorMessage) {
      // Check if this is an inactive user error
      const message = errorMessage.toLowerCase();
      if (
        message.includes("غیرفعال") ||
        message.includes("inactive") ||
        message.includes("غيرفعال")
      ) {
        toast.error(fa.auth.errors.userInactive);
      }
      // Check if this is a blocked user error
      else if (
        message.includes("blocked") ||
        message.includes("مسدود") ||
        message.includes("user account") ||
        message.includes("حساب کاربری")
      ) {
        toast.error(fa.auth.errors.userBlocked);
      } else {
        // Display the specific error message from the backend
        toast.error(errorMessage);
      }
    } else if (pbError?.status === 400) {
      // Fallback for authentication failures without a message
      if (import.meta.env.DEV) {
        console.log("No error message found, using generic invalidCredentials");
      }
      toast.error(fa.auth.errors.invalidCredentials);
    } else {
      if (import.meta.env.DEV) {
        console.log("No error message found, using generic serverError");
      }
      toast.error(fa.auth.errors.serverError);
    }
  }
}
