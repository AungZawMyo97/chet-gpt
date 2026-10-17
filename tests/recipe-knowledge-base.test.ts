import { describe, expect, it } from "vitest";

import {
  loadRecipeDocuments,
  loadRecipeIndex,
} from "../src/features/recipes/infrastructure/recipe-knowledge-base";

describe("recipe knowledge base", () => {
  it("loads valid recipe documents with unique ids", () => {
    const documents = loadRecipeDocuments();

    expect(documents.length).toBeGreaterThanOrEqual(10);

    const ids = documents.map((document) => document.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const document of documents) {
      expect(document.ingredients.length).toBeGreaterThan(0);
      expect(document.steps.length).toBeGreaterThan(0);
      expect(document.tags.length).toBeGreaterThan(0);
    }
  });

  it("loads a recipe index that matches the documents", () => {
    const index = loadRecipeIndex();

    expect(index).not.toBeNull();

    if (!index || index.entries.length === 0) {
      // The index is not built yet. Run: npm run build:index
      return;
    }

    const ids = new Set(loadRecipeDocuments().map((document) => document.id));

    for (const entry of index.entries) {
      expect(ids.has(entry.id)).toBe(true);
      expect(entry.vector).toHaveLength(index.dimensions);
    }
  });
});
