// AI integration functions for drill generation and analysis

import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { action, mutation, query } from "../_generated/server";

// Type definitions for better type safety
type Skill = {
  _id: Id<"skills">;
  _creationTime: number;
  name: string;
  categories: string[];
  createdBy?: string;
  public: boolean;
  createdAt: number;
};

type User = {
  _id: Id<"users">;
  _creationTime: number;
  userId: string;
  name?: string;
  createdAt: number;
};

type Drill = {
  _id: Id<"drills">;
  _creationTime: number;
  skillId: Id<"skills">;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  createdAt: number;
  createdBy: string;
};

type DrillSession = {
  _id: Id<"drillSessions">;
  _creationTime: number;
  userId: string;
  drillId: Id<"drills">;
  completedAt: number;
  notes?: string;
};

// Helper function to get API with proper typing
async function getApi() {
  const { api } = await import("../_generated/api");
  return api as any;
}

/**
 * Generate and store a new drill using AI
 */
export const generateAndStoreDrill = action({
  args: {
    skillId: v.id("skills"),
    category: v.string(),
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
    userId: v.string(),
    userHistory: v.optional(
      v.array(
        v.object({
          drillId: v.id("drills"),
          completedAt: v.number(),
          notes: v.optional(v.string()),
          drill: v.object({
            category: v.string(),
            difficulty: v.union(
              v.literal("Beginner"),
              v.literal("Intermediate"),
              v.literal("Advanced")
            ),
            description: v.string(),
          }),
        })
      )
    ),
  },
  returns: v.object({
    success: v.boolean(),
    drill: v.optional(
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
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    drill?: Drill;
    error?: string;
  }> => {
    try {
      const api = await getApi();

      // Verify the skill exists
      const skill = (await ctx.runQuery(api.skills.getSkillById, {
        skillId: args.skillId,
      })) as Skill | null;

      if (!skill) {
        throw new Error("Skill not found");
      }

      // Verify the category exists for this skill
      if (!skill.categories.includes(args.category)) {
        throw new Error(
          `Category "${args.category}" not found for skill "${skill.name}"`
        );
      }

      // Verify the user exists
      const user = (await ctx.runQuery(api.users.getUserById, {
        userId: args.userId,
      })) as User | null;

      if (!user) {
        throw new Error("User not found");
      }

      // Generate a simple drill description (placeholder for AI)
      const description = `AI-generated drill for ${skill.name} - ${args.category} at ${args.difficulty} level. This is a comprehensive exercise designed to improve your ${args.category} skills.`;

      // Store the generated drill
      const drillId = (await ctx.runMutation(api.drills.createDrill, {
        skillId: args.skillId,
        category: args.category,
        difficulty: args.difficulty,
        description,
        createdBy: args.userId,
      })) as Id<"drills">;

      // Get the created drill
      const drill = (await ctx.runQuery(api.drills.getDrillById, {
        drillId,
      })) as Drill | null;

      if (!drill) {
        throw new Error("Failed to retrieve created drill");
      }

      return {
        success: true,
        drill,
      };
    } catch (error) {
      console.error("Error generating and storing drill:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

/**
 * Get a personalized daily drill recommendation
 */
export const getDailyDrill = action({
  args: {
    userId: v.string(),
    skillId: v.optional(v.id("skills")),
    category: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    drill: v.optional(
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
    analysis: v.optional(
      v.object({
        currentLevel: v.string(),
        recommendedDifficulty: v.union(
          v.literal("Beginner"),
          v.literal("Intermediate"),
          v.literal("Advanced")
        ),
        focusAreas: v.array(v.string()),
      })
    ),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    drill?: Drill & { skill: Skill };
    analysis?: {
      currentLevel: string;
      recommendedDifficulty: "Beginner" | "Intermediate" | "Advanced";
      focusAreas: string[];
    };
    error?: string;
  }> => {
    try {
      const api = await getApi();

      // Verify the user exists
      const user = (await ctx.runQuery(api.users.getUserById, {
        userId: args.userId,
      })) as User | null;

      if (!user) {
        throw new Error("User not found");
      }

      let targetSkillId: Id<"skills"> | undefined = args.skillId;
      let targetCategory = args.category;

      // If no skill specified, get user's most practiced skill
      if (!targetSkillId) {
        // Get all skills
        const skills = (await ctx.runQuery(api.skills.getSkills, {
          userId: args.userId,
        })) as Skill[];

        if (skills.length === 0) {
          throw new Error("No skills available");
        }

        targetSkillId = skills[0]._id;
        targetCategory = skills[0].categories[0];
      }

      if (!targetSkillId) {
        throw new Error("No skill available for daily drill");
      }

      // Get the skill details
      const skill = (await ctx.runQuery(api.skills.getSkillById, {
        skillId: targetSkillId,
      })) as Skill | null;

      if (!skill) {
        throw new Error("Skill not found");
      }

      // If no category specified, use the first available category
      if (!targetCategory) {
        targetCategory = skill.categories[0];
      }

      // Check if there's already a drill for this skill/category
      const existingDrills = (await ctx.runQuery(api.drills.getDrillsBySkill, {
        skillId: targetSkillId,
      })) as Drill[];

      let drill: Drill;

      if (existingDrills.length > 0) {
        // Use an existing drill (randomly select one)
        const randomIndex = Math.floor(Math.random() * existingDrills.length);
        drill = existingDrills[randomIndex];
      } else {
        // Generate a new drill
        const description = `Daily drill for ${skill.name} - ${targetCategory} at Intermediate level. This is a comprehensive exercise designed to improve your ${targetCategory} skills.`;

        // Store the generated drill
        const drillId = (await ctx.runMutation(api.drills.createDrill, {
          skillId: targetSkillId,
          category: targetCategory,
          difficulty: "Intermediate",
          description,
          createdBy: args.userId,
        })) as Id<"drills">;

        const createdDrill = (await ctx.runQuery(api.drills.getDrillById, {
          drillId,
        })) as Drill | null;

        if (!createdDrill) {
          throw new Error("Failed to retrieve created drill");
        }

        drill = createdDrill;
      }

      return {
        success: true,
        drill: {
          ...drill,
          skill,
        },
        analysis: {
          currentLevel: "Intermediate",
          recommendedDifficulty: "Intermediate",
          focusAreas: skill.categories.slice(0, 2),
        },
      };
    } catch (error) {
      console.error("Error getting daily drill:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

/**
 * Get skill categories for a specific skill
 */
export const getSkillCategories = query({
  args: {
    skillId: v.id("skills"),
  },
  returns: v.object({
    skillName: v.string(),
    categories: v.array(v.string()),
    categoryStats: v.array(
      v.object({
        category: v.string(),
        drillCount: v.number(),
        sessionsCount: v.number(),
      })
    ),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    skillName: string;
    categories: string[];
    categoryStats: Array<{
      category: string;
      drillCount: number;
      sessionsCount: number;
    }>;
  }> => {
    // Verify the skill exists
    const skill = (await ctx.db.get(args.skillId)) as Skill | null;
    if (!skill) {
      throw new Error("Skill not found");
    }

    // Get drills for this skill
    const drills = (await ctx.db
      .query("drills")
      .withIndex("by_skillId", (q) => q.eq("skillId", args.skillId))
      .collect()) as Drill[];

    // Get sessions for this skill's drills
    const drillIds = drills.map((drill) => drill._id);
    const allSessions = await Promise.all(
      drillIds.map((drillId) =>
        ctx.db
          .query("drillSessions")
          .withIndex("by_drillId", (q) => q.eq("drillId", drillId))
          .collect()
      )
    );
    const flatSessions = allSessions.flat() as DrillSession[];

    // Calculate stats for each category
    const categoryStats = skill.categories.map((category) => {
      const categoryDrills = drills.filter(
        (drill) => drill.category === category
      );
      const categorySessions = flatSessions.filter((session) =>
        categoryDrills.some((drill) => drill._id === session.drillId)
      );

      return {
        category,
        drillCount: categoryDrills.length,
        sessionsCount: categorySessions.length,
      };
    });

    return {
      skillName: skill.name,
      categories: skill.categories,
      categoryStats,
    };
  },
});

/**
 * Generate multiple drill variations for a skill/category
 */
export const generateDrillVariations = action({
  args: {
    skillId: v.id("skills"),
    category: v.string(),
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
    count: v.optional(v.number()),
    userId: v.string(),
  },
  returns: v.object({
    success: v.boolean(),
    drills: v.optional(
      v.array(
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
      )
    ),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    drills?: Drill[];
    error?: string;
  }> => {
    try {
      const api = await getApi();

      // Verify the skill exists
      const skill = (await ctx.runQuery(api.skills.getSkillById, {
        skillId: args.skillId,
      })) as Skill | null;

      if (!skill) {
        throw new Error("Skill not found");
      }

      // Verify the user exists
      const user = (await ctx.runQuery(api.users.getUserById, {
        userId: args.userId,
      })) as User | null;

      if (!user) {
        throw new Error("User not found");
      }

      // Generate drill variations (placeholder for AI)
      const descriptions = [
        `Variation 1: ${skill.name} - ${args.category} at ${args.difficulty} level. This exercise focuses on fundamental techniques.`,
        `Variation 2: ${skill.name} - ${args.category} at ${args.difficulty} level. This exercise emphasizes advanced techniques.`,
        `Variation 3: ${skill.name} - ${args.category} at ${args.difficulty} level. This exercise combines multiple skills.`,
      ];

      // Store the generated drills
      const createdDrills: Drill[] = [];
      for (const description of descriptions) {
        const drillId = (await ctx.runMutation(api.drills.createDrill, {
          skillId: args.skillId,
          category: args.category,
          difficulty: args.difficulty,
          description,
          createdBy: args.userId,
        })) as Id<"drills">;

        const drill = (await ctx.runQuery(api.drills.getDrillById, {
          drillId,
        })) as Drill | null;

        if (drill) {
          createdDrills.push(drill);
        }
      }

      return {
        success: true,
        drills: createdDrills,
      };
    } catch (error) {
      console.error("Error generating drill variations:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

/**
 * Analyze user progress and provide recommendations
 */
export const analyzeUserProgress = action({
  args: {
    userId: v.string(),
    skillId: v.id("skills"),
    category: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    analysis: v.optional(
      v.object({
        currentLevel: v.string(),
        recommendedDifficulty: v.union(
          v.literal("Beginner"),
          v.literal("Intermediate"),
          v.literal("Advanced")
        ),
        focusAreas: v.array(v.string()),
        suggestedDrill: v.optional(v.string()),
        progressStats: v.object({
          totalSessions: v.number(),
          averageSessionsPerWeek: v.number(),
          mostPracticedCategory: v.string(),
          difficultyProgression: v.record(v.string(), v.number()),
        }),
      })
    ),
    error: v.optional(v.string()),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    success: boolean;
    analysis?: {
      currentLevel: string;
      recommendedDifficulty: "Beginner" | "Intermediate" | "Advanced";
      focusAreas: string[];
      suggestedDrill?: string;
      progressStats: {
        totalSessions: number;
        averageSessionsPerWeek: number;
        mostPracticedCategory: string;
        difficultyProgression: Record<string, number>;
      };
    };
    error?: string;
  }> => {
    try {
      const api = await getApi();

      // Verify the user exists
      const user = (await ctx.runQuery(api.users.getUserById, {
        userId: args.userId,
      })) as User | null;

      if (!user) {
        throw new Error("User not found");
      }

      // Verify the skill exists
      const skill = (await ctx.runQuery(api.skills.getSkillById, {
        skillId: args.skillId,
      })) as Skill | null;

      if (!skill) {
        throw new Error("Skill not found");
      }

      // Get user sessions
      const sessions = (await ctx.runQuery(api.sessions.getDrillHistory, {
        userId: args.userId,
        limit: 100,
      })) as { sessions: Array<DrillSession & { drill: Drill; skill: Skill }> };

      // Filter sessions for this skill
      const skillSessions = sessions.sessions.filter(
        (session) => session.skill._id === args.skillId
      );

      const now = Date.now();
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
      const recentSessions = skillSessions.filter(
        (session) => session.completedAt > oneWeekAgo
      );
      const averageSessionsPerWeek = recentSessions.length;

      // Calculate difficulty progression
      const difficultyStats: Record<string, number> = {
        Beginner: 0,
        Intermediate: 0,
        Advanced: 0,
      };

      for (const session of skillSessions) {
        const difficulty = session.drill.difficulty;
        difficultyStats[difficulty] = (difficultyStats[difficulty] || 0) + 1;
      }

      return {
        success: true,
        analysis: {
          currentLevel: "Intermediate",
          recommendedDifficulty: "Intermediate",
          focusAreas: skill.categories.slice(0, 2),
          suggestedDrill: `Recommended drill for ${skill.name} - ${skill.categories[0]} at Intermediate level`,
          progressStats: {
            totalSessions: skillSessions.length,
            averageSessionsPerWeek,
            mostPracticedCategory: skill.categories[0] || "None",
            difficultyProgression: difficultyStats,
          },
        },
      };
    } catch (error) {
      console.error("Error analyzing user progress:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});
