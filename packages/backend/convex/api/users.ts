// Users-related functions

import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

/**
 * Get a user by their Clerk user ID
 */
export const getUserById = query({
  args: {
    userId: v.string(),
  },
  returns: v.union(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      userId: v.string(),
      name: v.optional(v.string()),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    return user;
  },
});

/**
 * Create a new user (called when user first signs up)
 */
export const createUser = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
  },
  returns: v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    userId: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }),
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingUser) {
      return existingUser;
    }

    const userId = await ctx.db.insert("users", {
      userId: args.userId,
      name: args.name,
      createdAt: Date.now(),
    });

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  },
});

/**
 * Update user information
 */
export const updateUser = mutation({
  args: {
    userId: v.string(),
    name: v.optional(v.string()),
  },
  returns: v.object({
    _id: v.id("users"),
    _creationTime: v.number(),
    userId: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await ctx.db.patch(user._id, {
      name: args.name,
    });

    const patchedUser = await ctx.db.get(user._id);
    if (!patchedUser) {
      throw new Error("Failed to update user");
    }

    return patchedUser;
  },
});

/**
 * Get all users (for admin purposes)
 */
export const getAllUsers = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      _creationTime: v.number(),
      userId: v.string(),
      name: v.optional(v.string()),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let users = await ctx.db.query("users").order("desc").collect();

    if (args.limit) {
      users = users.slice(0, args.limit);
    }

    return users;
  },
});
