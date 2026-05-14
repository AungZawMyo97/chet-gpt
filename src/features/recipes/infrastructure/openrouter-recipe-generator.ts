import { OpenRouter } from "@openrouter/sdk";

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

const openRouterTimeoutMs = 25_000;
const defaultAppUrl = "http://localhost:3000";

export class OpenRouterRecipeGenerator implements RecipeGenerator {
  constructor(
    private readonly apiKey: string,
    private readonly fallbackGenerator: RecipeGenerator,
    private readonly model = process.env.OPENROUTER_MODEL ??
      "meta-llama/llama-3.3-70b-instruct:free",
  ) {}

  async generate(request: RecipeRequest): Promise<RecipeResult> {
    try {
      const openRouter = new OpenRouter({
        apiKey: this.apiKey,
        appTitle: "Chet-GPT",
        httpReferer: getAppUrl(),
      });

      const response = await this.sendWithTimeout(openRouter, request);

      const outputText = response.choices[0]?.message.content ?? "";

      return {
        recipes: parseRecipeOutput(outputText),
        source: "ai",
      };
    } catch (error) {
      return generateFallbackResult(
        this.fallbackGenerator,
        request,
        "OpenRouter",
        error,
      );
    }
  }

  private async sendWithTimeout(
    openRouter: OpenRouter,
    request: RecipeRequest,
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), openRouterTimeoutMs);

    try {
      return await Promise.race([
        openRouter.chat.send(
          {
            chatRequest: {
              model: this.model,
              messages: [
                {
                  role: "system",
                  content:
                    "You are Chet-GPT, a practical Burmese home cooking assistant. Return only valid JSON.",
                },
                {
                  role: "user",
                  content: buildRecipePrompt(request),
                },
              ],
              responseFormat: { type: "json_object" },
              maxTokens: 1800,
            },
          },
          {
            signal: controller.signal,
            timeoutMs: openRouterTimeoutMs,
          },
        ),
        createTimeoutError(),
      ]);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

function getAppUrl(): string {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    defaultAppUrl;

  return appUrl.startsWith("http") ? appUrl : `https://${appUrl}`;
}

function createTimeoutError(): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("OpenRouter request timed out after 25 seconds.")),
      openRouterTimeoutMs,
    );
  });
}
