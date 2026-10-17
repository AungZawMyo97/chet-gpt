import { afterEach, describe, expect, it, vi } from "vitest";

import {
  GenerateRecipesUseCase,
  type RecipeGenerator,
} from "../src/features/recipes/application/generate-recipes-use-case";
import type { RecipeRetriever } from "../src/features/recipes/application/retrieve-recipes";
import type {
  RecipeRequest,
  RecipeResult,
} from "../src/features/recipes/domain/recipe";
import type { RecipeDocument } from "../src/features/recipes/domain/recipe-knowledge";

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

function createGenerator() {
  const calls: Array<{
    request: RecipeRequest;
    sourceRecipes?: RecipeDocument[];
  }> = [];

  const generator: RecipeGenerator = {
    async generate(request, sourceRecipes): Promise<RecipeResult> {
      calls.push({ request, sourceRecipes });
      return { recipes: [], source: "ai" };
    },
  };

  return { generator, calls };
}

describe("GenerateRecipesUseCase", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("passes retrieved knowledge base recipes to the generator", async () => {
    const { generator, calls } = createGenerator();
    const retriever: RecipeRetriever = {
      async retrieve(query) {
        expect(query).toEqual({
          ingredients: ["eggs", "rice"],
          style: "quick",
          limit: 3,
        });
        return [sourceRecipe];
      },
    };

    const useCase = new GenerateRecipesUseCase(generator, retriever);
    await useCase.execute({ ingredients: [" Eggs ", "rice"], style: "quick" });

    expect(calls).toHaveLength(1);
    expect(calls[0]?.sourceRecipes).toEqual([sourceRecipe]);
    expect(calls[0]?.request).toEqual({
      ingredients: ["eggs", "rice"],
      style: "quick",
      model: undefined,
    });
  });

  it("continues without source recipes when retrieval fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { generator, calls } = createGenerator();
    const retriever: RecipeRetriever = {
      async retrieve() {
        throw new Error("Retrieval service down.");
      },
    };

    const useCase = new GenerateRecipesUseCase(generator, retriever);
    const result = await useCase.execute({
      ingredients: ["eggs"],
      style: "any",
    });

    expect(result.source).toBe("ai");
    expect(calls[0]?.sourceRecipes).toEqual([]);
    expect(console.warn).toHaveBeenCalledWith(
      "Recipe knowledge retrieval failed, continuing without source recipes.",
      expect.stringContaining("Retrieval service down."),
    );
  });

  it("works without a retriever configured", async () => {
    const { generator, calls } = createGenerator();
    const useCase = new GenerateRecipesUseCase(generator);

    await useCase.execute({ ingredients: ["eggs"], style: "any" });

    expect(calls[0]?.sourceRecipes).toEqual([]);
  });

  it("rejects requests without ingredients", async () => {
    const { generator } = createGenerator();
    const useCase = new GenerateRecipesUseCase(generator);

    await expect(
      useCase.execute({ ingredients: ["   "], style: "any" }),
    ).rejects.toThrow();
  });
});
