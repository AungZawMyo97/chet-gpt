# Chet-GPT Technical Specifications

Welcome to the **Chet-GPT Technical Specifications** directory. This folder contains structured, up-to-date documentation on the architecture, features, API design, user interface, and testing strategy of the Chet-GPT recipe planning application.

## Directory Outline

To explore the details of each system component, follow the links below:

### 1. [Architecture & Module Organization](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/.spec/architecture.md)
* Learn about the **Clean Architecture** patterns used: Domain, Application, Infrastructure, and Presentation.
* Explore the dependency rule that guarantees business logic remains independent of frameworks and outer libraries.
* Examine the concrete flow of control from the front-end components, through API handlers, into the core use cases.

### 2. [API Documentation](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/.spec/api.md)
* View the schema and parameter specifications for the recipe generation endpoint: `POST /api/recipes`.
* Learn about request-limit defenses (e.g., maximum payload byte checks, string length capping).
* Inspect validation protocols, response structures, and details of error recovery.

### 3. [UI Design & Aesthetics](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/.spec/ui-and-design.md)
* Explore the tailored HSL color system and typographic choices using Tailwind CSS 4.
* Review details on state flows (e.g., user inputs, loading flags, error flags, responsive layout constraints).
* Look into component breakdowns, including `RecipePlanner`, `IngredientPanel`, and `RecipeCard`.

### 4. [Testing Specifications](file:///c:/Users/Jerax/Desktop/my_portfolio_react/chet-gpt/.spec/testing.md)
* Understand the **Vitest** configuration and test coverage targets.
* Review details of test suites focusing on ingredient parsing, Gemini fallbacks, AI response filters, and route validators.
* Learn patterns for mocking external network requests safely without real API keys.

---

## Core Technologies Summary

* **Core Stack**: React 19 (Client components), Next.js 16 (App Router), TypeScript 5.
* **Styling**: Tailwind CSS v4, Lucide React icons, and custom glassmorphic/flat-design accents.
* **AI Provider**: Google Gen AI SDK (`@google/genai`) for Gemini 2.5 Flash / Pro, utilizing native JSON schema constraints.
* **Fallback Strategy**: Local recipe fallback generators that operate when Google Gemini is offline or missing credentials, preserving immediate application usability.
