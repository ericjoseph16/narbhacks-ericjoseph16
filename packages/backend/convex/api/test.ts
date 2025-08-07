// Test functions to demonstrate Phase 1 and Phase 2 functionality

import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";

/**
 * Test function to demonstrate Phase 1 CRUD operations
 */
export const testPhase1Operations = mutation({
  args: {},
  returns: v.object({
    message: v.string(),
    results: v.object({
      skillCreated: v.boolean(),
      drillsCreated: v.number(),
      skillsRetrieved: v.number(),
      drillsRetrieved: v.number(),
    }),
  }),
  handler: async (ctx, args) => {
    const results = {
      skillCreated: false,
      drillsCreated: 0,
      skillsRetrieved: 0,
      drillsRetrieved: 0,
    };

    try {
      // 1. Create a test skill directly
      const testSkillId = await ctx.db.insert("skills", {
        name: "Test Skill",
        categories: ["test-category-1", "test-category-2"],
        createdBy: "test-user-123",
        public: true,
        createdAt: Date.now(),
      });
      results.skillCreated = true;

      // 2. Create test drills directly
      const drill1Id = await ctx.db.insert("drills", {
        skillId: testSkillId,
        category: "test-category-1",
        difficulty: "Beginner",
        description: "This is a test drill for beginners",
        createdAt: Date.now(),
        createdBy: "test-user-123",
      });
      results.drillsCreated++;

      const drill2Id = await ctx.db.insert("drills", {
        skillId: testSkillId,
        category: "test-category-2",
        difficulty: "Intermediate",
        description: "This is a test drill for intermediate users",
        createdAt: Date.now(),
        createdBy: "test-user-123",
      });
      results.drillsCreated++;

      // 3. Retrieve skills
      const skills = await ctx.db.query("skills").collect();
      const userSkills = skills.filter(
        (skill) => skill.public || skill.createdBy === "test-user-123"
      );
      results.skillsRetrieved = userSkills.length;

      // 4. Retrieve drills for the skill
      const drills = await ctx.db
        .query("drills")
        .withIndex("by_skillId", (q) => q.eq("skillId", testSkillId))
        .collect();
      results.drillsRetrieved = drills.length;

      return {
        message: "Phase 1 operations completed successfully!",
        results,
      };
    } catch (error) {
      return {
        message: `Error testing Phase 1 operations: ${error instanceof Error ? error.message : 'Unknown error'}`,
        results,
      };
    }
  },
});

/**
 * Test function to demonstrate Phase 2 operations
 */
export const testPhase2Operations = mutation({
  args: {
    userId: v.string(),
  },
  returns: v.object({
    message: v.string(),
    results: v.object({
      sessionsCreated: v.number(),
      sessionsRetrieved: v.number(),
      userDrillsRetrieved: v.number(),
      statsGenerated: v.boolean(),
    }),
  }),
  handler: async (ctx, args) => {
    const results = {
      sessionsCreated: 0,
      sessionsRetrieved: 0,
      userDrillsRetrieved: 0,
      statsGenerated: false,
    };

    try {
      // 1. Get some existing drills to create sessions for
      const drills = await ctx.db.query("drills").take(3);
      if (drills.length === 0) {
        throw new Error("No drills found. Please seed the database first.");
      }

      // 2. Create test drill sessions
      for (const drill of drills) {
        await ctx.db.insert("drillSessions", {
          userId: args.userId,
          drillId: drill._id,
          completedAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random time in last 7 days
          notes: `Test session for ${drill.category} drill`,
        });
        results.sessionsCreated++;
      }

      // 3. Retrieve drill history
      const history = await ctx.db
        .query("drillSessions")
        .withIndex("by_userId_and_completedAt", (q) => q.eq("userId", args.userId))
        .order("desc")
        .collect();
      results.sessionsRetrieved = history.length;

      // 4. Retrieve user's drills
      const userDrills = await ctx.db
        .query("drills")
        .withIndex("by_createdBy", (q) => q.eq("createdBy", args.userId))
        .collect();
      results.userDrillsRetrieved = userDrills.length;

      // 5. Generate stats (simplified version)
      const sessions = await ctx.db
        .query("drillSessions")
        .withIndex("by_userId_and_completedAt", (q) => q.eq("userId", args.userId))
        .collect();
      results.statsGenerated = sessions.length > 0;

      return {
        message: "Phase 2 operations completed successfully!",
        results,
      };
    } catch (error) {
      return {
        message: `Error testing Phase 2 operations: ${error instanceof Error ? error.message : 'Unknown error'}`,
        results,
      };
    }
  },
});

/**
 * Get a summary of all skills and drills in the database
 */
export const getDatabaseSummary = query({
  args: {},
  returns: v.object({
    totalSkills: v.number(),
    totalDrills: v.number(),
    totalSessions: v.number(),
    totalUsers: v.number(),
    skillsByCategory: v.array(
      v.object({
        name: v.string(),
        categories: v.array(v.string()),
        drillCount: v.number(),
      })
    ),
  }),
  handler: async (ctx, args) => {
    const skills = await ctx.db.query("skills").collect();
    const drills = await ctx.db.query("drills").collect();
    const sessions = await ctx.db.query("drillSessions").collect();
    const users = await ctx.db.query("users").collect();

    const skillsByCategory = skills.map((skill) => {
      const skillDrills = drills.filter((drill) => drill.skillId === skill._id);
      return {
        name: skill.name,
        categories: skill.categories,
        drillCount: skillDrills.length,
      };
    });

    return {
      totalSkills: skills.length,
      totalDrills: drills.length,
      totalSessions: sessions.length,
      totalUsers: users.length,
      skillsByCategory,
    };
  },
});

/**
 * Test creating a skill with validation
 */
export const testCreateSkill = mutation({
  args: {
    name: v.string(),
    categories: v.array(v.string()),
    createdBy: v.string(),
    public: v.boolean(),
  },
  returns: v.object({
    success: v.boolean(),
    skill: v.union(
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
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
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

      return {
        success: true,
        skill,
        message: `Successfully created skill: ${args.name}`,
      };
    } catch (error) {
      return {
        success: false,
        skill: null,
        message: `Failed to create skill: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

/**
 * Test creating a drill with validation
 */
export const testCreateDrill = mutation({
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
    success: v.boolean(),
    drill: v.union(
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
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
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

      return {
        success: true,
        drill,
        message: `Successfully created drill for category: ${args.category}`,
      };
    } catch (error) {
      return {
        success: false,
        drill: null,
        message: `Failed to create drill: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

/**
 * Test retrieving skills with different filters
 */
export const testGetSkills = query({
  args: {
    userId: v.optional(v.string()),
  },
  returns: v.object({
    totalSkills: v.number(),
    publicSkills: v.number(),
    userSkills: v.number(),
    skills: v.array(
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
  }),
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

    const publicSkills = skills.filter((skill) => skill.public);
    const userSkills = skills.filter((skill) => skill.createdBy === args.userId);

    return {
      totalSkills: skills.length,
      publicSkills: publicSkills.length,
      userSkills: userSkills.length,
      skills,
    };
  },
});

/**
 * Test retrieving drills with different filters
 */
export const testGetDrills = query({
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
  returns: v.object({
    totalDrills: v.number(),
    drillsByCategory: v.record(v.string(), v.number()),
    drillsByDifficulty: v.record(v.string(), v.number()),
    drills: v.array(
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
  }),
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

    // Group drills by category
    const drillsByCategory: Record<string, number> = {};
    drills.forEach((drill) => {
      drillsByCategory[drill.category] = (drillsByCategory[drill.category] || 0) + 1;
    });

    // Group drills by difficulty
    const drillsByDifficulty: Record<string, number> = {};
    drills.forEach((drill) => {
      drillsByDifficulty[drill.difficulty] = (drillsByDifficulty[drill.difficulty] || 0) + 1;
    });

    return {
      totalDrills: drills.length,
      drillsByCategory,
      drillsByDifficulty,
      drills,
    };
  },
});

/**
 * Test logging a drill session
 */
export const testLogDrillSession = mutation({
  args: {
    userId: v.string(),
    drillId: v.id("drills"),
    notes: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    session: v.union(
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
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    try {
      // Verify the drill exists
      const drill = await ctx.db.get(args.drillId);
      if (!drill) {
        throw new Error("Drill not found");
      }

      // Verify the user exists
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

      return {
        success: true,
        session,
        message: `Successfully logged drill session for user: ${args.userId}`,
      };
    } catch (error) {
      return {
        success: false,
        session: null,
        message: `Failed to log drill session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  },
});

/**
 * Test getting user drill history
 */
export const testGetDrillHistory = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    totalSessions: v.number(),
    sessions: v.array(
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

    return {
      totalSessions: sessionsWithDetails.length,
      sessions: sessionsWithDetails,
    };
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
    const sessionsBySkill: Array<{ skillName: string; skillId: Id<"skills">; sessionCount: number; lastCompleted?: number }> = [];
    const skillMap = new Map<string, { skillName: string; skillId: Id<"skills">; sessionCount: number; lastCompleted?: number }>();
    
    validSessions.forEach(({ session, skill }) => {
      const key = skill._id;
      const existing = skillMap.get(key);
      if (existing) {
        existing.sessionCount++;
        if (session.completedAt > (existing.lastCompleted || 0)) {
          existing.lastCompleted = session.completedAt;
        }
      } else {
        skillMap.set(key, {
          skillName: skill.name,
          skillId: skill._id,
          sessionCount: 1,
          lastCompleted: session.completedAt,
        });
      }
    });

    // Convert map to array
    sessionsBySkill.push(...Array.from(skillMap.values()));

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
      sessionsBySkill,
      sessionsByDifficulty,
      sessionsByCategory,
    };
  },
}); 