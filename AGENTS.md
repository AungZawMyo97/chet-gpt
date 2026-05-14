# Repository Guidelines

## Project Explanation & Language Versions

This project is named "Chet-GPT". It helps solve the daily "what should we cook today?" problem. The user enters ingredients they already have, like chicken, onion, shallots, eggs, or vegetables. The app then suggests Burmese home recipes and lets the user choose a cooking style.

Use these systems:

- Next.js 16+ with App Router and TypeScript
- React 19
- Tailwind CSS 4
- shadcn/ui latest version
- OpenRouter for AI recipe generation
- Vitest for focused unit tests

Please always follow SOLID principles and Clean Code Architecture.
Generate output in simple English and avoid complicated wording.

## What Has Been Done So Far

- Created a Next.js 16 App Router project with TypeScript.
- Added Tailwind CSS 4 styling.
- Added shadcn/ui style components in `src/components/ui/`.
- Built the main recipe planner screen in `src/features/recipes/presentation/recipe-planner.tsx`.
- Added ingredient input, quick ingredient buttons, cooking style selection, loading state, error state, and recipe result cards.
- Added `POST /api/recipes` in `src/app/api/recipes/route.ts`.
- Added API validation for request size, content type, JSON body, ingredient type, empty ingredients, and long ingredient text.
- Added Clean Architecture style recipe modules:
  - Domain types and parsing in `src/features/recipes/domain/`.
  - Recipe generation use case and generator interface in `src/features/recipes/application/`.
  - OpenRouter, AI JSON parsing, AI error fallback, and local recipe generation in `src/features/recipes/infrastructure/`.
- Added OpenRouter AI recipe generation using `@openrouter/sdk`.
- Added local recipe fallback when no API key exists or the AI request fails.
- Added tests in `tests/` for ingredient parsing, local recipe generation, OpenRouter fallback behavior, AI output parsing, and route configuration.

## Project Structure & Module Organization

Keep the layout predictable and shallow:

- `src/` for application source code and reusable modules.
- `src/app/` for Next.js routes, layout, pages, and API endpoints.
- `src/assets/` for images, fonts, and static media imported by the app.
- `src/components/` for reusable components.
- `src/components/ui/` for shadcn/ui style components.
- `src/features/recipes/` for the recipe feature.
- `src/lib/` for shared helpers.
- `public/` for files served directly without bundling.
- `tests/` or colocated `*.test.*` files for automated tests.
- `docs/` for design notes, setup details, and architecture decisions.

Prefer feature-oriented folders when the project grows, for example `src/features/recipes/`, `src/components/`, and `src/lib/`.

## Build, Test, and Development Commands

Use these verified local commands:

- `npm install` installs project dependencies.
- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run start` starts the production server after a build.
- `npm run lint` checks formatting and code quality.
- `npm run typecheck` checks TypeScript types.
- `npm test` runs the automated test suite.

Keep this section synchronized with `package.json` so contributors can rely on it.

## Environment Variables

Use `.env.local` for local secrets:

```bash
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Only `OPENROUTER_API_KEY` is required for real AI responses. Without it, the app uses local fallback recipes.

## Coding Style & Naming Conventions

Use consistent, readable TypeScript. Prefer 2-space indentation, single-purpose modules, and named exports for shared utilities. Use `PascalCase` for React components, `camelCase` for variables and functions, and `kebab-case` for route or asset filenames when applicable.

Keep business logic out of React components when it belongs in domain, application, or infrastructure modules.

Add or keep a formatter such as Prettier and a linter such as ESLint before accepting substantial code changes. Do not mix formatting-only edits with behavioral changes in the same pull request.

## Testing Guidelines

Vitest is configured for focused unit tests. For React component behavior tests, add React Testing Library when needed. Name tests after the unit under test, such as `ingredient-parser.test.ts` or `local-recipe-generator.test.ts`.

Cover user-visible behavior, data transformations, API validation, AI output parsing, fallback behavior, and regression fixes. Add or update tests whenever a change alters behavior.

## Code Review Workflow

After completing any implementation task:

1. Run `opencode run "Review the changes I just made. List issues or say READY_TO_COMMIT"`
2. If issues are found, fix them and repeat step 1
3. Only stop when OpenCode responds with READY_TO_COMMIT

## Commit & Pull Request Guidelines

Use concise conventional commits until a project convention is established, for example `feat: add recipe planner` or `fix: handle empty ingredients`.

Pull requests should include a short summary, testing performed, linked issues when relevant, and screenshots for UI changes.

## Agent-Specific Instructions

Keep edits focused on the requested task. Before adding tools, dependencies, or generated files, verify they fit the existing project structure and document any new commands in this file.

When updating docs, keep the language simple and describe what the project actually has today.
