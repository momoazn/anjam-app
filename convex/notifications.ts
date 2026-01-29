import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "./utils";

export const listForMe = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc") // Newest first
      .take(100);
  },
});

export const markRead = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const notification = await ctx.db.get(args.notificationId);

    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found");
    }

    await ctx.db.patch(args.notificationId, { read: true });
  },
});

export const markAllRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) =>
        q.eq("userId", userId).eq("read", false),
      )
      .collect();

    await Promise.all(unread.map((n) => ctx.db.patch(n._id, { read: true })));
  },
});

export const deleteNotification = mutation({
  args: { notificationId: v.id("notifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const notification = await ctx.db.get(args.notificationId);

    if (!notification || notification.userId !== userId) {
      return;
    }

    await ctx.db.delete(args.notificationId);
  },
});

export const clearRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    const read = await ctx.db
      .query("notifications")
      .withIndex("by_user_read", (q) => q.eq("userId", userId).eq("read", true))
      .collect();

    await Promise.all(read.map((n) => ctx.db.delete(n._id)));
  },
});

export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    const all = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    await Promise.all(all.map((n) => ctx.db.delete(n._id)));
  },
});
