import type { RecipeRetriever } from "@/features/recipes/application/retrieve-recipes";
import type {
  RecipeDocument,
  RecipeQuery,
} from "@/features/recipes/domain/recipe-knowledge";
import type { RecipeStyle } from "@/features/recipes/domain/recipe";

const styleMatchBonus = 0.2;

export class KeywordRecipeRetriever implements RecipeRetriever {
  constructor(private readonly documents: RecipeDocument[]) {}

  async retrieve(query: RecipeQuery): Promise<RecipeDocument[]> {
    const wantedIngredients = query.ingredients
      .map(normalizeName)
      .filter(Boolean);

    if (wantedIngredients.length === 0 || query.limit <= 0) {
      return [];
    }

    return this.documents
      .map((document) => ({
        document,
        score: scoreDocument(document, wantedIngredients, query.style),
      }))
      .filter((candidate) => candidate.score > 0)
      .sort(
        (left, right) =>
          right.score - left.score ||
          left.document.id.localeCompare(right.document.id),
      )
      .slice(0, query.limit)
      .map((candidate) => candidate.document);
  }
}

function scoreDocument(
  document: RecipeDocument,
  wantedIngredients: string[],
  style: RecipeStyle,
): number {
  const availableIngredients = document.ingredients.map(normalizeName);
  const matchingCount = wantedIngredients.filter((ingredient) =>
    availableIngredients.some(
      (available) =>
        available.includes(ingredient) || ingredient.includes(available),
    ),
  ).length;
  const coverage = matchingCount / wantedIngredients.length;
  const styleBonus =
    style !== "any" && document.tags.includes(style) ? styleMatchBonus : 0;

  return coverage + styleBonus;
}

function normalizeName(value: string): string {
  return value.trim().toLowerCase();
}
