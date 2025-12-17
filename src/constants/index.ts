// Centralized constants index
// Re-exports all constants as a single `fa` object for backward compatibility

import { app } from "./app";
import { auth } from "./auth";
import { common } from "./common";
import { loading } from "./loading";
import { navigation } from "./navigation";
import { ui, datePicker, navigationLabels } from "./ui";
import { timesheet } from "./timesheet";
import { users } from "./users";
import { groups } from "./groups";
import { projects } from "./projects";
import { tasks } from "./tasks";
import { reports } from "./reports";
import { dashboard } from "./dashboard";
import { errors } from "./errors";
import { notifications } from "./notifications";
import { settings } from "./settings";
import { auditLogs } from "./audit-logs";
import { helps } from "./helps";
import { comments } from "./comments";
import { tagsManagement } from "./tags";
import { savedFilters } from "./saved-filters";
import {
  create,
  search,
  header,
  user,
  project,
  charts,
  notification,
  task,
  notFound,
  myTasks,
} from "./misc";

// Combine all modular constants
export const fa = {
  app,
  common,
  navigation,
  auth,
  loading,
  ui,
  datePicker,
  navigationLabels,
  timesheet,
  users,
  groups,
  projects,
  tasks,
  reports,
  dashboard,
  errors,
  notifications,
  settings,
  auditLogs,
  helps,
  create,
  search,
  header,
  user,
  project,
  charts,
  notification,
  task,
  comments,
  notFound,
  myTasks,
  tagsManagement,
  savedFilters,
} as const;

// Re-export types
export type FaKey = keyof typeof fa;
export type FaNestedKey<T> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? `${string & K}.${FaNestedKey<T[K]>}`
        : string & K;
    }[keyof T]
  : never;

export type FaPath = FaNestedKey<typeof fa>;

// Alias for more intuitive usage
export const text = fa;
