export const recipeStyles = [
  "any",
  "quick",
  "family",
  "spicy",
  "healthy",
  "budget",
] as const;

export type RecipeStyle = (typeof recipeStyles)[number];

export type RecipeDifficulty = "Easy" | "Medium" | "Hard";

export interface RecipeSuggestion {
  id: string;
  title: string;
  burmeseTitle: string;
  summary: string;
  cookTimeMinutes: number;
  difficulty: RecipeDifficulty;
  matchingIngredients: string[];
  missingIngredients: string[];
  steps: string[];
  tips: string[];
}

export interface RecipeRequest {
  ingredients: string[];
  style: RecipeStyle;
}

export interface RecipeResult {
  recipes: RecipeSuggestion[];
  source: "ai" | "local";
  note?: string;
}
