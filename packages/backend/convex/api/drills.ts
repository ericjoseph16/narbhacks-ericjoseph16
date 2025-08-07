// Drills-related functions

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Create a new drill
 */
export const createDrill = mutation({
  args: {
    skillId: v.id("skills"),
    category: v.string(),
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
    description: v.string(),
    createdBy: v.string(),
  },
  returns: v.object({
    _id: v.id("drills"),
    _creationTime: v.number(),
    skillId: v.id("skills"),
    category: v.string(),
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
    description: v.string(),
    createdAt: v.number(),
    createdBy: v.string(),
  }),
  handler: async (ctx, args) => {
    // Verify the skill exists
    const skill = await ctx.db.get(args.skillId);
    if (!skill) {
      throw new Error("Skill not found");
    }

    // Verify the category exists for this skill
    if (!skill.categories.includes(args.category)) {
      throw new Error(`Category "${args.category}" not found for skill "${skill.name}"`);
    }

    const drillId = await ctx.db.insert("drills", {
      skillId: args.skillId,
      category: args.category,
      difficulty: args.difficulty,
      description: args.description,
      createdAt: Date.now(),
      createdBy: args.createdBy,
    });

    const drill = await ctx.db.get(drillId);
    if (!drill) {
      throw new Error("Failed to create drill");
    }

    return drill;
  },
});

/**
 * Get all drills for a given skill
 */
export const getDrillsBySkill = query({
  args: {
    skillId: v.id("skills"),
    category: v.optional(v.string()),
    difficulty: v.optional(
      v.union(
        v.literal("Beginner"),
        v.literal("Intermediate"),
        v.literal("Advanced")
      )
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("drills"),
      _creationTime: v.number(),
      skillId: v.id("skills"),
      category: v.string(),
      difficulty: v.union(
        v.literal("Beginner"),
        v.literal("Intermediate"),
        v.literal("Advanced")
      ),
      description: v.string(),
      createdAt: v.number(),
      createdBy: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    // Verify the skill exists
    const skill = await ctx.db.get(args.skillId);
    if (!skill) {
      throw new Error("Skill not found");
    }

    let drills = await ctx.db
      .query("drills")
      .withIndex("by_skillId", (q) => q.eq("skillId", args.skillId))
      .collect();

    // Filter by category if provided
    if (args.category) {
      drills = drills.filter((drill) => drill.category === args.category);
    }

    // Filter by difficulty if provided
    if (args.difficulty) {
      drills = drills.filter((drill) => drill.difficulty === args.difficulty);
    }

    // Sort by creation date (newest first)
    drills.sort((a, b) => b.createdAt - a.createdAt);

    return drills;
  },
});

/**
 * Get a specific drill by ID
 */
export const getDrillById = query({
  args: {
    drillId: v.id("drills"),
  },
  returns: v.union(
    v.object({
      _id: v.id("drills"),
      _creationTime: v.number(),
      skillId: v.id("skills"),
      category: v.string(),
      difficulty: v.union(
        v.literal("Beginner"),
        v.literal("Intermediate"),
        v.literal("Advanced")
      ),
      description: v.string(),
      createdAt: v.number(),
      createdBy: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const drill = await ctx.db.get(args.drillId);
    return drill;
  },
});

/**
 * Get drills by category for a specific skill
 */
export const getDrillsByCategory = query({
  args: {
    skillId: v.id("skills"),
    category: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("drills"),
      _creationTime: v.number(),
      skillId: v.id("skills"),
      category: v.string(),
      difficulty: v.union(
        v.literal("Beginner"),
        v.literal("Intermediate"),
        v.literal("Advanced")
      ),
      description: v.string(),
      createdAt: v.number(),
      createdBy: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    // Verify the skill exists
    const skill = await ctx.db.get(args.skillId);
    if (!skill) {
      throw new Error("Skill not found");
    }

    // Verify the category exists for this skill
    if (!skill.categories.includes(args.category)) {
      throw new Error(`Category "${args.category}" not found for skill "${skill.name}"`);
    }

    const drills = await ctx.db
      .query("drills")
      .withIndex("by_skillId_and_category", (q) => 
        q.eq("skillId", args.skillId).eq("category", args.category)
      )
      .order("desc")
      .collect();

    return drills;
  },
}); 