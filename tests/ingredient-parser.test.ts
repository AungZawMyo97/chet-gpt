import { describe, expect, it } from "vitest";

import { parseIngredients } from "../src/features/recipes/domain/ingredient-parser";

describe("parseIngredients", () => {
  it("splits ingredients and removes duplicates", () => {
    expect(parseIngredients("Chicken, onion\nshallot; Onion")).toEqual([
      "chicken",
      "onion",
      "shallot",
    ]);
  });
});
