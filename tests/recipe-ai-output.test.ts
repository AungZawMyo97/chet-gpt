import { describe, expect, it } from "vitest";

import type { RecipeDocument } from "../src/features/recipes/domain/recipe-knowledge";
import {
  buildRecipePrompt,
  parseRecipeOutput,
} from "../src/features/recipes/infrastructure/recipe-ai-output";

const sourceRecipe: RecipeDocument = {
  id: "egg-rice",
  title: "Burmese Egg Fried Rice",
  burmeseTitle: "ထမင်းကြော်",
  summary: "Simple fried rice.",
  timeMinutes: 15,
  difficulty: "Easy",
  servings: 2,
  ingredients: ["rice", "eggs"],
  steps: ["Fry the rice."],
  tags: ["quick"],
};

describe("buildRecipePrompt", () => {
  it("includes reference recipes when source recipes are provided", () => {
    const prompt = buildRecipePrompt(
      { ingredients: ["eggs"], style: "quick" },
      [sourceRecipe],
    );

    expect(prompt).toContain(
      "Reference 1: Burmese Egg Fried Rice / ထမင်းကြော်",
    );
    expect(prompt).toContain("Ingredients: rice, eggs");
    expect(prompt).toContain("Steps: Fry the rice.");
  });

  it("does not include reference recipes when there are none", () => {
    const prompt = buildRecipePrompt({ ingredients: ["eggs"], style: "quick" });

    expect(prompt).not.toContain("Reference 1:");
  });
});

describe("parseRecipeOutput", () => {
  it("sanitizes malformed recipe fields from AI output", () => {
    const recipes = parseRecipeOutput(
      JSON.stringify({
        recipes: [
          {
            id: "<script>alert(1)</script>",
            title: "",
            burmeseTitle: "AI curry",
            summary: "Nice curry",
            cookTimeMinutes: 999,
            difficulty: "Impossible",
            matchingIngredients: ["chicken", 42],
            missingIngredients: "fish sauce",
            steps: ["Cook", null],
            tips: ["Taste"],
          },
        ],
      }),
    );

    expect(recipes[0]).toMatchObject({
      id: "script-alert-1-script",
      title: "Recipe 1",
      cookTimeMinutes: 240,
      difficulty: "Easy",
      matchingIngredients: ["chicken"],
      missingIngredients: [],
      steps: ["Cook"],
    });
  });
});
