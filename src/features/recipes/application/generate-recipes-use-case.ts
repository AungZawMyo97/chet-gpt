import type {
  RecipeRequest,
  RecipeResult,
  RecipeStyle,
} from "@/features/recipes/domain/recipe";
import { recipeStyles } from "@/features/recipes/domain/recipe";
import type { RecipeDocument } from "@/features/recipes/domain/recipe-knowledge";
import type { RecipeRetriever } from "@/features/recipes/application/retrieve-recipes";

const maxSourceRecipes = 3;

export interface RecipeGenerator {
  generate(
    request: RecipeRequest,
    sourceRecipes?: RecipeDocument[],
  ): Promise<RecipeResult>;
}

export class GenerateRecipesUseCase {
  constructor(
    private readonly recipeGenerator: RecipeGenerator,
    private readonly recipeRetriever?: RecipeRetriever,
  ) {}

  async execute(request: RecipeRequest): Promise<RecipeResult> {
    const ingredients = request.ingredients
      .map((ingredient) => ingredient.trim().toLowerCase())
      .filter(Boolean);

    if (ingredients.length === 0) {
      throw new Error("အနည်းဆုံး ပါဝင်ပစ္စည်းတစ်ခု ထည့်ပါ။");
    }

    const recipeRequest: RecipeRequest = {
      ingredients,
      style: normalizeStyle(request.style),
      model: request.model,
    };
    const sourceRecipes = await this.findSourceRecipes(recipeRequest);

    return this.recipeGenerator.generate(recipeRequest, sourceRecipes);
  }

  private async findSourceRecipes(
    request: RecipeRequest,
  ): Promise<RecipeDocument[]> {
    if (!this.recipeRetriever) {
      return [];
    }

    try {
      return await this.recipeRetriever.retrieve({
        ingredients: request.ingredients,
        style: request.style,
        limit: maxSourceRecipes,
      });
    } catch (error) {
      console.warn(
        "Recipe knowledge retrieval failed, continuing without source recipes.",
        error instanceof Error ? error.message : "Unknown error.",
      );
      return [];
    }
  }
}

export function normalizeStyle(style: string): RecipeStyle {
  if (recipeStyles.includes(style as RecipeStyle)) {
    return style as RecipeStyle;
  }

  return "any";
}
