import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "../src/app/api/recipes/route";

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

describe("recipe route provider config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("uses the dedicated Gemini config", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-api-key");
    vi.stubEnv("GEMINI_MODEL", "test-gemini-model");

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        recipes: [
          {
            id: "ai-curry",
            title: "AI curry",
            burmeseTitle: "AI curry",
            summary: "A simple curry.",
            cookTimeMinutes: 30,
            difficulty: "Easy",
            matchingIngredients: ["chicken"],
            missingIngredients: [],
            steps: ["Cook the chicken."],
            tips: ["Taste before serving."],
          },
        ],
      }),
    });

    const response = await POST(
      new Request("http://localhost/api/recipes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ingredients: "chicken", style: "any" }),
      }),
    );

    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.source).toBe("ai");
    expect(result.recipes).toHaveLength(1);

    expect(mockGenerateContent).toHaveBeenCalled();
    const callArgs = mockGenerateContent.mock.calls[0]?.[0];
    expect(callArgs?.model).toBe("test-gemini-model");
  });

  it("rejects oversized recipe requests", async () => {
    const response = await POST(
      new Request("http://localhost/api/recipes", {
        method: "POST",
        headers: {
          "content-length": "8193",
          "content-type": "application/json",
        },
        body: JSON.stringify({ ingredients: "chicken", style: "any" }),
      }),
    );
    const result = await response.json();

    expect(response.status).toBe(413);
    expect(result.message).toBe("Request is too large.");
  });

  it("propagates request-level model selection to Gemini", async () => {
    vi.stubEnv("GEMINI_API_KEY", "test-api-key");

    mockGenerateContent.mockResolvedValue({
      text: JSON.stringify({
        recipes: [
          {
            id: "ai-curry",
            title: "AI curry",
            burmeseTitle: "AI curry",
            summary: "A simple curry.",
            cookTimeMinutes: 30,
            difficulty: "Easy",
            matchingIngredients: ["chicken"],
            missingIngredients: [],
            steps: ["Cook the chicken."],
            tips: ["Taste before serving."],
          },
        ],
      }),
    });

    const response = await POST(
      new Request("http://localhost/api/recipes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ingredients: "chicken",
          style: "any",
          model: "custom-selected-model",
        }),
      }),
    );

    const result = await response.json();
    expect(response.status).toBe(200);
    expect(result.source).toBe("ai");
    expect(result.recipes).toHaveLength(1);

    expect(mockGenerateContent).toHaveBeenCalled();
    const callArgs = mockGenerateContent.mock.calls[0]?.[0];
    expect(callArgs?.model).toBe("custom-selected-model");
  });
});
