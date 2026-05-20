# UI Design & Aesthetics

Chet-GPT features a custom-themed, responsive user interface styled with **Tailwind CSS 4** and built upon modular **shadcn/ui** components. The interface avoids cold, generic styles, opting for a warm, organic culinary aesthetic.

## 1. Color Palette & Styling Tokens

The application leverages a rich, natural color theme designed to feel inviting and food-centric:

| CSS Value / Token | Primary Usage | Visual Feel |
| :--- | :--- | :--- |
| **`#f8f6ed`** | Main body page background | Soft cream, organic paper-like background |
| **`#fffdf6`** | Card and header container panels | Bright warm white |
| **`#252417`** | Primary typography and headings | Charcoal black with olive undertones |
| **`#f1d36a`** | Prominent brand badges, buttons, active highlights | Vibrant warm mustard yellow |
| **`#5b6f2f`** | Leafy badges, secondary tags, success highlights | Sage/forest green |
| **`#68624c`** | Descriptive labels and subtext | Medium-toned, warm gray-green |
| **`#d9d0b8`** | Borders, separators, and outline bounds | Subtle tan/beige dividers |

---

## 2. Page Layout Structure

The layout is built with standard HTML5 semantic elements and utilizes a mobile-first, highly fluid responsive grid:

```text
+--------------------------------------------------------------+
|                         App Header                           |
+--------------------------------------------------------------+
|                         Hero Panel                           |
+--------------------------------------------------------------+
|  [ Left: Ingredient Panel ]   |   [ Right: Results Section ] |
|  * Textarea Input             |   * Action Note Banner       |
|  * Popular Quick Items        |   * 3x Recipe Suggestion Cards|
|  * Style Selector & Search    |                              |
+--------------------------------------------------------------+
```

### Layout Behavior by Viewport

* **Small Screens (Mobile)**:
  * Single-column flow. The `HeroPanel` fits the viewport width.
  * The `IngredientPanel` renders above the recipe result list, keeping key inputs easily accessible.
  * Recipe result cards stack vertically (`grid-cols-1`).
* **Large Screens (`lg` and up)**:
  * Two-column grid (`lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]`).
  * The `IngredientPanel` uses CSS stickiness (`lg:sticky lg:top-20`) to remain in view as the user scrolls down large recipe recipe outputs.
  * The `ResultsSection` dynamically lays out 3 recipe cards across a 2-column or 3-column grid (`md:grid-cols-2 xl:grid-cols-3`), maximizing screen utilization.

---

## 3. Key Components & Features

### A. App Header
* Renders a custom-sized logo (`40px` wrapper with standard fallback object cover).
* High-profile **AI Chef** pill badge styled in warm mustard (`#f1d36a`) using a `Sparkles` icon to call out AI assistance.

### B. Hero Panel
* Highlights active kitchen statistics (e.g., active parsed ingredient counts).
* Emphasizes the culinary style using custom green and white badge configurations.

### C. Ingredient Panel (`src/features/recipes/presentation/recipe-planner.tsx`)
* **Dynamic Textarea**: Takes raw string inputs, which are parsed reactively into badges shown under the "Selected Ingredients" section.
* **Quick Ingredient Buttons**: A list of popular items (`ကြက်သား`, `ကြက်ဥ`, `ငါး`, etc.). Clicking any button immediately appends the ingredient to the input field, removing duplicate commas or duplicate entries automatically.
* **Cooking Style Select**: Custom select engine from `shadcn/ui` styled with soft borders (`#d9d0b8`) and warm backgrounds (`#fbf8ee`), mapping styles to localized Burmese descriptors (`ဘာမဆို`, `မြန်မြန်ချက်`, `မိသားစုစား`, `အစပ်`, `ကျန်းမာရေး`, `ချွေတာ`).
* **AI Model Selection Menu**: Renders a custom `Select` dropdown loaded dynamically via **Axios** (secure version `1.16.1`) from the external JSON asset (`public/models.json`). If the external JSON fetch fails, a secure offline fallback model array is constructed on the client, initializing a default Gemma 4 26B selection to maintain absolute availability.
* **Responsive Grid Alignment**: On small and medium screens (tablet/mobile), the cooking style selector and the AI model selector are arranged side-by-side inside a `sm:grid-cols-2` layout, while the "ဟင်းရှာမယ်" (Search) action button spans the full width underneath. On large screens (`lg`), they stack vertically in a single column (`lg:grid-cols-1`).

### D. Recipe Cards
* **Dynamic Accent Coloring**: Cards use index-based color schemes (`index % 3`) to cycle through three beautiful brand headers:
  * Index 0: Dark Sage (`#2f3b1f` background with white text)
  * Index 1: Light Leafy Green (`#5b6f2f` background with white text)
  * Index 2: Mustard Yellow (`#f1d36a` background with dark charcoal text)
* **Metadata Pills**: Displays cook times using `Clock3` icons and highlights difficulty levels.
* **Ingredient Badges**: Displays overlapping ingredient chips with responsive text flow.
* **Step Guides**: Uses custom list numbers styled in warm yellow circles.
* **Chef's Tip Callout**: A custom-bordered box showing a highlighted tips banner for extra culinary advice.
