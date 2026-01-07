import { toast } from "sonner";

import { auth, errors } from "@/constants";

import { logError } from "./logger";

export function handleError(error: unknown): void {
  logError("Application error", error);

  const errorMessage = error instanceof Error ? error.message : String(error);
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
  } else if (
    message.includes("invalid credentials") ||
    message.includes("failed to authenticate")
  ) {
    toast.error(auth.errors.invalidCredentials);
  } else if (message.includes("invalidsecret")) {
    toast.error(auth.errors.invalidCredentials);
  } else if (
    message.includes("uniqueness constraint") ||
    message.includes("already exists")
  ) {
    toast.error(auth.errors.userAlreadyExists);
  } else if (errorMessage) {
    toast.error(errorMessage);
  } else {
    toast.error(auth.errors.serverError);
  }
}
