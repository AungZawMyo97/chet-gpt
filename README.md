# Chet-GPT

Chet-GPT is a small cooking helper for families who do not know what to cook today. The user enters ingredients they already have at home, chooses a cooking style, and the app suggests Burmese home recipes.

The app can use AI through OpenRouter. If no API key is available, it still returns local fallback recipe suggestions so the app remains usable during development.

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
- OpenRouter SDK for AI recipe generation
- Vitest for unit tests
- ESLint with the Next.js config

## How It Works

1. The user enters ingredients in the recipe planner.
2. The frontend sends the ingredients and selected style to `POST /api/recipes`.
3. The API validates the request and parses the ingredient text.
4. The use case calls a recipe generator.
5. If `OPENROUTER_API_KEY` is set, the app asks OpenRouter for recipe JSON.
6. If the AI call fails or no API key is set, the app returns local Burmese recipe suggestions.

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local` for real AI results:

```bash
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`OPENROUTER_MODEL` and `NEXT_PUBLIC_APP_URL` are optional. The app has defaults for both.

## Run Locally

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm test
```

## Project Structure

- `src/app/` contains Next.js routes, layout, and API endpoints.
- `src/app/api/recipes/route.ts` handles recipe generation requests.
- `src/components/ui/` contains reusable UI components.
- `src/features/recipes/domain/` contains recipe types and ingredient parsing.
- `src/features/recipes/application/` contains the recipe generation use case and interface.
- `src/features/recipes/infrastructure/` contains OpenRouter, AI output parsing, error fallback, and local recipe generators.
- `src/features/recipes/presentation/` contains the recipe planner UI.
- `src/lib/` contains shared helpers.
- `tests/` contains Vitest tests for recipe logic and API configuration.

## Current Features

- Ingredient text input with duplicate removal.
- Quick ingredient buttons.
- Cooking style selection.
- Burmese recipe cards.
- Cook time, difficulty, matching ingredients, missing ingredients, steps, and tips.
- OpenRouter AI recipe generation.
- Local fallback recipes when AI is unavailable.
- Request size, content type, JSON, and ingredient validation in the API.
- Unit tests for parsing, local generation, AI output cleanup, OpenRouter behavior, and route config.
