import type { Auth } from "convex/server";
import { v } from "convex/values";
import { NoOp } from "convex-helpers/server/customFunctions";
import { zCustomMutation } from "convex-helpers/server/zod";
import { z } from "zod";
import { mutation, query } from "../_generated/server";
import type { QueryCtx, MutationCtx } from "../_generated/server";

// Create custom mutation builder for enhanced validation
const zMutation = zCustomMutation(mutation, NoOp);

export const getUserId = async (ctx: { auth: Auth }) => {
  return (await ctx.auth.getUserIdentity())?.subject;
};

// Get all skill drills for a specific user
export const getSkillDrills = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const userId = await getUserId(ctx);
    if (!userId) return null;

    const drills = await ctx.db
      .query("skillDrills")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();

    return drills;
  },
});

// Get a specific skill drill by ID
export const getSkillDrill = query({
  args: {
    id: v.optional(v.id("skillDrills")),
  },
  handler: async (ctx: QueryCtx, args) => {
    const { id } = args;
    if (!id) return null;
    const drill = await ctx.db.get(id);
    return drill;
  },
});

// Create a new skill drill for a user
export const createSkillDrill = zMutation({
  args: {
    skillName: z.string().min(1).max(100),
    level: z.enum(["Beginner", "Intermediate", "Advanced"]),
    drillDescription: z.string().min(1).max(2000),
    assignedDate: z.number(),
  },
  handler: async (ctx: MutationCtx, { skillName, level, drillDescription, assignedDate }) => {
    const userId = await getUserId(ctx);
    if (!userId) throw new Error("User not found");
    
    const drillId = await ctx.db.insert("skillDrills", {
      userId,
      skillName,
      level,
      drillDescription,
      assignedDate,
      completed: false,
    });

    return drillId;
  },
});

// Mark a skill drill as completed with optional feedback
export const completeSkillDrill = mutation({
  args: {
    drillId: v.id("skillDrills"),
    feedback: v.optional(v.string()),
  },
  handler: async (ctx: MutationCtx, args) => {
    const { drillId, feedback } = args;
    
    await ctx.db.patch(drillId, {
      completed: true,
      ...(feedback && { feedback }),
    });
  },
});
