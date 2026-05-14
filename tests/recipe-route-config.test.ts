import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "../src/app/api/recipes/route";

describe("recipe route provider config", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("uses the dedicated OpenRouter config", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "sk-or-test");
    vi.stubEnv("OPENROUTER_MODEL", "test/openrouter-model");

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          id: "chatcmpl-test",
          created: 0,
          model: "test/openrouter-model",
          object: "chat.completion",
          system_fingerprint: null,
          choices: [
            {
              finish_reason: "stop",
              index: 0,
              message: {
                role: "assistant",
                content: JSON.stringify({
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
              },
            },
          ],
        }),
        { headers: { "content-type": "application/json" } },
      ),
    );

    const response = await POST(
      new Request("http://localhost/api/recipes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ingredients: "chicken", style: "any" }),
      }),
    );

    const result = await response.json();
    const request = fetchMock.mock.calls[0]?.[0] as Request;
    const requestBody = JSON.parse(await request.clone().text()) as {
      model: string;
    };

    expect(request.url).toContain("openrouter.ai");
    expect(requestBody.model).toBe("test/openrouter-model");
    expect(result.source).toBe("ai");
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
});
