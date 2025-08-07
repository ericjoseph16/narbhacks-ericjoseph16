// Skills-related functions

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Create a new skill
 */
export const createSkill = mutation({
  args: {
    name: v.string(),
    categories: v.array(v.string()),
    createdBy: v.optional(v.string()),
    public: v.boolean(),
  },
  returns: v.object({
    _id: v.id("skills"),
    _creationTime: v.number(),
    name: v.string(),
    categories: v.array(v.string()),
    createdBy: v.optional(v.string()),
    public: v.boolean(),
    createdAt: v.number(),
  }),
  handler: async (ctx, args) => {
    const skillId = await ctx.db.insert("skills", {
      name: args.name,
      categories: args.categories,
      createdBy: args.createdBy,
      public: args.public,
      createdAt: Date.now(),
    });

    const skill = await ctx.db.get(skillId);
    if (!skill) {
      throw new Error("Failed to create skill");
    }

    return skill;
  },
});

/**
 * Get all skills (public skills + skills created by the user)
 */
export const getSkills = query({
  args: {
    userId: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("skills"),
      _creationTime: v.number(),
      name: v.string(),
      categories: v.array(v.string()),
      createdBy: v.optional(v.string()),
      public: v.boolean(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let skills = await ctx.db.query("skills").collect();

    // If userId is provided, filter to show public skills + user's own skills
    if (args.userId) {
      skills = skills.filter(
        (skill) => skill.public || skill.createdBy === args.userId
      );
    } else {
      // If no userId, only show public skills
      skills = skills.filter((skill) => skill.public);
    }

    // Sort by creation date (newest first)
    skills.sort((a, b) => b.createdAt - a.createdAt);

    return skills;
  },
});

/**
 * Get a specific skill by ID
 */
export const getSkillById = query({
  args: {
    skillId: v.id("skills"),
  },
  returns: v.union(
    v.object({
      _id: v.id("skills"),
      _creationTime: v.number(),
      name: v.string(),
      categories: v.array(v.string()),
      createdBy: v.optional(v.string()),
      public: v.boolean(),
      createdAt: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const skill = await ctx.db.get(args.skillId);
    return skill;
  },
}); 