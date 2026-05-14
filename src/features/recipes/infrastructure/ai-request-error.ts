import type { RecipeGenerator } from "@/features/recipes/application/generate-recipes-use-case";
import type { RecipeRequest, RecipeResult } from "@/features/recipes/domain/recipe";

export async function generateFallbackResult(
  fallbackGenerator: RecipeGenerator,
  request: RecipeRequest,
  providerName: string,
  error: unknown,
): Promise<RecipeResult> {
  console.warn(`${providerName} recipe request failed.`, formatProviderLog(error));

  const fallbackResult = await fallbackGenerator.generate(request);

  return {
    ...fallbackResult,
    note: `${providerName} is not available now, so local recipe suggestions are shown.`,
  };
}

function formatProviderLog(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Unknown error.";
  }

  const providerError = error as {
    message?: string;
    statusCode?: number;
  };
  const status = providerError.statusCode ? `${providerError.statusCode}: ` : "";

  return `${status}${providerError.message ?? "Unknown error."}`;
}
