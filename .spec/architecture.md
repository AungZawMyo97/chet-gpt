# Architecture & Module Organization

Chet-GPT is designed around **Clean Architecture** and **SOLID Principles**. This structure isolates the core business logic from external frameworks, user interfaces, database drivers, and third-party APIs (such as Google Gemini).

## Clean Architecture Layers

The code resides inside `src/features/recipes/` and is divided into four distinct, predictable layers:

```mermaid
graph TD
    Presentation[Presentation Layer<br>React Components & Client State] --> Application[Application Layer<br>Use Cases & Interfaces]
    Infrastructure[Infrastructure Layer<br>Google Gemini AI, Knowledge Retrieval & Fallback Generators] --> Application
    Application --> Domain[Domain Layer<br>Core Types & Ingredient Parsers]
    Presentation -.-> API[Next.js API Handler<br>POST /api/recipes]
    API --> Application
```

---

### 1. Domain Layer (`src/features/recipes/domain/`)

The Domain layer is the most stable and inner layer. It defines our core business entities, interfaces, and immutable validation/formatting helpers. It has zero external dependencies on Next.js, React, or fetch APIs.

* **[recipe.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/domain/recipe.ts)**:
  * Defines allowed styles: `recipeStyles` (`"any"`, `"quick"`, `"family"`, `"spicy"`, `"healthy"`, `"budget"`).
  * Establishes the `RecipeSuggestion` type returned by generators (IDs, Burmese titles, cook times, difficulty levels, list of ingredients, and execution steps).
  * Outlines request payloads (`RecipeRequest` containing ingredients, style, and optional `model` ID) and execution output wraps (`RecipeResult`).
* **[ingredient-parser.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/domain/ingredient-parser.ts)**:
  * Contains the helper `parseIngredients(value: string): string[]`.
  * Splits user-provided ingredients using a regular expression separator (`/[\n,;|]+/g`).
  * Normalizes elements to lowercase, trims whitespace, removes empty entries, and filters out duplicates.
* **[recipe-knowledge.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/domain/recipe-knowledge.ts)**:
  * Defines the knowledge base entities: `RecipeDocument` (a curated recipe entry), `RecipeQuery` (ingredients, style, and result limit), and the embedding `RecipeIndex` with its vector entries.

### 2. Application Layer (`src/features/recipes/application/`)

The Application layer contains use cases that orchestrate the flow of data to and from the domain entities.

* **[generate-recipes-use-case.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/application/generate-recipes-use-case.ts)**:
  * Exposes the `RecipeGenerator` interface containing the async `generate(request: RecipeRequest, sourceRecipes?: RecipeDocument[]): Promise<RecipeResult>` command.
  * Declares `GenerateRecipesUseCase`, which handles execution validation (raising an error if no ingredients exist), normalizes recipe style flags, retrieves up to three reference recipes through the `RecipeRetriever` port, and delegates generation to the concrete adapter.
* **[retrieve-recipes.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/application/retrieve-recipes.ts)**:
  * Declares the `RecipeRetriever` port with the async `retrieve(query: RecipeQuery): Promise<RecipeDocument[]>` command.

### 3. Infrastructure Layer (`src/features/recipes/infrastructure/`)

The Infrastructure layer implements the abstract interfaces defined in the Application layer, communicating with external systems like AI providers or local data fallbacks.

* **[google-gemini-recipe-generator.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/infrastructure/google-gemini-recipe-generator.ts)**:
  * Adapter utilizing the modern `@google/genai` client.
  * Implements `RecipeGenerator`.
  * Accepts dynamic AI model configuration parameter overrides inside both its constructor and request payload to target different Gemini models.
  * Integrates a strict 25-second timeout via `Promise.race` to prevent hanging network calls.
* **[recipe-ai-output.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/infrastructure/recipe-ai-output.ts)**:
  * Assembles system/user prompts instructing Gemini to respond strictly in a valid JSON schema with all user-facing strings translated to Burmese.
  * Injects retrieved knowledge base recipes into the prompt as reference recipes when they are available.
  * Sanitizes, parses, and formats outputs (capping text lengths, clipping lists, bounding cook times between 5 and 240 minutes, and fallback-mapping difficulty attributes).
* **[keyword-recipe-retriever.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/infrastructure/keyword-recipe-retriever.ts)**:
  * Offline `RecipeRetriever` implementation. Ranks knowledge base recipes by ingredient coverage and adds a small bonus for matching cooking style tags.
* **[embedding-recipe-retriever.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/infrastructure/embedding-recipe-retriever.ts)**:
  * Embeds the user query with `gemini-embedding-2` and ranks recipes by cosine similarity against the built index.
  * Falls back to keyword retrieval when there is no API key, no built index, or the embedding call fails.
* **[vector-similarity.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/infrastructure/vector-similarity.ts)**:
  * Pure `cosineSimilarity(left, right)` helper used for embedding ranking. All math, no dependencies.
* **[recipe-knowledge-base.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/infrastructure/recipe-knowledge-base.ts)**:
  * Loads and validates the curated recipe documents (`knowledge/recipes.json`) and the embedding index (`knowledge/recipe-index.json`).
  * The recipes were drafted with AI help and need human review; the index is rebuilt with `npm run build:index` (see `scripts/build-recipe-index.mjs`).
* **[local-recipe-generator.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/infrastructure/local-recipe-generator.ts)**:
  * Implements an offline `RecipeGenerator` fallback.
  * Reads the primary ingredient, aggregates secondary items, and uses pre-configured Burmese recipes ("ဆီပြန်ဟင်း", "ထမင်းကြော်", "ဟင်းချို") with dynamic ingredient adjustments to return reliable suggestions.
* **[ai-request-error.ts](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/infrastructure/ai-request-error.ts)**:
  * Catches Google Gemini network failures or timeout errors and seamlessly redirects execution to the local fallback generator while attaching a descriptive warning note.

### 4. Presentation Layer (`src/features/recipes/presentation/`)

The Presentation layer is responsible for rendering content and capturing user actions.

* **[recipe-planner.tsx](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/src/features/recipes/presentation/recipe-planner.tsx)**:
  * Contains the interactive `RecipePlanner` client component.
  * Manages UI state: input ingredients, selected cooking style, active load indicator, HTTP error messages, fetched recipe arrays, and dynamic `models` listings with the active `selectedModel` state.
  * Dynamically consumes Axios to load target models from `public/models.json` on initialization.
  * Uses utility sub-components: `AppHeader`, `HeroPanel`, `IngredientPanel`, `SelectedIngredients`, `ResultsSection`, and `RecipeCard`.

---

## The Dependency Rule

```text
  [ Presentation ]   -->   [ Application ]   -->   [ Domain ]
           ^                       ^
           |                       |
  [  API Route   ]         [ Infrastructure ]
```

* Outer layers can import from inner layers, but inner layers must **never** reference outer layers.
* For example, **Domain** never references `GenerateRecipesUseCase` or `fetch`.
* **Application** only references the abstract interface `RecipeGenerator` and types in **Domain**. It knows nothing about Google Gemini or local generators.
* This makes the core business rules extremely reusable, simple to unit-test, and decoupled from framework details.
