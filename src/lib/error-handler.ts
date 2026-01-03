import { toast } from "sonner";

import { auth, errors } from "@/constants";

import { logDebug, logError } from "./logger";

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

  if (pbError?.data?.data) {
    const validationErrors = pbError.data.data;

    if (validationErrors.password?.code === "validation_min_text_constraint") {
      toast.error(auth.errors.passwordMinLength);
    } else if (validationErrors.email?.code === "validation_required") {
      toast.error(auth.errors.emailRequired);
    } else if (validationErrors.email?.code === "validation_invalid_email") {
      toast.error(auth.errors.emailInvalid);
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
    } else if (
      validationErrors.email?.code === "validation_unique_constraint"
    ) {
      toast.error(auth.errors.userAlreadyExists);
    } else {
      const firstError = Object.values(validationErrors)[0];
      if (firstError?.message) {
        toast.error(firstError.message);
      } else {
        toast.error(auth.errors.serverError);
      }
    }
  } else {
    const errorMessage =
      pbError?.message || pbError?.data?.message || pbError?.response?.message;

    logDebug("Extracted error message", errorMessage);

    if (errorMessage) {
      const message = errorMessage.toLowerCase();
      const inactiveKeywords = errors.validation.keywords.inactive;
      const blockedKeywords = errors.validation.keywords.blocked;

      if (
        inactiveKeywords.some((kw: string) => message.includes(kw)) ||
        message.includes("inactive")
      ) {
        toast.error(auth.errors.userInactive);
      } else if (
        blockedKeywords.some((kw: string) => message.includes(kw)) ||
        message.includes("blocked") ||
        message.includes("user account")
      ) {
        toast.error(auth.errors.userBlocked);
      } else if (message.includes("only superusers can perform this action")) {
        toast.error(errors.permission.onlySuperusers);
      } else {
        toast.error(errorMessage);
      }
    } else if (pbError?.status === 400) {
      toast.error(auth.errors.invalidCredentials);
    } else {
      toast.error(auth.errors.serverError);
    }
  }
}
