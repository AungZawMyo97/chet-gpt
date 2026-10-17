import { afterEach, describe, expect, it, vi } from "vitest";

import { GoogleGeminiRecipeGenerator } from "../src/features/recipes/infrastructure/google-gemini-recipe-generator";
import { LocalRecipeGenerator } from "../src/features/recipes/infrastructure/local-recipe-generator";

const mockGenerateContent = vi.fn();

vi.mock("@google/genai", () => {
  class MockGoogleGenAI {
    models = {
      generateContent: mockGenerateContent,
    };
  }
  return {
    GoogleGenAI: MockGoogleGenAI,
  };
});

describe("GoogleGeminiRecipeGenerator", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.unstubAllEnvs();
  });

  it("returns local recipes without exposing provider failure details", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    
    mockGenerateContent.mockRejectedValue(
      new Error("Rate limit exceeded.")
    );

    const generator = new GoogleGeminiRecipeGenerator(
      "test-api-key",
      new LocalRecipeGenerator(),
      "test-model",
    );

    const result = await generator.generate({
      ingredients: ["chicken", "onion"],
      style: "any",
    });

    expect(result.source).toBe("local");
    expect(result.note).toBe(
      "Google Gemini is not available now, so local recipe suggestions are shown."
    );
    expect(result.note).not.toContain("Rate limit exceeded.");
    expect(console.warn).toHaveBeenCalledWith(
      "Google Gemini recipe request failed.",
      expect.stringContaining("Rate limit exceeded."),
    );
  });

  it("uses the request-level model instead of constructor model when provided", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const mockResponse = {
      text: JSON.stringify({
        recipes: [
          {
            id: "test-id",
            title: "Test Recipe",
            burmeseTitle: "စမ်းသပ်ဟင်း",
            summary: "Test Summary",
            cookTimeMinutes: 20,
            difficulty: "Easy",
            matchingIngredients: ["chicken"],
            missingIngredients: [],
            steps: ["Step 1"],
            tips: ["Tip 1"],
          }
        ]
      })
    };

    mockGenerateContent.mockResolvedValue(mockResponse);

    const generator = new GoogleGeminiRecipeGenerator(
      "test-api-key",
      new LocalRecipeGenerator(),
      "constructor-model",
    );

    const result = await generator.generate({
      ingredients: ["chicken"],
      style: "any",
      model: "request-level-model",
    });

    expect(result.source).toBe("ai");
    expect(result.recipes).toHaveLength(1);
    expect(result.recipes[0].title).toBe("Test Recipe");

    expect(mockGenerateContent).toHaveBeenCalled();
    const callArgs = mockGenerateContent.mock.calls[0]?.[0];
    expect(callArgs?.model).toBe("request-level-model");
  });

  it("defaults to the gemini-3.8-flash model when no model is provided", async () => {
    vi.stubEnv("GEMINI_MODEL", "");

    const mockResponse = {
      text: JSON.stringify({
        recipes: [
          {
            id: "test-id",
            title: "Test Recipe",
            burmeseTitle: "စမ်းသပ်ဟင်း",
            summary: "Test Summary",
            cookTimeMinutes: 20,
            difficulty: "Easy",
            matchingIngredients: ["egg"],
            missingIngredients: [],
            steps: ["Step 1"],
            tips: ["Tip 1"],
          }
        ]
      })
    };

    mockGenerateContent.mockResolvedValue(mockResponse);

    const generator = new GoogleGeminiRecipeGenerator(
      "test-api-key",
      new LocalRecipeGenerator(),
    );

    const result = await generator.generate({
      ingredients: ["egg"],
      style: "any",
    });

    expect(result.source).toBe("ai");

    const callArgs = mockGenerateContent.mock.calls[0]?.[0];
    expect(callArgs?.model).toBe("gemini-3.8-flash");
  });

  it("includes knowledge base source recipes in the Gemini prompt", async () => {
    const mockResponse = {
      text: JSON.stringify({
        recipes: [
          {
            id: "test-id",
            title: "Test Recipe",
            burmeseTitle: "စမ်းသပ်ဟင်း",
            summary: "Test Summary",
            cookTimeMinutes: 20,
            difficulty: "Easy",
            matchingIngredients: ["egg"],
            missingIngredients: [],
            steps: ["Step 1"],
            tips: ["Tip 1"],
          }
        ]
      })
    };

    mockGenerateContent.mockResolvedValue(mockResponse);

    const generator = new GoogleGeminiRecipeGenerator(
      "test-api-key",
      new LocalRecipeGenerator(),
    );

    await generator.generate({ ingredients: ["egg"], style: "any" }, [
      {
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
      },
    ]);

    const callArgs = mockGenerateContent.mock.calls[0]?.[0];
    expect(callArgs?.contents).toContain("Reference 1: Burmese Egg Fried Rice");
  });
});
