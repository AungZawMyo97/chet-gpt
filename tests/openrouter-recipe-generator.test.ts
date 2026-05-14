import { afterEach, describe, expect, it, vi } from "vitest";

import { OpenRouterRecipeGenerator } from "../src/features/recipes/infrastructure/openrouter-recipe-generator";
import { LocalRecipeGenerator } from "../src/features/recipes/infrastructure/local-recipe-generator";

describe("OpenRouterRecipeGenerator", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns local recipes without exposing provider failure details", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: {
            code: 429,
            message: "Rate limit exceeded.",
          },
        }),
        {
          status: 429,
          statusText: "Too Many Requests",
          headers: { "content-type": "application/json" },
        },
      ),
    );

    const generator = new OpenRouterRecipeGenerator(
      "sk-or-test",
      new LocalRecipeGenerator(),
      "test-model",
    );

    const result = await generator.generate({
      ingredients: ["chicken", "onion"],
      style: "any",
    });

    expect(result.source).toBe("local");
    expect(result.note).toBe(
      "OpenRouter is not available now, so local recipe suggestions are shown.",
    );
    expect(result.note).not.toContain("Rate limit exceeded.");
    expect(console.warn).toHaveBeenCalledWith(
      "OpenRouter recipe request failed.",
      expect.stringContaining("429"),
    );
  });
});
