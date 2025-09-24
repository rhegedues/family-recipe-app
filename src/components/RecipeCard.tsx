"use client";
import type { Recipe } from "@/types/recipe";
import { Card } from "@/components/UI";
import Link from "next/link";

type Props = {
  recipe: Recipe;
};

// Map categories → header color (adjust as you like)
const CATEGORY_COLOR: Record<string, string> = {
  Pasta: "#8BD17C",
  "Meat Dish": "#FCA5A5",
  Fish: "#86E3D4",
  Soup: "#B8C7FF",
  Vegetarian: "#C7F464",
  Dessert: "#F7C6A3",
  Snack: "#FFD166",
  "Side Dish": "#F4A261",
  Salad: "#90E0EF",
};

export function RecipeCard({ recipe }: Props) {

  // pick the first category to color the card
  const firstCategory = recipe.categories?.[0];
  const header = firstCategory
    ? CATEGORY_COLOR[firstCategory] ?? "#E5E7EB"
    : "#E5E7EB";

  return (
    <Card className="overflow-hidden">
      {/* Header with emoji */}
      <div
        className="h-24 flex items-center justify-center"
        style={{ background: header }}
      >
        <span className="text-5xl opacity-90">👨‍🍳</span>
      </div>

      <div className="p-4">
        <div>
          <Link href={`/recipes/${recipe.id}`} className="hover:text-orange-600 transition-colors">
            <h3 className="text-lg font-semibold">{recipe.title}</h3>
          </Link>
          {recipe.categories?.length > 0 && (
            <p className="text-xs text-gray-600">
              {recipe.categories.join(", ")}
            </p>
          )}
        </div>

        {/* Optional description */}
        {recipe.description && (
          <p className="mt-2 text-sm text-gray-600">{recipe.description}</p>
        )}

        {/* Meta info row: show if present */}
        <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-600">
          {recipe.time?.total && <span>⏱️ {typeof recipe.time.total === 'number' ? `${recipe.time.total} min` : recipe.time.total}</span>}
          {recipe.difficulty && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">
              {recipe.difficulty}
            </span>
          )}
          {recipe.cuisine && <span>🌍 {recipe.cuisine}</span>}
        </div>

        {/* Extra Tags */}
        {recipe.extraTags && recipe.extraTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {recipe.extraTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-xs text-gray-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
