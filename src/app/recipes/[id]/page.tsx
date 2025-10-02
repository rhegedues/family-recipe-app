"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRecipeStore } from "@/store/recipes";
import type { Recipe } from "@/types/recipe";
import { Button, Card } from "@/components/UI";
import { RecipeForm } from "@/components/RecipeForm";
import { ArrowLeft, Edit, Trash2, Clock, Users, ChefHat } from "lucide-react";

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { recipes, updateRecipe, deleteRecipe } = useRecipeStore();

  const recipeId = params.id as string;
  const recipe = recipes.find((r) => r.id === recipeId);

  const [editing, setEditing] = useState(false);

  if (!recipe) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Recipe Not Found</h1>
          <p className="mb-6 text-gray-600">The recipe you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/recipes")}>Back to Recipes</Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${recipe.title}"?\n\nThis action cannot be undone.`
    );
    if (confirmed) {
      deleteRecipe(recipe.id);
      alert(`Recipe "${recipe.title}" has been deleted successfully.`);
      router.push("/recipes");
    }
  };

  const handleEdit = () => setEditing(true);

  // --- small helper to coerce null -> undefined for optional fields
  function sanitizePatch(data: any): Partial<Recipe> {
    const patch: Partial<Recipe> = {
      ...data,
      // strings
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      difficulty:
        data.difficulty === null ? undefined : (data.difficulty as string | undefined),
      cuisine: data.cuisine === null ? undefined : (data.cuisine as string | undefined),
      // arrays (keep as-is or empty)
      categories: Array.isArray(data.categories) ? data.categories : undefined,
      tags: Array.isArray(data.tags) ? data.tags : undefined,
      extraTags: Array.isArray(data.extraTags) ? data.extraTags : undefined,
      ingredients: Array.isArray(data.ingredients) ? data.ingredients : undefined,
      steps: Array.isArray(data.steps) ? data.steps : undefined,
      // time
      time:
        data.time == null
          ? undefined
          : {
              ...data.time,
              total:
                data.time.total === null
                  ? undefined
                  : (data.time.total as number | string | undefined),
            },
    };
    return patch;
  }

  function toTimestamp(v: unknown): number | undefined {
    if (v instanceof Date) return v.getTime();
    if (typeof v === "string" || typeof v === "number") {
      const d = new Date(v);
      const t = d.getTime();
      return Number.isNaN(t) ? undefined : t;
    }
    return undefined;
  }

  function fmtDate(v: unknown): string {
    const ts = toTimestamp(v);
    return ts ? new Date(ts).toLocaleDateString() : "Unknown";
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-4">
          <Button
            variant="secondary"
            onClick={() => setEditing(false)}
            iconLeft={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
        </div>

        <RecipeForm
          initial={recipe}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={(data) => {
            const patch = sanitizePatch(data);
            updateRecipe(recipe.id, patch);  // ✅ types now compatible
            setEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header with back & actions */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => router.push("/recipes")}
          iconLeft={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
        <div className="flex-1" />
        <Button
          variant="secondary"
          onClick={handleEdit}               // opens inline editor
          iconLeft={<Edit className="h-4 w-4" />}
        >
          Edit Recipe
        </Button>
        <Button
          variant="secondary"
          onClick={handleDelete}
          iconLeft={<Trash2 className="h-4 w-4" />}
          className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
        >
          Delete Recipe
        </Button>
      </div>

      {/* Recipe Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-xl text-gray-600">{String(recipe.description)}</p>
        )}

        {/* Categories */}
        {(recipe.categories?.length ?? 0) > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {(recipe.categories ?? []).map((category) => (
              <span
                key={String(category)}
                className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800"
              >
                {String(category)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Meta Info */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Time */}
        {recipe.time?.total && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">
                  {typeof recipe.time.total === "number"
                    ? `${recipe.time.total} minutes`
                    : String(recipe.time.total)}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Difficulty */}
        {recipe.difficulty && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Difficulty</p>
                <p className="font-medium">{String(recipe.difficulty)}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Cuisine */}
        {recipe.cuisine && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <ChefHat className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Cuisine</p>
                <p className="font-medium">{String(recipe.cuisine)}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Extra Tags */}
      {(recipe.extraTags?.length ?? 0) > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {(recipe.extraTags ?? []).map((tag) => (
              <span
                key={String(tag)}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
              >
                {String(tag)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      {(recipe.ingredients?.length ?? 0) > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Ingredients</h2>
          <Card className="p-6">
            <ul className="list-inside list-disc space-y-2">
              {(recipe.ingredients ?? []).map((ingredient, idx) => (
                <li key={idx} className="leading-6 text-gray-700">
                  {String(ingredient)}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Steps */}
      {(recipe.steps?.length ?? 0) > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Instructions</h2>
          <div className="space-y-4">
            {(recipe.steps ?? []).map((step, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-center">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                    {idx + 1}
                  </span>
                  <div className="w-4" />
                  <span className="text-gray-700">
                    {String(step).replace(/\n/g, " ").trim()}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Created/Updated info */}
      <div className="mt-8 border-t border-gray-200 pt-6 text-sm text-gray-500">
  <p>Created: {fmtDate(recipe.createdAt)}</p>
  {(() => {
    const createdTs = toTimestamp(recipe.createdAt);
    const updatedTs = toTimestamp(recipe.updatedAt);
    return updatedTs && updatedTs !== createdTs ? (
      <p>Updated: {new Date(updatedTs).toLocaleDateString()}</p>
    ) : null;
  })()}
</div>
    </div>
  );
}
