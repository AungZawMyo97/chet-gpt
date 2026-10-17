# Testing Specifications & Guidelines

Chet-GPT uses **Vitest** for unit testing. The test suite verifies domain rules, application behaviors, AI response processing, API validation protocols, and mock-based network configurations.

---

## 1. Test Architecture & Running Tests

* **Framework**: Vitest (configured inside `vitest.config.ts` referencing `@/` path aliasing).
* **Test Directory**: `tests/`
* **Command**: `npm test` (executes `vitest run` to run all test files synchronously).

---

## 2. Coverage Areas & Test Suites

The application includes ten main test suites, matching core modules:

```text
tests/
├── ingredient-parser.test.ts              [Domain Layer]
├── generate-recipes-use-case.test.ts      [Application Layer]
├── local-recipe-generator.test.ts         [Infrastructure Layer]
├── recipe-ai-output.test.ts               [Infrastructure Layer]
├── google-gemini-recipe-generator.test.ts [Infrastructure Layer]
├── keyword-recipe-retriever.test.ts       [Infrastructure Layer]
├── embedding-recipe-retriever.test.ts     [Infrastructure Layer]
├── vector-similarity.test.ts              [Infrastructure Layer]
├── recipe-knowledge-base.test.ts          [Infrastructure Layer]
└── recipe-route-config.test.ts            [API Route Layer]
```

### A. Ingredient Parser (`tests/ingredient-parser.test.ts`)
* **Target**: `parseIngredients()` function in the Domain layer.
* **Test cases**:
  * Asserts correct splitting by multiple characters (newlines `\n`, commas `,`, semicolons `;`, or pipes `|`).
  * Asserts complete whitespace trimming and casing normalization (e.g., converting `"Chicken "` to `"chicken"`).
  * Asserts removal of empty strings or falsey values.
  * Asserts duplicate elimination, verifying that only unique ingredient lists are returned.

### B. Local Fallback Generator (`tests/local-recipe-generator.test.ts`)
* **Target**: `LocalRecipeGenerator` class in the Infrastructure layer.
* **Test cases**:
  * Asserts that 3 practical recipes are always returned.
  * Verifies that the primary ingredient from the user request is incorporated into the Burmese titles and recipe contents.
  * Asserts that missing ingredients are recommended from pantry basics (such as oil or salt).
  * Verifies step counts and execution times.

### C. AI Output Parsing & Prompts (`tests/recipe-ai-output.test.ts`)
* **Target**: `buildRecipePrompt()` and `parseRecipeOutput()` utilities.
* **Test cases**:
  * Verifies prompt constraints (e.g., injection defenses, Burmese translation instructions, and JSON shape specifications).
  * Verifies that retrieved reference recipes appear in the prompt only when provided.
  * Verifies that malformed, incomplete, or over-nested JSON output from Google Gemini is parsed safely.
  * Verifies length-limit trimming (e.g., summaries capped at 280 characters, steps capped at 360 characters, list elements capped at 6 items).
  * Verifies cook time boundaries (clamping durations to a minimum of 5 minutes and a maximum of 240 minutes).
  * Verifies default fallback mapping for difficulty levels.

### D. Google Gemini Adapter (`tests/google-gemini-recipe-generator.test.ts`)
* **Target**: `GoogleGeminiRecipeGenerator` class.
* **Test cases**:
  * Validates successful parsing of AI-returned recipe JSON.
  * Mocks active SDK network requests using custom vitest handlers.
  * Verifies 25-second timeout logic via `Promise.race` triggers.
  * Verifies dynamic model configuration: asserts that the request-level `model` attribute overrides the constructor-level default when passed to the fetch query.
  * Verifies seamless fallback routing: when the AI key is missing or the request fails, it redirects execution to `LocalRecipeGenerator` and appends a warning note.

### E. Next.js API Routes (`tests/recipe-route-config.test.ts`)
* **Target**: `POST /api/recipes` handler logic inside `src/app/api/recipes/route.ts`.
* **Test cases**:
  * Simulates request-size constraints, asserting that headers with a `content-length` above 8KB return a `413 Payload Too Large` error.
  * Simulates bad media requests, asserting that non-JSON content-types return `415 Unsupported Media Type`.
  * Validates ingredients constraints, asserting that missing ingredients or excessively long text inputs are rejected with a `400 Bad Request`.
  * Verifies dynamic model selection: asserts that passing custom model IDs inside the request payload propagates the model parameter cleanly to outbound Google Gemini APIs.
  * Verifies output payloads, checking that success responses match the `RecipeResult` format with a `200 OK` status.
  * Verifies that knowledge base reference recipes are added to the Gemini prompt.

### F. Retrieval & Use Case (`tests/generate-recipes-use-case.test.ts`)
* **Target**: `GenerateRecipesUseCase` class in the Application layer.
* **Test cases**:
  * Asserts that retrieved knowledge base recipes are passed to the generator.
  * Asserts that execution continues without source recipes when retrieval fails.
  * Asserts the use case works without a retriever configured.
  * Asserts empty ingredient requests are still rejected.

### G. Keyword Retriever (`tests/keyword-recipe-retriever.test.ts`)
* **Target**: `KeywordRecipeRetriever` class.
* **Test cases**:
  * Ranks recipes by ingredient coverage and matches partial names in both directions.
  * Boosts recipes that match the cooking style tag.
  * Ignores casing and whitespace, respects the limit, and returns nothing when nothing matches.

### H. Embedding Retriever (`tests/embedding-recipe-retriever.test.ts`)
* **Target**: `EmbeddingRecipeRetriever` class.
* **Test cases**:
  * Ranks recipes by cosine similarity using a mocked `@google/genai` embedding response.
  * Falls back to keyword retrieval when the embedding call fails, the key is missing, the index is empty, or the embedding size does not match the index.

### I. Vector Math (`tests/vector-similarity.test.ts`)
* **Target**: `cosineSimilarity()` helper.
* **Test cases**: identical, perpendicular, opposite, unnormalized, mismatched-length, and zero-magnitude vectors.

### J. Knowledge Base Files (`tests/recipe-knowledge-base.test.ts`)
* **Target**: `loadRecipeDocuments()` and `loadRecipeIndex()`.
* **Test cases**:
  * Asserts the curated recipe file loads with unique ids and complete fields.
  * Asserts the built embedding index only references known recipe ids with vectors matching the stored dimensions.

---

## 3. Best Practices for Adding Tests

1. **Colocating & Naming**:
   * Create test files inside `tests/` or colocate them next to the code with the `.test.ts` extension.
   * Match naming conventions (e.g., testing `my-feature.ts` requires a test named `my-feature.test.ts`).
2. **Mocking External Clients**:
   * Avoid calling real network servers in tests.
   * Mock `@google/genai` dependencies inside tests using standard Vitest mocking tools.
3. **Asserting Layer Boundaries**:
   * Test code independently in its own layer.
   * Mock outer dependencies when testing core use cases or interfaces.
