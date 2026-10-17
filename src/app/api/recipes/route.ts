import { NextResponse } from "next/server";

import {
  GenerateRecipesUseCase,
  normalizeStyle,
} from "@/features/recipes/application/generate-recipes-use-case";
import type { RecipeRetriever } from "@/features/recipes/application/retrieve-recipes";
import { parseIngredients } from "@/features/recipes/domain/ingredient-parser";
import type { RecipeRequest } from "@/features/recipes/domain/recipe";
import { EmbeddingRecipeRetriever } from "@/features/recipes/infrastructure/embedding-recipe-retriever";
import { KeywordRecipeRetriever } from "@/features/recipes/infrastructure/keyword-recipe-retriever";
import { LocalRecipeGenerator } from "@/features/recipes/infrastructure/local-recipe-generator";
import { GoogleGeminiRecipeGenerator } from "@/features/recipes/infrastructure/google-gemini-recipe-generator";
import {
  loadRecipeDocuments,
  loadRecipeIndex,
} from "@/features/recipes/infrastructure/recipe-knowledge-base";

interface RecipeApiBody {
  ingredients?: string;
  style?: string;
  model?: string;
}

const maxRequestBytes = 8_192;
const maxIngredientTextLength = 500;

export async function POST(request: Request) {
  try {
    const body = await readRecipeApiBody(request);
    const ingredients = parseIngredients(body.ingredients);

    if (ingredients.length === 0) {
      throw new RecipeApiError("Please add at least one ingredient.", 400);
    }

    const recipeRequest: RecipeRequest = {
      ingredients,
      style: normalizeStyle(body.style),
      model: body.model,
    };

    const useCase = new GenerateRecipesUseCase(
      createRecipeGenerator(body.model),
      createRecipeRetriever(),
    );
    const result = await useCase.execute(recipeRequest);

    return NextResponse.json(result);
  } catch (error) {
    const status = error instanceof RecipeApiError ? error.status : 400;
    const message =
      error instanceof RecipeApiError
        ? error.message
        : "Unable to create recipes right now.";

    return NextResponse.json({ message }, { status });
  }
}

async function readRecipeApiBody(
  request: Request,
): Promise<{ ingredients: string; style: string; model?: string }> {
  const contentLength = Number(request.headers.get("content-length") ?? 0);

  if (contentLength > maxRequestBytes) {
    throw new RecipeApiError("Request is too large.", 413);
  }

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType && !contentType.includes("application/json")) {
    throw new RecipeApiError("Request must be JSON.", 415);
  }

  let body: RecipeApiBody;

  try {
    body = (await request.json()) as RecipeApiBody;
  } catch {
    throw new RecipeApiError("Invalid JSON request.", 400);
  }

  if (typeof body.ingredients !== "string") {
    throw new RecipeApiError("Ingredients must be text.", 400);
  }

  if (body.ingredients.length > maxIngredientTextLength) {
    throw new RecipeApiError("Ingredients text is too long.", 413);
  }

  return {
    ingredients: body.ingredients,
    style: typeof body.style === "string" ? body.style : "any",
    model: typeof body.model === "string" ? body.model : undefined,
  };
}

function createRecipeGenerator(model?: string) {
  const localGenerator = new LocalRecipeGenerator();
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    return new GoogleGeminiRecipeGenerator(geminiApiKey, localGenerator, model);
  }

  return localGenerator;
}

function createRecipeRetriever(): RecipeRetriever {
  const documents = loadRecipeDocuments();
  const keywordRetriever = new KeywordRecipeRetriever(documents);
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const index = loadRecipeIndex();

  if (!geminiApiKey || !index || index.entries.length === 0) {
    return keywordRetriever;
  }

  return new EmbeddingRecipeRetriever(
    geminiApiKey,
    documents,
    index,
    keywordRetriever,
  );
}

class RecipeApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
