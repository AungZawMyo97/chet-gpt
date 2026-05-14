import { describe, expect, it } from "vitest";

import { LocalRecipeGenerator } from "../src/features/recipes/infrastructure/local-recipe-generator";

describe("LocalRecipeGenerator", () => {
  it("returns practical Burmese recipe suggestions", async () => {
    const generator = new LocalRecipeGenerator();

    const result = await generator.generate({
      ingredients: ["chicken", "onion"],
      style: "quick",
    });

    expect(result.source).toBe("local");
    expect(result.recipes).toHaveLength(3);
    expect(result.recipes[0].burmeseTitle).toContain("chicken");
    expect(result.recipes[0].steps.length).toBeGreaterThan(2);
  });
});
