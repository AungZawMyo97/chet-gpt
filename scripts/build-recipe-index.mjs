// Builds the embedding index for the recipe knowledge base.
// Run with: npm run build:index
// The script loads GEMINI_API_KEY from .env.local through Node's --env-file flag.
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { GoogleGenAI } = require("@google/genai");

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const recipesPath = path.join(
  rootDirectory,
  "src/features/recipes/infrastructure/knowledge/recipes.json",
);
const indexPath = path.join(
  rootDirectory,
  "src/features/recipes/infrastructure/knowledge/recipe-index.json",
);

const embeddingModel =
  process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";
const dimensions = 768;

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error(
    "GEMINI_API_KEY is not set. Create .env.local first, then run: npm run build:index",
  );
  process.exit(1);
}

const recipes = JSON.parse(readFileSync(recipesPath, "utf8"));
const ai = new GoogleGenAI({ apiKey });
const entries = [];

console.log(`Embedding ${recipes.length} recipes with ${embeddingModel}...`);

for (const recipe of recipes) {
  const response = await ai.models.embedContent({
    model: embeddingModel,
    contents: buildEmbeddingText(recipe),
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: dimensions,
    },
  });
  const vector = response.embeddings?.[0]?.values;

  if (!vector || vector.length !== dimensions) {
    throw new Error(`No embedding returned for recipe ${recipe.id}.`);
  }

  entries.push({ id: recipe.id, vector });
  console.log(`  embedded ${recipe.id}`);
}

writeFileSync(
  indexPath,
  `${JSON.stringify({ model: embeddingModel, dimensions, entries }, null, 2)}\n`,
);
console.log(`Saved ${entries.length} recipe vectors to recipe-index.json.`);

function buildEmbeddingText(recipe) {
  return [
    `Burmese recipe: ${recipe.title} (${recipe.burmeseTitle}).`,
    `Summary: ${recipe.summary}`,
    `Ingredients: ${recipe.ingredients.join(", ")}.`,
    `Steps: ${recipe.steps.join(" ")}`,
  ].join("\n");
}
