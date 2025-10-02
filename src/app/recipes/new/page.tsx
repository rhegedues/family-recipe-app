"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { useRecipeStore } from "@/store/recipes";
import { RecipeForm } from "@/components/RecipeForm";
import type { Recipe } from "@/types/recipe";

// tiny local id helper (uses crypto if available)
const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function buildNewRecipe(data: Partial<Recipe>): Recipe {
  const nowIso = new Date().toISOString();

  return {
    id: generateId(),
    title: (data.title ?? "Untitled Recipe").toString(),
    description: (data.description as string | undefined) ?? "",

    // content
    ingredients: Array.isArray(data.ingredients) ? (data.ingredients as string[]) : [],
    steps: Array.isArray(data.steps) ? (data.steps as string[]) : [],

    // canonical categories + optional extra tags
    categories: Array.isArray(data.categories) ? (data.categories as string[]) : [],
    extraTags: Array.isArray((data as any)?.extraTags) ? ((data as any).extraTags as string[]) : [],

    // optionals (coerce null -> undefined)
    difficulty: (data as any)?.difficulty ?? undefined,
    cuisine: (data as any)?.cuisine ?? undefined,
    time:
      (data as any)?.time == null
        ? undefined
        : {
            ...(data as any).time,
            total:
              (data as any).time?.total == null
                ? undefined
                : (data as any).time.total,
          },

    // bookkeeping
    createdAt: nowIso,
    updatedAt: nowIso,

    // schema (harmless if your type ignores it)
    schemaVersion: (data as any)?.schemaVersion ?? 1,
  };
}

export default function NewRecipePage() {
  const router = useRouter();
  const { addRecipe } = useRecipeStore();

  const handleSubmit = (data: Partial<Recipe>) => {
    const recipe = buildNewRecipe(data);
    addRecipe(recipe);
    router.push("/recipes");
  };

  const initial: Partial<Recipe> = {
    title: "",
    description: "",
    categories: [],
    extraTags: [],
    ingredients: [],
    steps: [],
  };

  return (
    <main className="mx-auto max-w-3xl p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">New Recipe</h1>
        <Link href="/recipes" className="text-sm underline">
          ← Back to recipes
        </Link>
      </div>

      <RecipeForm initial={initial} onSubmit={handleSubmit} />
    </main>
  );
}
