import type {
  RecipeDocument,
  RecipeIndex,
  RecipeIndexEntry,
  RecipeKnowledgeTag,
} from "@/features/recipes/domain/recipe-knowledge";
import { recipeKnowledgeTags } from "@/features/recipes/domain/recipe-knowledge";
import recipesData from "@/features/recipes/infrastructure/knowledge/recipes.json";
import indexData from "@/features/recipes/infrastructure/knowledge/recipe-index.json";

export function loadRecipeDocuments(): RecipeDocument[] {
  if (!Array.isArray(recipesData)) {
    return [];
  }

  return recipesData.filter(isRecipeDocument);
}

export function loadRecipeIndex(): RecipeIndex | null {
  return isRecipeIndex(indexData) ? indexData : null;
}

function isRecipeDocument(value: unknown): value is RecipeDocument {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.burmeseTitle === "string" &&
    typeof value.summary === "string" &&
    typeof value.timeMinutes === "number" &&
    isDifficulty(value.difficulty) &&
    typeof value.servings === "number" &&
    isStringList(value.ingredients) &&
    isStringList(value.steps) &&
    Array.isArray(value.tags) &&
    value.tags.every(isKnowledgeTag)
  );
}

function isRecipeIndex(value: unknown): value is RecipeIndex {
  if (
    !isRecord(value) ||
    typeof value.model !== "string" ||
    typeof value.dimensions !== "number" ||
    value.dimensions <= 0
  ) {
    return false;
  }

  const { dimensions, entries } = value;

  return (
    Array.isArray(entries) &&
    entries.every((entry) => isIndexEntry(entry, dimensions))
  );
}

function isIndexEntry(
  value: unknown,
  dimensions: number,
): value is RecipeIndexEntry {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    Array.isArray(value.vector) &&
    value.vector.length === dimensions &&
    value.vector.every((item) => typeof item === "number")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isKnowledgeTag(value: unknown): value is RecipeKnowledgeTag {
  return (recipeKnowledgeTags as readonly string[]).includes(value as string);
}

function isDifficulty(value: unknown): value is RecipeDocument["difficulty"] {
  return value === "Easy" || value === "Medium" || value === "Hard";
}
