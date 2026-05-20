import { GoogleGenAI } from "@google/genai";

import type { RecipeGenerator } from "@/features/recipes/application/generate-recipes-use-case";
import type {
  RecipeRequest,
  RecipeResult,
} from "@/features/recipes/domain/recipe";
import {
  buildRecipePrompt,
  parseRecipeOutput,
} from "@/features/recipes/infrastructure/recipe-ai-output";
import { generateFallbackResult } from "@/features/recipes/infrastructure/ai-request-error";

const geminiTimeoutMs = 25_000;

export class GoogleGeminiRecipeGenerator implements RecipeGenerator {
  private readonly model: string;

  constructor(
    private readonly apiKey: string,
    private readonly fallbackGenerator: RecipeGenerator,
    model?: string,
  ) {
    this.model = model || process.env.GEMINI_MODEL || "gemini-2.5-flash";
  }

  async generate(request: RecipeRequest): Promise<RecipeResult> {
    if (!this.apiKey) {
      return generateFallbackResult(
        this.fallbackGenerator,
        request,
        "Google Gemini",
        new Error("Gemini API key is not configured."),
      );
    }

    try {
      const ai = new GoogleGenAI({ apiKey: this.apiKey });
      const response = await this.sendWithTimeout(ai, request);
      const outputText = response.text ?? "";

      return {
        recipes: parseRecipeOutput(outputText),
        source: "ai",
      };
    } catch (error) {
      return generateFallbackResult(
        this.fallbackGenerator,
        request,
        "Google Gemini",
        error,
      );
    }
  }

  private async sendWithTimeout(
    ai: GoogleGenAI,
    request: RecipeRequest,
  ) {
    return await Promise.race([
      ai.models.generateContent({
        model: request.model || this.model,
        contents: buildRecipePrompt(request),
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              recipes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    title: { type: "string" },
                    burmeseTitle: { type: "string" },
                    summary: { type: "string" },
                    cookTimeMinutes: { type: "integer" },
                    difficulty: {
                      type: "string",
                      enum: ["Easy", "Medium", "Hard"],
                    },
                    matchingIngredients: {
                      type: "array",
                      items: { type: "string" },
                    },
                    missingIngredients: {
                      type: "array",
                      items: { type: "string" },
                    },
                    steps: {
                      type: "array",
                      items: { type: "string" },
                    },
                    tips: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: [
                    "id",
                    "title",
                    "burmeseTitle",
                    "summary",
                    "cookTimeMinutes",
                    "difficulty",
                    "matchingIngredients",
                    "missingIngredients",
                    "steps",
                    "tips",
                  ],
                },
              },
            },
            required: ["recipes"],
          },
        },
      }),
      createTimeoutError(),
    ]);
  }
}

function createTimeoutError(): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("Google Gemini request timed out after 25 seconds.")),
      geminiTimeoutMs,
    );
  });
}
