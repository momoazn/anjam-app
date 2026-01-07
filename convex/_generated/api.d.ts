/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as comments from "../comments.js";
import type * as http from "../http.js";
import type * as inbox from "../inbox.js";
import type * as insights from "../insights.js";
import type * as invites from "../invites.js";
import type * as mentions from "../mentions.js";
import type * as notifications from "../notifications.js";
import type * as orgMembers from "../orgMembers.js";
import type * as organizations from "../organizations.js";
import type * as projects from "../projects.js";
import type * as search from "../search.js";
import type * as subtasks from "../subtasks.js";
import type * as tags from "../tags.js";
import type * as tasks from "../tasks.js";
import type * as timeEntries from "../timeEntries.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  comments: typeof comments;
  http: typeof http;
  inbox: typeof inbox;
  insights: typeof insights;
  invites: typeof invites;
  mentions: typeof mentions;
  notifications: typeof notifications;
  orgMembers: typeof orgMembers;
  organizations: typeof organizations;
  projects: typeof projects;
  search: typeof search;
  subtasks: typeof subtasks;
  tags: typeof tags;
  tasks: typeof tasks;
  timeEntries: typeof timeEntries;
  users: typeof users;
  utils: typeof utils;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
