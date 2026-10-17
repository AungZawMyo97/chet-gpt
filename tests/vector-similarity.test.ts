import { describe, expect, it } from "vitest";

import { cosineSimilarity } from "../src/features/recipes/infrastructure/vector-similarity";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1);
  });

  it("returns 0 for perpendicular vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  it("returns -1 for opposite vectors", () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1);
  });

  it("compares unnormalized vectors by direction", () => {
    expect(cosineSimilarity([2, 4], [1, 2])).toBeCloseTo(1);
  });

  it("handles vectors of different lengths safely", () => {
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
    expect(cosineSimilarity([], [])).toBe(0);
  });

  it("returns 0 when a vector has no magnitude", () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
  });
});
