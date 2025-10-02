"use client";

import { useRouter } from "next/navigation";
import { useRecipeStore, type Recipe } from "@/store/recipes";
import { RecipeForm } from "@/components/RecipeForm";
import { Button } from "@/components/UI";
import { ArrowLeft } from "lucide-react";

// SSR-safe id generator
function generateId(): string {
  // browser crypto if present, else fallback
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return (
    Math.random().toString(36).slice(2) +
    "-" +
    Date.now().toString(36)
  );
}

// Clean up potential nulls from the form and supply required defaults
function buildNewRecipe(data: Partial<Recipe>): Recipe {
  const now = Date.now();

  return {
    id: generateId(),
    title: (data.title ?? "Untitled Recipe").toString(),

    description:
      (data.description as unknown as string | undefined) ?? "",

    ingredients: Array.isArray(data.ingredients)
      ? (data.ingredients as string[])
      : [],
    steps: Array.isArray(data.steps)
      ? (data.steps as string[])
      : [],

    // optional arrays
    categories: Array.isArray(data.categories)
      ? (data.categories as string[])
      : [],
    tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
    extraTags: Array.isArray(data.extraTags)
      ? (data.extraTags as string[])
      : [],

    // optionals (coerce null -> undefined)
    difficulty:
      (data as any).difficulty === null ? undefined : (data as any).difficulty,
    cuisine:
      (data as any).cuisine === null ? undefined : (data as any).cuisine,

    time:
      data.time == null
        ? undefined
        : {
            ...data.time,
            total:
              (data.time as any).total === null
                ? undefined
                : (data.time as any).total,
          },

    // timestamps (Sprint 2 UI handled number|string|Date)
    createdAt: now,
    updatedAt: now,

    // keep if your type includes it; harmless if ignored
    schemaVersion: (data as any).schemaVersion ?? 1,
  };
}

export default function NewRecipePage() {
  const router = useRouter();
  const { addRecipe } = useRecipeStore();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4">
        <Button
          variant="secondary"
          onClick={() => router.push("/recipes")}
          iconLeft={<ArrowLeft className="h-4 w-4" />}
        >
          Back to Recipes
        </Button>
      </div>

      <h1 className="mb-6 text-3xl font-bold text-gray-900">New Recipe</h1>

      <RecipeForm
        submitLabel="Create"
        onCancel={() => router.push("/recipes")}
        onSubmit={(data) => {
          const newRecipe = buildNewRecipe(data as Partial<Recipe>);
          addRecipe(newRecipe);                       // ✅ pass a full Recipe
          router.push(`/recipes/${encodeURIComponent(newRecipe.id)}`); // go to detail
        }}
      />
    </main>
  );
}
