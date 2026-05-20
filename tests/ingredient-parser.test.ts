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

  it("splits Burmese ingredients using Burmese separators U+104A and U+104B", () => {
    expect(parseIngredients("ကြက်သား၊ ကြက်သွန်နီ။ ကြက်သွန်ဖြူ၊ ခရမ်းချဉ်သီး")).toEqual([
      "ကြက်သား",
      "ကြက်သွန်နီ",
      "ကြက်သွန်ဖြူ",
      "ခရမ်းချဉ်သီး",
    ]);
  });
});
