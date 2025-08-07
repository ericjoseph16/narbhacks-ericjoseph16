// Test functions to demonstrate Phase 1 functionality

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
 * Get a summary of all skills and drills in the database
 */
export const getDatabaseSummary = query({
  args: {},
  returns: v.object({
    totalSkills: v.number(),
    totalDrills: v.number(),
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