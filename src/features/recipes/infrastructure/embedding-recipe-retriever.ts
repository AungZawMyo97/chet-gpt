import { GoogleGenAI } from "@google/genai";

import type { RecipeRetriever } from "@/features/recipes/application/retrieve-recipes";
import type {
  RecipeDocument,
  RecipeIndex,
  RecipeQuery,
} from "@/features/recipes/domain/recipe-knowledge";
import { cosineSimilarity } from "@/features/recipes/infrastructure/vector-similarity";

const embeddingTimeoutMs = 10_000;

export class EmbeddingRecipeRetriever implements RecipeRetriever {
  private readonly documentsById: Map<string, RecipeDocument>;

  constructor(
    private readonly apiKey: string,
    documents: RecipeDocument[],
    private readonly index: RecipeIndex,
    private readonly fallbackRetriever: RecipeRetriever,
  ) {
    this.documentsById = new Map(
      documents.map((document) => [document.id, document]),
    );
  }

  async retrieve(query: RecipeQuery): Promise<RecipeDocument[]> {
    if (!this.apiKey || this.index.entries.length === 0) {
      return this.fallbackRetriever.retrieve(query);
    }

    try {
      const queryVector = await this.embedQuery(query);

      const ranked = this.index.entries
        .map((entry) => ({
          document: this.documentsById.get(entry.id),
          score: cosineSimilarity(queryVector, entry.vector),
        }))
        .filter(
          (
            candidate,
          ): candidate is { document: RecipeDocument; score: number } =>
            Boolean(candidate.document),
        )
        .sort((left, right) => right.score - left.score);

      if (ranked.length === 0) {
        return this.fallbackRetriever.retrieve(query);
      }

      return ranked
        .slice(0, query.limit)
        .map((candidate) => candidate.document);
    } catch (error) {
      console.warn(
        "Embedding recipe retrieval failed, using keyword retrieval instead.",
        error instanceof Error ? error.message : "Unknown error.",
      );
      return this.fallbackRetriever.retrieve(query);
    }
  }

  private async embedQuery(query: RecipeQuery): Promise<number[]> {
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const response = await withTimeout(
      ai.models.embedContent({
        model: this.index.model,
        contents: buildEmbeddingQueryText(query),
        config: {
          taskType: "RETRIEVAL_QUERY",
          outputDimensionality: this.index.dimensions,
        },
      }),
      embeddingTimeoutMs,
    );
    const values = response.embeddings?.[0]?.values ?? [];

    if (values.length !== this.index.dimensions) {
      throw new Error("Embedding size does not match the recipe index.");
    }

    return values;
  }
}

export function buildEmbeddingQueryText(query: RecipeQuery): string {
  const styleText =
    query.style === "any" ? "" : ` Cooking style: ${query.style}.`;

  return `Burmese home recipe using these ingredients: ${query.ingredients.join(", ")}.${styleText}`;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([promise, createTimeoutError(timeoutMs)]);
}

function createTimeoutError(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(
      () =>
        reject(
          new Error(
            `Embedding request timed out after ${timeoutMs / 1000} seconds.`,
          ),
        ),
      timeoutMs,
    );
  });
}
