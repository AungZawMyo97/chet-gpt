"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import {
  ChevronRight,
  Clock3,
  Flame,
  Loader2,
  Plus,
  Search,
  ShoppingBasket,
  Sparkles,
  Utensils,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { parseIngredients } from "@/features/recipes/domain/ingredient-parser";
import type {
  RecipeDifficulty,
  RecipeResult,
  RecipeStyle,
  RecipeSuggestion,
} from "@/features/recipes/domain/recipe";

interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

const quickIngredients = [
  "ကြက်သား",
  "ကြက်ဥ",
  "ငါး",
  "ပုစွန်",
  "ကြက်သွန်နီ",
  "ကြက်သွန်ဖြူ",
  "ခရမ်းချဉ်သီး",
  "အာလူး",
];

const styleLabels: Record<RecipeStyle, string> = {
  any: "ဘာမဆို",
  quick: "မြန်မြန်ချက်",
  family: "မိသားစုစား",
  spicy: "အစပ်",
  healthy: "ကျန်းမာရေး",
  budget: "ချွေတာ",
};

const difficultyLabels: Record<RecipeDifficulty, string> = {
  Easy: "လွယ်",
  Medium: "အသင့်",
  Hard: "ခက်",
};

export function RecipePlanner() {
  const [ingredients, setIngredients] = useState(
    "ကြက်သား၊ ကြက်သွန်နီ၊ ကြက်သွန်ဖြူ၊ ခရမ်းချဉ်သီး",
  );
  const [style, setStyle] = useState<RecipeStyle>("any");
  const [result, setResult] = useState<RecipeResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [resultVersion, setResultVersion] = useState(0);

  useEffect(() => {
    async function loadModels() {
      try {
        const response = await axios.get<AIModel[]>("/models.json");
        setModels(response.data);
        if (response.data.length > 0) {
          setSelectedModel(response.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load models via Axios:", err);
        const defaultModels = [
          {
            id: "gemini-3.8-flash",
            name: "Gemini 3.8 Flash",
            provider: "Google AI",
            description: "Fast and powerful model, optimized for speed and efficiency."
          }
        ];
        setModels(defaultModels);
        setSelectedModel(defaultModels[0].id);
      }
    }
    loadModels();
  }, []);

  const parsedIngredients = useMemo(
    () => parseIngredients(ingredients),
    [ingredients],
  );
  const canSubmit = parsedIngredients.length > 0 && !isLoading;

  async function handleSubmit() {
    if (parsedIngredients.length === 0) {
      setError("ပါဝင်ပစ္စည်း အနည်းဆုံးတစ်ခု ထည့်ပါ။");
      return;
    }

    setIsLoading(true);
    setError("");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45_000);

    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, style, model: selectedModel }),
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "ဟင်းချက်နည်း ရှာမရပါ။");
      }

      setResult(data as RecipeResult);
      setResultVersion((currentVersion) => currentVersion + 1);
    } catch (requestError) {
      setError(
        requestError instanceof DOMException &&
          requestError.name === "AbortError"
          ? "အချိန်ကြာသွားပါသည်။ ပိုမြန်သော Gemini model တစ်ခုဖြင့် ပြန်စမ်းပါ။"
          : requestError instanceof Error
            ? requestError.message
            : "ဟင်းချက်နည်း ရှာမရပါ။",
      );
    } finally {
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    }
  }

  function addIngredient(ingredient: string) {
    if (parsedIngredients.includes(ingredient.toLowerCase())) {
      return;
    }

    setIngredients((currentValue) =>
      currentValue.trim()
        ? `${currentValue.trim()}၊ ${ingredient}`
        : ingredient,
    );
  }

  function removeIngredient(ingredientToRemove: string) {
    const updated = parsedIngredients
      .filter((item) => item !== ingredientToRemove)
      .join("၊ ");
    setIngredients(updated);
  }

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#f8f6ed] text-[#252417]">
      <AppHeader />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:gap-8 lg:px-8 lg:py-8">
        <HeroPanel ingredientCount={parsedIngredients.length} />

        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
          <IngredientPanel
            ingredients={ingredients}
            parsedIngredients={parsedIngredients}
            style={style}
            error={error}
            isLoading={isLoading}
            canSubmit={canSubmit}
            onIngredientsChange={setIngredients}
            onStyleChange={setStyle}
            onIngredientAdd={addIngredient}
            onIngredientRemove={removeIngredient}
            onSubmit={handleSubmit}
            models={models}
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          <ResultsSection key={resultVersion} result={result} />
        </div>
      </div>
    </main>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#d9d0b8] bg-[#fffdf6]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-[#f1d36a] ring-1 ring-[#2f3b1f]/20">
            <Image
              src="/chet-gpt.png"
              alt="Chet-GPT"
              fill
              priority
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-[#5b6f2f]">
              Chet-GPT
            </p>
            <h1 className="truncate text-sm font-black sm:text-base">
              ဒီနေ့ ဘာချက်မလဲ
            </h1>
          </div>
        </div>
        <Badge className="h-8 shrink-0 rounded-lg border border-[#2f3b1f]/15 bg-[#f1d36a] px-2.5 sm:px-3 font-black text-[#252417] hover:bg-[#f1d36a]">
          <Sparkles className="size-3.5" aria-hidden="true" />
          <span className="hidden min-[400px]:inline ml-1.5">AI Chef</span>
        </Badge>
      </div>
    </header>
  );
}

function HeroPanel({ ingredientCount }: { ingredientCount: number }) {
  return (
    <section className="overflow-hidden rounded-lg border border-[#cfc5aa] bg-[#f1d36a] text-[#252417] shadow-sm">
      <div className="h-2 bg-[#2f3b1f]" />
      <div className="grid min-w-0 gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:p-6 lg:p-8">
        <div className="min-w-0 space-y-3 sm:space-y-4">
          <Badge className="h-7 rounded-lg border border-[#2f3b1f]/15 bg-[#fffdf6] px-2.5 font-black text-[#2f3b1f] hover:bg-[#fffdf6]">
            <Flame className="size-3.5" aria-hidden="true" />
            Smart kitchen
          </Badge>
          <div className="max-w-3xl space-y-2">
            <h2 className="text-balance text-2xl font-black leading-9 sm:text-4xl sm:leading-12">
              အိမ်မှာရှိတာနဲ့ စားချင်စရာ ဟင်း menu ရှာမယ်
            </h2>
            <p className="max-w-2xl text-sm font-semibold leading-6 text-[#3e3b28] sm:text-base sm:leading-7">
              ပါဝင်ပစ္စည်းတွေထည့်ပြီး သန့်ရှင်းတဲ့ပုံစံနဲ့ မြန်မြန်၊ ရှင်းရှင်း
              ဟင်းရွေးပါ။
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="h-8 rounded-lg border border-[#2f3b1f]/15 bg-[#fffdf6] px-3 font-black text-[#252417] hover:bg-[#fffdf6]">
              {ingredientCount} ပစ္စည်း
            </Badge>
            <Badge className="h-8 rounded-lg border border-[#2f3b1f]/20 bg-[#5b6f2f] px-3 font-black text-white hover:bg-[#5b6f2f]">
              မြန်မာဟင်း
            </Badge>
          </div>
        </div>

        <div className="hidden min-w-56 items-center gap-3 rounded-lg border border-[#2f3b1f]/15 bg-[#fffdf6] p-3 text-[#252417] shadow-sm sm:flex">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-[#f8f6ed]">
            <Image
              src="/chet-gpt.png"
              alt="Chet-GPT logo"
              fill
              sizes="72px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-[#5b6f2f]">
              Open now
            </p>
            <p className="text-sm font-black leading-6">
              ပါဝင်ပစ္စည်းထည့်ပြီး menu ကြည့်ပါ
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function IngredientPanel({
  ingredients,
  parsedIngredients,
  style,
  error,
  isLoading,
  canSubmit,
  onIngredientsChange,
  onStyleChange,
  onIngredientAdd,
  onIngredientRemove,
  onSubmit,
  models,
  selectedModel,
  onModelChange,
}: {
  ingredients: string;
  parsedIngredients: string[];
  style: RecipeStyle;
  error: string;
  isLoading: boolean;
  canSubmit: boolean;
  onIngredientsChange: (value: string) => void;
  onStyleChange: (value: RecipeStyle) => void;
  onIngredientAdd: (ingredient: string) => void;
  onIngredientRemove: (ingredient: string) => void;
  onSubmit: () => void;
  models: AIModel[];
  selectedModel: string;
  onModelChange: (value: string) => void;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-[#d9d0b8] bg-[#fffdf6] p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-black">သင့်မီးဖိုချောင်</h2>
          <p className="mt-1 text-sm leading-6 text-[#68624c]">
            ရှိတဲ့ပစ္စည်းတွေထည့်ပြီး ဟင်း menu ရှာပါ။
          </p>
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f1d36a] text-[#2f3b1f] ring-1 ring-[#2f3b1f]/15">
          <ShoppingBasket className="size-5" aria-hidden="true" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-bold" htmlFor="ingredients">
            ပါဝင်ပစ္စည်းများ
          </label>
          <Textarea
            id="ingredients"
            value={ingredients}
            onChange={(event) => onIngredientsChange(event.target.value)}
            className="min-h-32 w-full max-w-full resize-none rounded-lg border-[#d9d0b8] bg-[#fbf8ee] px-3 py-3 text-base leading-7 shadow-none focus-visible:border-[#b8992f] focus-visible:ring-[#b8992f]/25"
            placeholder="ကြက်သား၊ ကြက်သွန်နီ၊ ခရမ်းချဉ်သီး"
          />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-black text-[#252417]">Popular items</p>
          <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-4 lg:grid-cols-8">
            {quickIngredients.map((ingredient) => (
              <Button
                key={ingredient}
                type="button"
                variant="outline"
                size="sm"
                className="h-10 min-w-0 justify-start rounded-lg border-[#d9d0b8] bg-[#fffdf6] px-2 sm:px-3 font-bold text-[#34311f] gap-1.5 shadow-none hover:border-[#b8992f] hover:bg-[#f4e7a7] hover:text-[#252417]"
                onClick={() => onIngredientAdd(ingredient)}
              >
                <Plus className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="min-w-0 truncate">{ingredient}</span>
              </Button>
            ))}
          </div>
        </div>

        <SelectedIngredients
          ingredients={parsedIngredients}
          onRemove={onIngredientRemove}
        />

        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-bold" htmlFor="style">
              ချက်ချင်တဲ့ပုံစံ
            </label>
            <Select
              value={style}
              onValueChange={(value) => onStyleChange(value as RecipeStyle)}
            >
              <SelectTrigger
                id="style"
                className="h-11 w-full rounded-lg border-[#d9d0b8] bg-[#fbf8ee] font-bold shadow-none focus:ring-[#b8992f]/25"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(styleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold" htmlFor="model">
              သုံးမည့် AI Model
            </label>
            <Select
              value={selectedModel}
              onValueChange={(val) => val && onModelChange(val)}
            >
              <SelectTrigger
                id="model"
                className="h-11 w-full rounded-lg border-[#d9d0b8] bg-[#fbf8ee] font-bold shadow-none focus:ring-[#b8992f]/25"
              >
                <SelectValue>
                  {models.find((m) => m.id === selectedModel)?.name || "Model ရွေးချယ်ပါ"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          type="button"
          className="h-11 w-full rounded-lg border border-[#2f3b1f]/20 bg-[#f1d36a] px-4 text-base font-black text-[#252417] shadow-sm hover:bg-[#e3c245]"
          onClick={onSubmit}
          disabled={!canSubmit}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="size-4" aria-hidden="true" />
          )}
          <span className="truncate">
            {isLoading ? "ရှာနေသည်..." : "ဟင်းရှာမယ်"}
          </span>
        </Button>

        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function SelectedIngredients({
  ingredients,
  onRemove,
}: {
  ingredients: string[];
  onRemove: (ingredient: string) => void;
}) {
  if (ingredients.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#b8ab89] bg-[#f8f0c4] p-3 text-sm leading-6 text-[#68624c]">
        ရွေးပြီးသားပစ္စည်းတွေ ဒီနေရာမှာ ပေါ်လာမယ်။
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-black text-[#252417]">ရွေးပြီးသား</p>
        <span className="rounded-lg bg-[#5b6f2f] px-2 py-0.5 text-xs font-black text-white">
          {ingredients.length} ခု
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ingredient) => (
          <Badge
            key={ingredient}
            variant="secondary"
            className="group h-auto max-w-full whitespace-normal rounded-lg border border-[#5b6f2f]/20 bg-[#eef4dc] pl-2.5 pr-1.5 py-1 text-left font-bold leading-5 text-[#3f5720] hover:bg-[#eef4dc] flex items-center gap-1"
          >
            <span className="min-w-0 truncate">{ingredient}</span>
            <button
              type="button"
              onClick={() => onRemove(ingredient)}
              className="rounded-full p-0.5 text-[#5b6f2f]/60 hover:bg-[#5b6f2f]/10 hover:text-[#5b6f2f] focus:outline-none transition-colors"
              aria-label={`Remove ${ingredient}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-3"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ResultsSection({ result }: { result: RecipeResult | null }) {
  const recipes = result?.recipes ?? [];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!result || !result.recipes || result.recipes.length <= 1 || isHovered) {
      return;
    }

    const intervalId = setInterval(() => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;
      const recipesCount = result.recipes.length;
      const nextIndex = (activeScrollIndex + 1) % recipesCount;

      const cardElement = container.children[nextIndex] as HTMLElement;
      if (cardElement) {
        const cardLeftRelativeToContainer = cardElement.offsetLeft - container.offsetLeft;
        const firstChild = container.children[0] as HTMLElement;
        const containerPadding = firstChild ? (firstChild.offsetLeft - container.offsetLeft) : 0;

        container.scrollTo({
          left: cardLeftRelativeToContainer - containerPadding,
          behavior: "smooth",
        });
        setActiveScrollIndex(nextIndex);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [result, activeScrollIndex, isHovered]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const firstChild = container.children[0] as HTMLElement;
    const cardWidth = firstChild?.getBoundingClientRect().width ?? 300;
    if (cardWidth <= 0) return;
    const gap = 16; // gap-4 is 16px
    const index = Math.round(container.scrollLeft / (cardWidth + gap));

    if (index >= 0 && index < recipes.length && index !== activeScrollIndex) {
      setActiveScrollIndex(index);
    }
  };

  return (
    <section className="min-w-0 space-y-4 sm:space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-lg border border-[#d9d0b8] bg-[#fffdf6] p-4 shadow-sm sm:flex-row sm:items-center sm:p-5 lg:p-6">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-wide text-[#5b6f2f]">
            Recommended
          </p>
          <h2 className="mt-1 text-xl font-black sm:text-2xl">
            ဟင်းရွေးချယ်စရာများ
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="h-8 rounded-lg border-[#d9d0b8] bg-[#f8f0c4] px-3 font-black text-[#5f4a10]"
          >
            {recipes.length} ခု
          </Badge>
        </div>
      </div>

      {result?.note ? (
        <p className="rounded-lg border border-[#e0b84d] bg-[#fff5c7] p-3 text-sm leading-6 text-[#4f3911]">
          {result.note}
        </p>
      ) : null}

      {recipes.length > 0 ? (
        <div className="min-w-0">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="scrollbar-custom flex gap-4 overflow-x-auto py-1 snap-x snap-mandatory scroll-smooth"
          >
            {recipes.map((recipe, index) => (
              <div
                key={recipe.id}
                className="w-full sm:w-[340px] md:w-[calc(50%-0.5rem)] lg:w-[calc((100%-2rem)/3)] shrink-0 snap-start"
              >
                <RecipeCard recipe={recipe} index={index} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyResults />
      )}
    </section>
  );
}

function EmptyResults() {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border border-dashed border-[#b8ab89] bg-[#fffdf6] p-4 text-center shadow-sm sm:min-h-72 sm:p-5 lg:p-6">
      <div className="max-w-sm space-y-3">
        <div className="mx-auto flex size-14 items-center justify-center rounded-lg bg-[#f1d36a] text-[#2f3b1f] ring-1 ring-[#2f3b1f]/15">
          <Utensils className="size-7" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black">စားချင်စရာ menu မရှိသေးပါ</h3>
          <p className="text-sm leading-6 text-[#68624c]">
            ပါဝင်ပစ္စည်းတွေထည့်ပြီး ဟင်းရှာမယ် ကို နှိပ်ပါ။
          </p>
        </div>
      </div>
    </div>
  );
}

function RecipeCard({
  recipe,
  index,
}: {
  recipe: RecipeSuggestion;
  index: number;
}) {
  const cardTones = [
    "bg-[#2f3b1f] text-white",
    "bg-[#5b6f2f] text-white",
    "bg-[#f1d36a] text-[#252417]",
  ];
  const tone = cardTones[index % cardTones.length];

  return (
    <Card className="min-w-0 gap-0 rounded-lg border border-[#d9d0b8] bg-[#fffdf6] py-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`flex h-20 items-center justify-between p-4 sm:p-5 lg:p-6 ${tone}`}
      >
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-wide opacity-85">
            Chef Choice
          </p>
          <p className="mt-0.5 text-base font-black leading-6 wrap-anywhere">
            အကြံပြုဟင်းလျာ ( {index + 1} )
          </p>
        </div>
        <div className="ml-3 flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#fffdf6]/20 backdrop-blur-sm text-current sm:size-11">
          <Sparkles className="size-5 shrink-0" aria-hidden="true" />
        </div>
      </div>

      <CardHeader className="min-w-0 gap-3 p-4 sm:p-5 lg:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-lg font-black leading-loose wrap-anywhere">
              {recipe.burmeseTitle}
            </CardTitle>
            <CardDescription className="leading-6 wrap-anywhere">
              {recipe.title}
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#f8f0c4] px-2.5 py-1 text-xs font-black text-[#5f4a10]">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {recipe.cookTimeMinutes} မိနစ်
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className="h-auto rounded-lg border border-[#e0b84d]/35 bg-[#fff5c7] px-2.5 py-1 font-black text-[#5f4a10] hover:bg-[#fff5c7]">
            {difficultyLabels[recipe.difficulty] ?? recipe.difficulty}
          </Badge>
          {recipe.matchingIngredients.slice(0, 2).map((ingredient) => (
            <Badge
              key={ingredient}
              variant="outline"
              className="h-auto max-w-full whitespace-normal rounded-lg border-[#5b6f2f]/20 bg-[#eef4dc] px-2.5 py-1 text-left font-bold leading-5 text-[#3f5720]"
            >
              {ingredient}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex min-w-0 flex-col gap-4 p-4 pt-0 sm:gap-4 sm:p-5 sm:pt-0 lg:p-6 lg:pt-0">
        <p className="text-sm leading-7 text-[#4f4a36] wrap-anywhere">
          {recipe.summary}
        </p>
        <IngredientGroup
          title="ထပ်လိုနိုင်တာ"
          items={recipe.missingIngredients}
          emptyText="ထပ်လိုတာ မရှိပါ။"
        />
        <Separator />
        <ol className="space-y-2 text-sm leading-7 text-[#4f4a36]">
          {recipe.steps.slice(0, 4).map((step, stepIndex) => (
            <li key={`${recipe.id}-step-${stepIndex}`} className="flex gap-2">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#f1d36a] text-xs font-black text-[#252417]">
                {stepIndex + 1}
              </span>
              <span className="min-w-0 wrap-anywhere">{step}</span>
            </li>
          ))}
        </ol>
        <div className="flex items-start justify-between gap-3 rounded-lg border border-[#d9d0b8] bg-[#fbf8ee] p-4 text-sm leading-6 text-[#4f4a36]">
          <span className="min-w-0 wrap-anywhere">
            {recipe.tips[0] ?? "စားခါနီး အရသာကို ပြန်ညှိပါ။"}
          </span>
          <ChevronRight className="mt-1 size-4 shrink-0 text-[#5b6f2f]" />
        </div>
      </CardContent>
    </Card>
  );
}

function IngredientGroup({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText: string;
}) {
  return (
    <div className="min-w-0 space-y-2 rounded-lg border border-[#d9d0b8] bg-[#fbf8ee] p-3 sm:p-4">
      <p className="text-sm font-black">{title}</p>
      <div className="flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="h-auto max-w-full whitespace-normal rounded-lg bg-[#fffdf6] px-2.5 py-1 text-left font-bold leading-5 text-[#34311f] ring-1 ring-[#d9d0b8] hover:bg-[#fffdf6]"
            >
              {item}
            </Badge>
          ))
        ) : (
          <span className="min-w-0 text-sm leading-6 text-[#68624c] wrap-anywhere">
            {emptyText}
          </span>
        )}
      </div>
    </div>
  );
}
