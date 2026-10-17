import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  RecipeDocument,
  RecipeIndex,
} from "../src/features/recipes/domain/recipe-knowledge";
import { EmbeddingRecipeRetriever } from "../src/features/recipes/infrastructure/embedding-recipe-retriever";
import { KeywordRecipeRetriever } from "../src/features/recipes/infrastructure/keyword-recipe-retriever";

const mockEmbedContent = vi.fn();

vi.mock("@google/genai", () => {
  class MockGoogleGenAI {
    models = {
      embedContent: mockEmbedContent,
    };
  }
  return {
    GoogleGenAI: MockGoogleGenAI,
  };
});

function createDocument(id: string): RecipeDocument {
  return {
    id,
    title: id,
    burmeseTitle: id,
    summary: "Simple recipe.",
    timeMinutes: 20,
    difficulty: "Easy",
    servings: 2,
    ingredients: ["chicken"],
    steps: ["Cook."],
    tags: [],
  };
}

const documents = [
  createDocument("closest"),
  createDocument("middle"),
  createDocument("farthest"),
];

const index: RecipeIndex = {
  model: "test-embedding-model",
  dimensions: 3,
  entries: [
    { id: "closest", vector: [1, 0, 0] },
    { id: "middle", vector: [0.6, 0.8, 0] },
    { id: "farthest", vector: [0, 1, 0] },
  ],
};

function createRetriever(
  apiKey = "test-api-key",
  recipeIndex: RecipeIndex = index,
) {
  return new EmbeddingRecipeRetriever(
    apiKey,
    documents,
    recipeIndex,
    new KeywordRecipeRetriever(documents),
  );
}

describe("EmbeddingRecipeRetriever", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("ranks recipes by vector similarity", async () => {
    mockEmbedContent.mockResolvedValue({
      embeddings: [{ values: [1, 0, 0] }],
    });

    const results = await createRetriever().retrieve({
      ingredients: ["chicken"],
      style: "any",
      limit: 2,
    });

    expect(results.map((recipe) => recipe.id)).toEqual(["closest", "middle"]);

    const callArgs = mockEmbedContent.mock.calls[0]?.[0];
    expect(callArgs?.model).toBe("test-embedding-model");
    expect(callArgs?.config?.taskType).toBe("RETRIEVAL_QUERY");
    expect(callArgs?.config?.outputDimensionality).toBe(3);
  });

  it("falls back to keyword retrieval when the embedding call fails", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mockEmbedContent.mockRejectedValue(
      new Error("Embedding service unavailable."),
    );

    const keywordRetriever = new KeywordRecipeRetriever(documents);
    const keywordSpy = vi.spyOn(keywordRetriever, "retrieve");
    const retriever = new EmbeddingRecipeRetriever(
      "test-api-key",
      documents,
      index,
      keywordRetriever,
    );

    const results = await retriever.retrieve({
      ingredients: ["chicken"],
      style: "any",
      limit: 2,
    });

    expect(keywordSpy).toHaveBeenCalled();
    expect(results[0]?.id).toBe("closest");
    expect(console.warn).toHaveBeenCalledWith(
      "Embedding recipe retrieval failed, using keyword retrieval instead.",
      expect.stringContaining("Embedding service unavailable."),
    );
  });

  it("uses keyword retrieval when no API key or index entries exist", async () => {
    const keywordRetriever = new KeywordRecipeRetriever(documents);
    const keywordSpy = vi.spyOn(keywordRetriever, "retrieve");

    const withoutKey = new EmbeddingRecipeRetriever(
      "",
      documents,
      index,
      keywordRetriever,
    );
    const withoutEntries = new EmbeddingRecipeRetriever(
      "test-api-key",
      documents,
      { ...index, entries: [] },
      keywordRetriever,
    );

    await withoutKey.retrieve({ ingredients: ["chicken"], style: "any", limit: 2 });
    await withoutEntries.retrieve({
      ingredients: ["chicken"],
      style: "any",
      limit: 2,
    });

    expect(mockEmbedContent).not.toHaveBeenCalled();
    expect(keywordSpy).toHaveBeenCalledTimes(2);
  });

  it("falls back when the embedding size does not match the index", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    mockEmbedContent.mockResolvedValue({
      embeddings: [{ values: [1, 0] }],
    });

    const results = await createRetriever().retrieve({
      ingredients: ["chicken"],
      style: "any",
      limit: 1,
    });

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("closest");
  });
});
