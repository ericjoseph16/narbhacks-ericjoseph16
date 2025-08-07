// Drill sessions functions

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Log that a user completed a drill (timestamp is now)
 */
export const logDrillSession = mutation({
  args: {
    userId: v.string(),
    drillId: v.id("drills"),
    notes: v.optional(v.string()),
  },
  returns: v.object({
    _id: v.id("drillSessions"),
    _creationTime: v.number(),
    userId: v.string(),
    drillId: v.id("drills"),
    completedAt: v.number(),
    notes: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Verify the drill exists
    const drill = await ctx.db.get(args.drillId);
    if (!drill) {
      throw new Error("Drill not found");
    }

    // Verify the user exists (optional check)
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    const sessionId = await ctx.db.insert("drillSessions", {
      userId: args.userId,
      drillId: args.drillId,
      completedAt: Date.now(),
      notes: args.notes,
    });

    const session = await ctx.db.get(sessionId);
    if (!session) {
      throw new Error("Failed to create drill session");
    }

    return session;
  },
});

/**
 * Get the user's past completed drills in reverse chronological order
 */
export const getDrillHistory = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("drillSessions"),
      _creationTime: v.number(),
      userId: v.string(),
      drillId: v.id("drills"),
      completedAt: v.number(),
      notes: v.optional(v.string()),
      drill: v.object({
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
      skill: v.object({
        _id: v.id("skills"),
        _creationTime: v.number(),
        name: v.string(),
        categories: v.array(v.string()),
        createdBy: v.optional(v.string()),
        public: v.boolean(),
        createdAt: v.number(),
      }),
    })
  ),
  handler: async (ctx, args) => {
    // Verify the user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get user's drill sessions in reverse chronological order
    let sessions = await ctx.db
      .query("drillSessions")
      .withIndex("by_userId_and_completedAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    // Apply limit if provided
    if (args.limit) {
      sessions = sessions.slice(0, args.limit);
    }

    // Fetch drill and skill details for each session
    const sessionsWithDetails = await Promise.all(
      sessions.map(async (session) => {
        const drill = await ctx.db.get(session.drillId);
        if (!drill) {
          throw new Error(`Drill not found for session ${session._id}`);
        }

        const skill = await ctx.db.get(drill.skillId);
        if (!skill) {
          throw new Error(`Skill not found for drill ${drill._id}`);
        }

        return {
          ...session,
          drill,
          skill,
        };
      })
    );

    return sessionsWithDetails;
  },
});

/**
 * Get all drills created by a user (used for history / personalization)
 */
export const getDrillsByUser = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
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
      skill: v.object({
        _id: v.id("skills"),
        _creationTime: v.number(),
        name: v.string(),
        categories: v.array(v.string()),
        createdBy: v.optional(v.string()),
        public: v.boolean(),
        createdAt: v.number(),
      }),
    })
  ),
  handler: async (ctx, args) => {
    // Verify the user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get drills created by the user
    let drills = await ctx.db
      .query("drills")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", args.userId))
      .order("desc")
      .collect();

    // Apply limit if provided
    if (args.limit) {
      drills = drills.slice(0, args.limit);
    }

    // Fetch skill details for each drill
    const drillsWithSkills = await Promise.all(
      drills.map(async (drill) => {
        const skill = await ctx.db.get(drill.skillId);
        if (!skill) {
          throw new Error(`Skill not found for drill ${drill._id}`);
        }

        return {
          ...drill,
          skill,
        };
      })
    );

    return drillsWithSkills;
  },
});

/**
 * Get a specific drill session by ID
 */
export const getDrillSessionById = query({
  args: {
    sessionId: v.id("drillSessions"),
  },
  returns: v.union(
    v.object({
      _id: v.id("drillSessions"),
      _creationTime: v.number(),
      userId: v.string(),
      drillId: v.id("drills"),
      completedAt: v.number(),
      notes: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    return session;
  },
});

/**
 * Get drill sessions for a specific drill
 */
export const getDrillSessionsByDrill = query({
  args: {
    drillId: v.id("drills"),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("drillSessions"),
      _creationTime: v.number(),
      userId: v.string(),
      drillId: v.id("drills"),
      completedAt: v.number(),
      notes: v.optional(v.string()),
    })
  ),
  handler: async (ctx, args) => {
    // Verify the drill exists
    const drill = await ctx.db.get(args.drillId);
    if (!drill) {
      throw new Error("Drill not found");
    }

    // Get sessions for this drill
    let sessions = await ctx.db
      .query("drillSessions")
      .withIndex("by_drillId", (q) => q.eq("drillId", args.drillId))
      .order("desc")
      .collect();

    // Apply limit if provided
    if (args.limit) {
      sessions = sessions.slice(0, args.limit);
    }

    return sessions;
  },
});

/**
 * Get user's drill completion statistics
 */
export const getUserDrillStats = query({
  args: {
    userId: v.string(),
  },
  returns: v.object({
    totalSessions: v.number(),
    totalDrills: v.number(),
    totalSkills: v.number(),
    sessionsBySkill: v.array(
      v.object({
        skillName: v.string(),
        skillId: v.id("skills"),
        sessionCount: v.number(),
        lastCompleted: v.optional(v.number()),
      })
    ),
    sessionsByDifficulty: v.record(v.string(), v.number()),
    sessionsByCategory: v.record(v.string(), v.number()),
  }),
  handler: async (ctx, args) => {
    // Verify the user exists
    const user = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    // Get all user's sessions
    const sessions = await ctx.db
      .query("drillSessions")
      .withIndex("by_userId_and_completedAt", (q) => q.eq("userId", args.userId))
      .collect();

    // Get drill and skill details
    const sessionsWithDetails = await Promise.all(
      sessions.map(async (session) => {
        const drill = await ctx.db.get(session.drillId);
        if (!drill) return null;

        const skill = await ctx.db.get(drill.skillId);
        if (!skill) return null;

        return {
          session,
          drill,
          skill,
        };
      })
    );

    // Filter out null results
    const validSessions = sessionsWithDetails.filter(Boolean) as Array<{
      session: any;
      drill: any;
      skill: any;
    }>;

    // Calculate statistics
    const totalSessions = validSessions.length;
    const uniqueDrills = new Set(validSessions.map(s => s.drill._id)).size;
    const uniqueSkills = new Set(validSessions.map(s => s.skill._id)).size;

    // Group by skill
    const sessionsBySkill = new Map<string, { skillName: string; skillId: string; sessionCount: number; lastCompleted?: number }>();
    validSessions.forEach(({ session, skill }) => {
      const key = skill._id;
      const existing = sessionsBySkill.get(key);
      if (existing) {
        existing.sessionCount++;
        if (session.completedAt > (existing.lastCompleted || 0)) {
          existing.lastCompleted = session.completedAt;
        }
      } else {
        sessionsBySkill.set(key, {
          skillName: skill.name,
          skillId: skill._id,
          sessionCount: 1,
          lastCompleted: session.completedAt,
        });
      }
    });

    // Group by difficulty
    const sessionsByDifficulty: Record<string, number> = {};
    validSessions.forEach(({ session, drill }) => {
      const difficulty = drill.difficulty;
      sessionsByDifficulty[difficulty] = (sessionsByDifficulty[difficulty] || 0) + 1;
    });

    // Group by category
    const sessionsByCategory: Record<string, number> = {};
    validSessions.forEach(({ session, drill }) => {
      const category = drill.category;
      sessionsByCategory[category] = (sessionsByCategory[category] || 0) + 1;
    });

    return {
      totalSessions,
      totalDrills: uniqueDrills,
      totalSkills: uniqueSkills,
      sessionsBySkill: Array.from(sessionsBySkill.values()),
      sessionsByDifficulty,
      sessionsByCategory,
    };
  },
}); 