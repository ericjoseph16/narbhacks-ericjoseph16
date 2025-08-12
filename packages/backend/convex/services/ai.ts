// AI service functions for drill generation and analysis

import { GoogleGenerativeAI } from "@google/generative-ai";
import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { internalAction } from "../_generated/server";

/**
 * Generate a drill description using Google Gemini
 */
export const generateDrillDescription = internalAction({
  args: {
    skillName: v.string(),
    category: v.string(),
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
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
    skillCategories: v.array(v.string()),
    maxLength: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    description: v.optional(v.string()),
    error: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    try {
      // Get Google Gemini API key from environment
      const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error(
          "Google Gemini API key not found in environment variables"
        );
      }

      // Initialize Google Generative AI
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Build the prompt based on user history and requirements
      const prompt = buildDrillPrompt(args);

      try {
        // Call Google Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const description = response.text().trim();

        if (!description) {
          throw new Error("No description generated from Google Gemini");
        }

        return {
          success: true,
          description,
        };
      } catch (error) {
        console.error("Google Gemini API error:", error);
        throw new Error(
          `Google Gemini API error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
        );
      }
    } catch (error) {
      console.error("Error generating drill description:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  },
});

/**
 * Generate multiple drill variations using Google Gemini
 */
export const generateDrillVariations = internalAction({
  args: {
    skillName: v.string(),
    category: v.string(),
    difficulty: v.union(
      v.literal("Beginner"),
      v.literal("Intermediate"),
      v.literal("Advanced")
    ),
    count: v.optional(v.number()),
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
    skillCategories: v.array(v.string()),
    maxLength: v.optional(v.number()),
  },
  returns: v.object({
    success: v.boolean(),
    drills: v.optional(v.array(v.string())),
    error: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    try {
      // Get Google Gemini API key from environment
      const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error(
          "Google Gemini API key not found in environment variables"
        );
      }

      // Initialize Google Generative AI
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Build the prompt for multiple variations
      const prompt = buildDrillVariationsPrompt(args);

      try {
        // Call Google Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text().trim();

        if (!content) {
          throw new Error("No content generated from Google Gemini");
        }

        // Parse the variations (assuming they're numbered or separated)
        const variations = content
          .split(/\n\d+\.\s*|\n-\s*|\n\*\s*/)
          .filter((v: string) => v.trim())
          .slice(0, args.count || 3);

        return {
          success: true,
          drills: variations,
        };
      } catch (error) {
        console.error("Google Gemini API error:", error);
        throw new Error(
          `Google Gemini API error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
        );
      }
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
export const analyzeUserProgress = internalAction({
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
      })
    ),
    error: v.optional(v.string()),
  }),
  handler: async (_ctx, args) => {
    try {
      // Get Google Gemini API key from environment
      const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error(
          "Google Gemini API key not found in environment variables"
        );
      }

      // Initialize Google Generative AI
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Build the analysis prompt
      const prompt = buildAnalysisPrompt(args);

      try {
        // Call Google Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text().trim();

        if (!content) {
          throw new Error("No analysis generated from Google Gemini");
        }

        // Parse the analysis (simplified for now)
        const analysis = {
          currentLevel: "Intermediate",
          recommendedDifficulty: "Intermediate" as const,
          focusAreas: ["Technique", "Consistency"],
          suggestedDrill: content,
        };

        return {
          success: true,
          analysis,
        };
      } catch (error) {
        console.error("Google Gemini API error:", error);
        throw new Error(
          `Google Gemini API error: ${error instanceof Error ? error.message : "Unknown error occurred"}`
        );
      }
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

/**
 * Build a comprehensive prompt for drill generation
 */
function buildDrillPrompt(args: {
  skillName: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  userHistory?: Array<{
    drillId: Id<"drills">;
    completedAt: number;
    notes?: string;
    drill: {
      category: string;
      difficulty: "Beginner" | "Intermediate" | "Advanced";
      description: string;
    };
  }>;
  skillCategories: string[];
  maxLength?: number;
}): string {
  const { skillName, category, difficulty, userHistory, skillCategories } =
    args;

  let prompt = `Create a ${difficulty.toLowerCase()} level drill for ${skillName} - ${category} category.

Skill: ${skillName}
Category: ${category}
Difficulty: ${difficulty}
Available Categories: ${skillCategories.join(", ")}

Requirements:
- Make it specific and actionable
- Include clear instructions
- Focus on ${category} skills
- Appropriate for ${difficulty} level
- Engaging and progressive

`;

  if (userHistory && userHistory.length > 0) {
    prompt += `\nUser's recent drill history:\n`;
    userHistory.slice(-3).forEach((session, index) => {
      prompt += `${index + 1}. ${session.drill.category} - ${session.drill.difficulty}: ${session.drill.description}\n`;
      if (session.notes) {
        prompt += `   Notes: ${session.notes}\n`;
      }
    });
    prompt += `\nConsider the user's recent progress when creating this drill.\n`;
  }

  prompt += `\nPlease provide a detailed, step-by-step drill description that the user can follow immediately.`;

  return prompt;
}

/**
 * Build a prompt for generating multiple drill variations
 */
function buildDrillVariationsPrompt(args: {
  skillName: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  count?: number;
  userHistory?: Array<{
    drillId: Id<"drills">;
    completedAt: number;
    notes?: string;
    drill: {
      category: string;
      difficulty: "Beginner" | "Intermediate" | "Advanced";
      description: string;
    };
  }>;
  skillCategories: string[];
  maxLength?: number;
}): string {
  const {
    skillName,
    category,
    difficulty,
    count = 3,
    userHistory,
    skillCategories,
  } = args;

  let prompt = `Create ${count} different ${difficulty.toLowerCase()} level drill variations for ${skillName} - ${category} category.

Skill: ${skillName}
Category: ${category}
Difficulty: ${difficulty}
Available Categories: ${skillCategories.join(", ")}

Requirements for each variation:
- Make it specific and actionable
- Include clear instructions
- Focus on ${category} skills
- Appropriate for ${difficulty} level
- Engaging and progressive
- Each variation should be distinct and offer different approaches

`;

  if (userHistory && userHistory.length > 0) {
    prompt += `\nUser's recent drill history:\n`;
    userHistory.slice(-3).forEach((session, index) => {
      prompt += `${index + 1}. ${session.drill.category} - ${session.drill.difficulty}: ${session.drill.description}\n`;
      if (session.notes) {
        prompt += `   Notes: ${session.notes}\n`;
      }
    });
    prompt += `\nConsider the user's recent progress when creating these variations.\n`;
  }

  prompt += `\nPlease provide ${count} detailed, step-by-step drill variations that the user can follow immediately. Number each variation clearly.`;

  return prompt;
}

/**
 * Build a prompt for analyzing user progress
 */
function buildAnalysisPrompt(args: {
  userId: string;
  skillId: Id<"skills">;
  category?: string;
}): string {
  const { userId, skillId, category } = args;

  let prompt = `Analyze the progress for user ${userId} in skill ${skillId}`;

  if (category) {
    prompt += `, specifically in the ${category} category`;
  }

  prompt += `.

Please provide:
1. Current skill level assessment
2. Recommended difficulty for next drills
3. Focus areas that need improvement
4. Specific drill suggestions

Make your analysis specific, actionable, and encouraging.`;

  return prompt;
}
