"use client";

import * as React from "react";
import Link from "next/link";
import { useRecipeStore, type Recipe } from "@/store/recipes";

export default function RecipesClient({ initialQuery }: { initialQuery: string }) {
  const recipes = useRecipeStore((s) => s.recipes);

  const [query, setQuery] = React.useState(initialQuery ?? "");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter((r) =>
      [
        r.title,
        r.description,
        ...(Array.isArray(r.categories) ? r.categories : []),
        ...(Array.isArray(r.tags) ? r.tags : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [recipes, query]);

  return (
    <section className="mt-6">
      <div className="mb-4 flex items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes…"
          className="w-full max-w-md rounded-md border px-3 py-2 text-sm"
        />
        <span className="text-sm text-gray-500">{filtered.length} result(s)</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <RecipeCard recipe={r} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md border p-6 text-sm text-gray-600">
      No recipes match your search.
    </div>
  );
}

function RecipeCard({ recipe }: { recipe: Recipe }) {
  const cats =
    (Array.isArray(recipe.categories) ? recipe.categories : []) ??
    (Array.isArray((recipe as any).tags) ? (recipe as any).tags : []);

  return (
    <Link
      href={`/recipes/${encodeURIComponent(recipe.id)}`}
      className="block rounded-lg border p-4 hover:bg-gray-50"
    >
      <h3 className="mb-1 line-clamp-1 text-lg font-semibold">{recipe.title}</h3>
      {recipe.description ? (
        <p className="mb-3 line-clamp-2 text-sm text-gray-600">{String(recipe.description)}</p>
      ) : null}

      {cats?.length ? (
        <div className="flex flex-wrap gap-2">
          {cats.slice(0, 4).map((c) => (
            <span
              key={String(c)}
              className="rounded-full border px-2 py-0.5 text-xs text-gray-600"
            >
              {String(c)}
            </span>
          ))}
          {cats.length > 4 && (
            <span className="text-xs text-gray-500">+{cats.length - 4} more</span>
          )}
        </div>
      ) : null}
    </Link>
  );
}