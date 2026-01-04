// Cache durations in ms
export const STALE_TIMES = {
  /** 5 minutes - for rarely changing data like org settings, user preferences */
  static: 5 * 60 * 1000,

  /** 2 minutes - for reference data like projects, tags, users list */
  reference: 2 * 60 * 1000,

  /** 30 seconds - for frequently changing data like tasks, comments */
  dynamic: 30 * 1000,

  /** 10 seconds - for very frequently changing data */
  frequent: 10 * 1000,

  /** 0 - always refetch, for real-time data like notifications */
  realtime: 0,
} as const;

// Cache gc durations in ms
export const GC_TIMES = {
  /** 10 minutes - for frequently accessed data */
  short: 10 * 60 * 1000,

  /** 30 minutes - for reference data */
  medium: 30 * 60 * 1000,

  /** 1 hour - for rarely changing data */
  long: 60 * 60 * 1000,
} as const;
