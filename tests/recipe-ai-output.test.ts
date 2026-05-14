import { describe, expect, it } from "vitest";

import { parseRecipeOutput } from "../src/features/recipes/infrastructure/recipe-ai-output";

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
