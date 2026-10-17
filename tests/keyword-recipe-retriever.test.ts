import { describe, expect, it } from "vitest";

import type { RecipeDocument } from "../src/features/recipes/domain/recipe-knowledge";
import { KeywordRecipeRetriever } from "../src/features/recipes/infrastructure/keyword-recipe-retriever";

function createDocument(
  overrides: Partial<RecipeDocument> & { id: string },
): RecipeDocument {
  return {
    title: "Test Recipe",
    burmeseTitle: "စမ်းသပ်ဟင်း",
    summary: "Simple recipe.",
    timeMinutes: 20,
    difficulty: "Easy",
    servings: 2,
    ingredients: [],
    steps: ["Cook."],
    tags: [],
    ...overrides,
  };
}

const documents = [
  createDocument({
    id: "egg-rice",
    ingredients: ["cooked rice", "eggs", "shallots"],
    tags: ["quick"],
  }),
  createDocument({
    id: "chicken-curry",
    ingredients: ["chicken", "onion", "garlic"],
    tags: ["family"],
  }),
  createDocument({
    id: "tomato-salad",
    ingredients: ["tomatoes", "shallots", "lime"],
    tags: ["quick", "healthy"],
  }),
];

const retriever = new KeywordRecipeRetriever(documents);

describe("KeywordRecipeRetriever", () => {
  it("ranks recipes by ingredient coverage", async () => {
    const results = await retriever.retrieve({
      ingredients: ["chicken", "onion"],
      style: "any",
      limit: 3,
    });

    expect(results[0]?.id).toBe("chicken-curry");
  });

  it("matches partial ingredient names in both directions", async () => {
    const results = await retriever.retrieve({
      ingredients: ["egg"],
      style: "any",
      limit: 3,
    });

    expect(results[0]?.id).toBe("egg-rice");
  });

  it("boosts recipes that match the cooking style", async () => {
    const withoutStyle = await retriever.retrieve({
      ingredients: ["shallots"],
      style: "any",
      limit: 3,
    });
    const withHealthy = await retriever.retrieve({
      ingredients: ["shallots"],
      style: "healthy",
      limit: 3,
    });

    expect(withoutStyle[0]?.id).toBe("egg-rice");
    expect(withHealthy[0]?.id).toBe("tomato-salad");
  });

  it("ignores case and extra whitespace in ingredients", async () => {
    const results = await retriever.retrieve({
      ingredients: ["  Shallots  "],
      style: "any",
      limit: 1,
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("egg-rice");
  });

  it("returns nothing when no recipe matches", async () => {
    const results = await retriever.retrieve({
      ingredients: ["durian"],
      style: "any",
      limit: 3,
    });

    expect(results).toEqual([]);
  });

  it("returns nothing for an empty ingredient list", async () => {
    const results = await retriever.retrieve({
      ingredients: [],
      style: "any",
      limit: 3,
    });

    expect(results).toEqual([]);
  });
});
