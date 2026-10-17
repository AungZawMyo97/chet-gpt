import type { RecipeDifficulty, RecipeStyle } from "./recipe";

export const recipeKnowledgeTags = [
  "quick",
  "family",
  "spicy",
  "healthy",
  "budget",
] as const;

export type RecipeKnowledgeTag = (typeof recipeKnowledgeTags)[number];

export interface RecipeDocument {
  id: string;
  title: string;
  burmeseTitle: string;
  summary: string;
  timeMinutes: number;
  difficulty: RecipeDifficulty;
  servings: number;
  ingredients: string[];
  steps: string[];
  tags: RecipeKnowledgeTag[];
}

export interface RecipeQuery {
  ingredients: string[];
  style: RecipeStyle;
  limit: number;
}

export interface RecipeIndexEntry {
  id: string;
  vector: number[];
}

export interface RecipeIndex {
  model: string;
  dimensions: number;
  entries: RecipeIndexEntry[];
}
