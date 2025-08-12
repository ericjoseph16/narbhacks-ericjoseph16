// TypeScript interfaces for the Skill Drill Generator app

import type { Id } from "../_generated/dataModel";

export interface User {
  _id: Id<"users">;
  userId: string; // Clerk user ID
  name?: string;
  createdAt: number;
}

export interface Skill {
  _id: Id<"skills">;
  name: string;
  categories: string[];
  createdBy?: string;
  public: boolean;
  createdAt: number;
}

export interface Drill {
  _id: Id<"drills">;
  skillId: Id<"skills">;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  createdAt: number;
  createdBy: string;
}

export interface DrillSession {
  _id: Id<"drillSessions">;
  userId: string;
  drillId: Id<"drills">;
  completedAt: number;
  notes?: string;
}

// Sample data types for seeding
export interface SampleUser {
  userId: string;
  name?: string;
  createdAt: number;
}

export interface SampleSkill {
  name: string;
  categories: string[];
  createdBy?: string;
  public: boolean;
  createdAt: number;
}

export interface SampleDrill {
  skillId: Id<"skills">;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  createdAt: number;
  createdBy: string;
}

export interface SampleDrillSession {
  userId: string;
  drillId: Id<"drills">;
  completedAt: number;
  notes?: string;
}
