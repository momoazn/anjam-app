import { toast } from "sonner";
import { auth, errors } from "@/constants";
import { logError, logDebug } from "./logger";

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
    status?: number;
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
  logError("PocketBase error", error);

  if (!isPocketBaseError(error)) {
    toast.error(auth.errors.serverError);
    return;
  }

  const pbError = error as PocketBaseError;

  const statusCode = pbError?.status ?? pbError?.response?.status;
  if (statusCode === 429) {
    toast.error(auth.errors.rateLimited);
    return;
  }

  // Handle PocketBase validation errors
  if (pbError?.data?.data) {
    const validationErrors = pbError.data.data;

    // Check for specific field validation errors
    if (validationErrors.password?.code === "validation_min_text_constraint") {
      toast.error(auth.errors.passwordMinLength);
    } else if (
      validationErrors.username?.code === "validation_min_text_constraint"
    ) {
      toast.error(auth.errors.usernameMinLength);
    } else if (
      validationErrors.username?.code === "validation_max_text_constraint"
    ) {
      toast.error(auth.errors.usernameMaxLength);
    } else if (
      validationErrors.password?.code === "validation_max_text_constraint"
    ) {
      toast.error(auth.errors.passwordMaxLength);
    } else if (
      validationErrors.username?.code === "validation_invalid_username"
    ) {
      toast.error(auth.errors.usernameInvalid);
    } else if (
      validationErrors.password?.code === "validation_invalid_password"
    ) {
      toast.error(auth.errors.passwordInvalid);
    } else if (
      validationErrors.username?.code === "validation_unique_constraint"
    ) {
      toast.error(auth.errors.userAlreadyExists);
    } else {
      // Display the first validation error message if available
      const firstError = Object.values(validationErrors)[0];
      if (firstError?.message) {
        toast.error(firstError.message);
      } else {
        toast.error(auth.errors.serverError);
      }
    }
  } else {
    // Check for error message in multiple possible locations
    const errorMessage =
      pbError?.message || pbError?.data?.message || pbError?.response?.message;

    logDebug("Extracted error message", errorMessage);

    if (errorMessage) {
      // Check if this is an inactive user error
      const message = errorMessage.toLowerCase();
      const inactiveKeywords = errors.validation.keywords.inactive;
      const blockedKeywords = errors.validation.keywords.blocked;

      if (
        inactiveKeywords.some((kw: string) => message.includes(kw)) ||
        message.includes("inactive")
      ) {
        toast.error(auth.errors.userInactive);
      }
      // Check if this is a blocked user error
      else if (
        blockedKeywords.some((kw: string) => message.includes(kw)) ||
        message.includes("blocked") ||
        message.includes("user account")
      ) {
        toast.error(auth.errors.userBlocked);
      }
      // Check if this is a superuser permission error
      else if (message.includes("only superusers can perform this action")) {
        toast.error(errors.permission.onlySuperusers);
      } else {
        // Display the specific error message from the backend
        toast.error(errorMessage);
      }
    } else if (pbError?.status === 400) {
      // Fallback for authentication failures without a message
      logDebug("No error message found, using generic invalidCredentials");
      toast.error(auth.errors.invalidCredentials);
    } else {
      logDebug("No error message found, using generic serverError");
      toast.error(auth.errors.serverError);
    }
  }
}
