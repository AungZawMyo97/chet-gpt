# Chet-GPT

Chet-GPT is a small cooking helper for families who do not know what to cook today. The user enters ingredients they already have at home, chooses a cooking style, and the app suggests Burmese home recipes.

The app can use AI through direct integration with Google Gemini. If no API key is available, it still returns local fallback recipe suggestions so the app remains usable during development.

## Purpose

- Help users decide what to cook from available ingredients.
- Reduce daily meal planning stress.
- Suggest practical Burmese recipes with cook time, difficulty, missing ingredients, steps, and tips.
- Keep the UI simple enough for quick everyday use.

## Systems Used

- Next.js 16 App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui style components
- Base UI for select behavior
- lucide-react icons
- Google Gen AI SDK for AI recipe generation
- Vitest for unit tests
- ESLint with the Next.js config

## How It Works

1. The user enters ingredients in the recipe planner.
2. The frontend sends the ingredients and selected style to `POST /api/recipes`.
3. The API validates the request and parses the ingredient text.
4. The app retrieves the closest recipes from the local Burmese recipe knowledge base.
5. If `GEMINI_API_KEY` is set, the app sends the ingredients plus the retrieved reference recipes to Google Gemini for grounded recipe JSON.
6. If the AI call fails or no API key is set, the app returns local Burmese recipe suggestions.

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` for real AI results:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`GEMINI_MODEL` and `NEXT_PUBLIC_APP_URL` are optional. The app has defaults for both.

## Run Locally

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Recipe Knowledge Base (RAG)

The app keeps a small Burmese recipe collection in `src/features/recipes/infrastructure/knowledge/recipes.json`. Before asking Gemini, it retrieves the closest matches and sends them as reference recipes, so suggestions stay close to real home cooking.

- With `GEMINI_API_KEY` set, retrieval uses `gemini-embedding-2` vectors and cosine similarity.
- Without a key or without a built index, it falls back to keyword matching.
- The recipes were drafted with AI help. A human should review them so the knowledge base stays authentic.

Rebuild the embedding index after changing the recipes:

```bash
npm run build:index
```

The command loads `GEMINI_API_KEY` from `.env.local` with Node's `--env-file` flag. The key is never printed or saved into the index.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm test
npm run build:index
```

## Project Structure

- `src/app/` contains Next.js routes, layout, and API endpoints.
- `src/app/api/recipes/route.ts` handles recipe generation requests.
- `src/components/ui/` contains reusable UI components.
- `src/features/recipes/domain/` contains recipe types, knowledge base types, and ingredient parsing.
- `src/features/recipes/application/` contains the recipe generation use case, retriever interface, and generator interface.
- `src/features/recipes/infrastructure/` contains Google Gemini AI integration, recipe retrieval (embeddings and keyword), the recipe knowledge base, AI output parsing, error fallback, and local recipe generators.
- `src/features/recipes/presentation/` contains the recipe planner UI.
- `src/lib/` contains shared helpers.
- `scripts/` contains maintenance scripts such as the recipe embedding index builder.
- `tests/` contains Vitest tests for recipe logic and API configuration.

## Current Features

- Ingredient text input with duplicate removal.
- Quick ingredient buttons.
- Cooking style selection.
- Burmese recipe cards.
- Cook time, difficulty, matching ingredients, missing ingredients, steps, and tips.
- Google Gemini AI recipe generation.
- Retrieval-augmented suggestions grounded in a local Burmese recipe knowledge base.
- Local fallback recipes when AI is unavailable.
- Request size, content type, JSON, and ingredient validation in the API.
- Unit tests for parsing, local generation, retrieval, AI output cleanup, Gemini behavior, and route config.
