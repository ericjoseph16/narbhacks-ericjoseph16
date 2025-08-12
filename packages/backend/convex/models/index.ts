// Business logic models and sample data for seeding

import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import type {
  SampleDrill,
  SampleDrillSession,
  SampleSkill,
  SampleUser,
} from "../utils/types";

// Sample data for testing
export const sampleUsers: SampleUser[] = [
  {
    userId: "user_2abc123def456",
    name: "Alex Johnson",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
  },
  {
    userId: "user_3def456ghi789",
    name: "Sarah Chen",
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
  },
  {
    userId: "user_4ghi789jkl012",
    name: "Mike Rodriguez",
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  },
];

export const sampleSkills: SampleSkill[] = [
  {
    name: "Basketball",
    categories: ["shooting", "dribbling", "defense", "passing", "rebounding"],
    public: true,
    createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Piano",
    categories: [
      "scales",
      "chords",
      "sight-reading",
      "improvisation",
      "classical",
    ],
    public: true,
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
  },
  {
    name: "LeetCode",
    categories: ["arrays", "strings", "trees", "graphs", "dynamic-programming"],
    public: true,
    createdAt: Date.now() - 18 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Guitar",
    categories: ["strumming", "fingerpicking", "chords", "scales", "songs"],
    public: true,
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Cooking",
    categories: [
      "knife-skills",
      "sauces",
      "baking",
      "grilling",
      "meal-planning",
    ],
    public: true,
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
  },
  {
    name: "Photography",
    categories: [
      "composition",
      "lighting",
      "editing",
      "portraits",
      "landscape",
    ],
    public: true,
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
  },
];

// Sample drills (will be populated after skills are created)
export const getSampleDrills = (
  skillIds: Record<string, Id<"skills">>
): SampleDrill[] => [
  // Basketball drills
  {
    skillId: skillIds["Basketball"],
    category: "shooting",
    difficulty: "Beginner",
    description:
      "Practice free throws for 15 minutes. Focus on proper form: feet shoulder-width apart, knees slightly bent, follow through with your shooting hand. Aim for 70% accuracy.",
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    createdBy: "user_2abc123def456",
  },
  {
    skillId: skillIds["Basketball"],
    category: "dribbling",
    difficulty: "Intermediate",
    description:
      "Practice crossover dribbles while walking up and down the court. Start with basic crossovers, then progress to behind-the-back and between-the-legs moves. Do 3 sets of 10 reps each.",
    createdAt: Date.now() - 18 * 24 * 60 * 60 * 1000,
    createdBy: "user_2abc123def456",
  },
  {
    skillId: skillIds["Basketball"],
    category: "defense",
    difficulty: "Advanced",
    description:
      "Defensive slide drills: Set up cones in a zigzag pattern. Practice defensive slides while maintaining proper stance. Focus on quick direction changes and keeping your hands up.",
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    createdBy: "user_3def456ghi789",
  },

  // Piano drills
  {
    skillId: skillIds["Piano"],
    category: "scales",
    difficulty: "Beginner",
    description:
      "Practice C major scale with both hands, 2 octaves up and down. Focus on even timing and proper finger positioning. Play at 60 BPM for 10 minutes.",
    createdAt: Date.now() - 19 * 24 * 60 * 60 * 1000,
    createdBy: "user_3def456ghi789",
  },
  {
    skillId: skillIds["Piano"],
    category: "chords",
    difficulty: "Intermediate",
    description:
      "Practice major and minor triads in all keys. Play each chord 4 times with a metronome at 80 BPM. Focus on smooth transitions between chords.",
    createdAt: Date.now() - 16 * 24 * 60 * 60 * 1000,
    createdBy: "user_3def456ghi789",
  },
  {
    skillId: skillIds["Piano"],
    category: "sight-reading",
    difficulty: "Advanced",
    description:
      "Sight-read a new piece of music for 20 minutes. Choose something slightly above your current level. Focus on reading ahead and maintaining steady tempo.",
    createdAt: Date.now() - 12 * 24 * 60 * 60 * 1000,
    createdBy: "user_4ghi789jkl012",
  },

  // LeetCode drills
  {
    skillId: skillIds["LeetCode"],
    category: "arrays",
    difficulty: "Beginner",
    description:
      "Solve 3 array problems: Two Sum, Remove Duplicates from Sorted Array, and Best Time to Buy and Sell Stock. Focus on understanding the problem before coding.",
    createdAt: Date.now() - 17 * 24 * 60 * 60 * 1000,
    createdBy: "user_4ghi789jkl012",
  },
  {
    skillId: skillIds["LeetCode"],
    category: "trees",
    difficulty: "Intermediate",
    description:
      "Practice tree traversal problems: Binary Tree Inorder Traversal, Maximum Depth of Binary Tree, and Validate Binary Search Tree. Implement both recursive and iterative solutions.",
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
    createdBy: "user_2abc123def456",
  },
  {
    skillId: skillIds["LeetCode"],
    category: "dynamic-programming",
    difficulty: "Advanced",
    description:
      "Solve Climbing Stairs, House Robber, and Longest Increasing Subsequence. Focus on identifying the optimal substructure and overlapping subproblems.",
    createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    createdBy: "user_3def456ghi789",
  },

  // Guitar drills
  {
    skillId: skillIds["Guitar"],
    category: "chords",
    difficulty: "Beginner",
    description:
      "Practice transitioning between G, C, and D major chords. Strum each chord 4 times before changing. Focus on clean chord changes without buzzing strings.",
    createdAt: Date.now() - 11 * 24 * 60 * 60 * 1000,
    createdBy: "user_4ghi789jkl012",
  },
  {
    skillId: skillIds["Guitar"],
    category: "fingerpicking",
    difficulty: "Intermediate",
    description:
      "Practice Travis picking pattern with G, C, and D chords. Use thumb for bass notes and fingers for melody. Start slow and gradually increase tempo.",
    createdAt: Date.now() - 8 * 24 * 60 * 60 * 1000,
    createdBy: "user_2abc123def456",
  },

  // Cooking drills
  {
    skillId: skillIds["Cooking"],
    category: "knife-skills",
    difficulty: "Beginner",
    description:
      "Practice basic knife cuts: julienne, brunoise, and chiffonade. Use carrots, celery, and herbs. Focus on consistent size and proper knife grip.",
    createdAt: Date.now() - 9 * 24 * 60 * 60 * 1000,
    createdBy: "user_3def456ghi789",
  },

  // Photography drills
  {
    skillId: skillIds["Photography"],
    category: "composition",
    difficulty: "Beginner",
    description:
      "Practice rule of thirds composition. Take 20 photos of everyday objects, placing the main subject at the intersection points of the rule of thirds grid.",
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    createdBy: "user_4ghi789jkl012",
  },
];

// Sample drill sessions (will be populated after drills are created)
export const getSampleDrillSessions = (
  userIds: string[],
  drillIds: Id<"drills">[]
): SampleDrillSession[] => [
  // Alex's sessions
  {
    userId: userIds[0],
    drillId: drillIds[0], // Basketball shooting
    completedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    notes:
      "Great session! Hit 75% of free throws. Need to work on consistency.",
  },
  {
    userId: userIds[0],
    drillId: drillIds[3], // Piano scales
    completedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    notes:
      "C major scale is getting smoother. Need to practice with metronome more.",
  },
  {
    userId: userIds[0],
    drillId: drillIds[6], // LeetCode arrays
    completedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    notes:
      "Two Sum was easy, but struggled with the stock problem. Need to review dynamic programming concepts.",
  },

  // Sarah's sessions
  {
    userId: userIds[1],
    drillId: drillIds[1], // Basketball dribbling
    completedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    notes: "Crossover moves are improving! Behind-the-back still needs work.",
  },
  {
    userId: userIds[1],
    drillId: drillIds[4], // Piano chords
    completedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    notes:
      "Chord transitions are getting faster. Minor chords still feel awkward.",
  },
  {
    userId: userIds[1],
    drillId: drillIds[7], // LeetCode trees
    completedAt: Date.now() - 4 * 24 * 60 * 60 * 1000,
    notes:
      "Tree traversal is clicking! Recursive solutions are more intuitive for me.",
  },

  // Mike's sessions
  {
    userId: userIds[2],
    drillId: drillIds[2], // Basketball defense
    completedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    notes:
      "Defensive slides are exhausting but effective. Need to work on stamina.",
  },
  {
    userId: userIds[2],
    drillId: drillIds[5], // Piano sight-reading
    completedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    notes:
      "Sight-reading is challenging but rewarding. Need to practice reading ahead more.",
  },
  {
    userId: userIds[2],
    drillId: drillIds[8], // LeetCode dynamic programming
    completedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    notes:
      "DP problems are tough! Need to draw out the problem more before coding.",
  },
];
