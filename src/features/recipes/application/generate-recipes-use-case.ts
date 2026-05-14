import type {
  RecipeRequest,
  RecipeResult,
  RecipeStyle,
} from "@/features/recipes/domain/recipe";
import { recipeStyles } from "@/features/recipes/domain/recipe";

export interface RecipeGenerator {
  generate(request: RecipeRequest): Promise<RecipeResult>;
}

export class GenerateRecipesUseCase {
  constructor(private readonly recipeGenerator: RecipeGenerator) {}

  async execute(request: RecipeRequest): Promise<RecipeResult> {
    const ingredients = request.ingredients
      .map((ingredient) => ingredient.trim().toLowerCase())
      .filter(Boolean);

    if (ingredients.length === 0) {
      throw new Error("အနည်းဆုံး ပါဝင်ပစ္စည်းတစ်ခု ထည့်ပါ။");
    }

    return this.recipeGenerator.generate({
      ingredients,
      style: normalizeStyle(request.style),
    });
  }
}

export function normalizeStyle(style: string): RecipeStyle {
  if (recipeStyles.includes(style as RecipeStyle)) {
    return style as RecipeStyle;
  }

  return "any";
}
