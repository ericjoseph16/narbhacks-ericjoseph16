// Database seeding function for testing and development

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { 
  sampleUsers, 
  sampleSkills, 
  getSampleDrills, 
  getSampleDrillSessions 
} from "../models/index";

/**
 * Check the current state of the database
 */
export const getDatabaseStats = query({
  args: {},
  returns: v.object({
    usersCount: v.number(),
    skillsCount: v.number(),
    drillsCount: v.number(),
    sessionsCount: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      const users = await ctx.db.query("users").collect();
      const skills = await ctx.db.query("skills").collect();
      const drills = await ctx.db.query("drills").collect();
      const sessions = await ctx.db.query("drillSessions").collect();

      return {
        usersCount: users.length,
        skillsCount: skills.length,
        drillsCount: drills.length,
        sessionsCount: sessions.length,
        message: `Database contains ${users.length} users, ${skills.length} skills, ${drills.length} drills, and ${sessions.length} sessions.`,
      };
    } catch (error) {
      return {
        usersCount: 0,
        skillsCount: 0,
        drillsCount: 0,
        sessionsCount: 0,
        message: `Error checking database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

/**
 * Seed the database with sample data for testing
 * This function creates users, skills, drills, and drill sessions
 */
export const seedDatabase = mutation({
  args: {},
  returns: v.object({
    usersCreated: v.number(),
    skillsCreated: v.number(),
    drillsCreated: v.number(),
    sessionsCreated: v.number(),
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    const results = {
      usersCreated: 0,
      skillsCreated: 0,
      drillsCreated: 0,
      sessionsCreated: 0,
      message: "",
    };

    try {
      // Step 1: Create users
      const createdUserIds: string[] = [];
      for (const userData of sampleUsers) {
        const userId = await ctx.db.insert("users", {
          userId: userData.userId,
          name: userData.name,
          createdAt: userData.createdAt,
        });
        createdUserIds.push(userId);
        results.usersCreated++;
      }

      // Step 2: Create skills
      const skillIds: Record<string, Id<"skills">> = {};
      for (const skillData of sampleSkills) {
        const skillId = await ctx.db.insert("skills", {
          name: skillData.name,
          categories: skillData.categories,
          createdBy: skillData.createdBy,
          public: skillData.public,
          createdAt: skillData.createdAt,
        });
        skillIds[skillData.name] = skillId;
        results.skillsCreated++;
      }

      // Step 3: Create drills
      const sampleDrills = getSampleDrills(skillIds);
      const createdDrillIds: Id<"drills">[] = [];
      for (const drillData of sampleDrills) {
        const drillId = await ctx.db.insert("drills", {
          skillId: drillData.skillId,
          category: drillData.category,
          difficulty: drillData.difficulty,
          description: drillData.description,
          createdAt: drillData.createdAt,
          createdBy: drillData.createdBy,
        });
        createdDrillIds.push(drillId);
        results.drillsCreated++;
      }

      // Step 4: Create drill sessions
      const sampleSessions = getSampleDrillSessions(
        sampleUsers.map(u => u.userId), 
        createdDrillIds
      );
      for (const sessionData of sampleSessions) {
        await ctx.db.insert("drillSessions", {
          userId: sessionData.userId,
          drillId: sessionData.drillId,
          completedAt: sessionData.completedAt,
          notes: sessionData.notes,
        });
        results.sessionsCreated++;
      }

      results.message = `Successfully seeded database with ${results.usersCreated} users, ${results.skillsCreated} skills, ${results.drillsCreated} drills, and ${results.sessionsCreated} sessions.`;

    } catch (error) {
      results.message = `Error seeding database: ${error instanceof Error ? error.message : 'Unknown error'}`;
      throw new Error(results.message);
    }

    return results;
  },
});

/**
 * Clear all data from the database (for testing)
 * WARNING: This will delete ALL data in the database
 */
export const clearDatabase = mutation({
  args: {},
  returns: v.object({
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      // Delete all drill sessions first (due to foreign key constraints)
      const sessions = await ctx.db.query("drillSessions").collect();
      for (const session of sessions) {
        await ctx.db.delete(session._id);
      }

      // Delete all drills
      const drills = await ctx.db.query("drills").collect();
      for (const drill of drills) {
        await ctx.db.delete(drill._id);
      }

      // Delete all skills
      const skills = await ctx.db.query("skills").collect();
      for (const skill of skills) {
        await ctx.db.delete(skill._id);
      }

      // Delete all users
      const users = await ctx.db.query("users").collect();
      for (const user of users) {
        await ctx.db.delete(user._id);
      }

      return {
        message: `Successfully cleared database. Deleted ${sessions.length} sessions, ${drills.length} drills, ${skills.length} skills, and ${users.length} users.`,
      };
    } catch (error) {
      const message = `Error clearing database: ${error instanceof Error ? error.message : 'Unknown error'}`;
      throw new Error(message);
    }
  },
}); 