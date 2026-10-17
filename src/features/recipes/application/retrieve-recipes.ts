import type {
  RecipeDocument,
  RecipeQuery,
} from "@/features/recipes/domain/recipe-knowledge";

export interface RecipeRetriever {
  retrieve(query: RecipeQuery): Promise<RecipeDocument[]>;
}
