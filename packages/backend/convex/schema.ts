import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  skillDrills: defineTable({
    userId: v.string(),
    skillName: v.string(),
    level: v.union(v.literal("Beginner"), v.literal("Intermediate"), v.literal("Advanced")),
    drillDescription: v.string(),
    assignedDate: v.number(),
    completed: v.boolean(),
    feedback: v.optional(v.string()),
  }),
});
