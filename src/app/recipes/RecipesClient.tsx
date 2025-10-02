"use client";

import { useMemo, useState } from "react";
import { useRecipeStore } from "@/store/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import TagPill from "@/components/TagPill";
import type { Recipe } from "@/types/recipe";

type Props = { initialQuery?: string };

export default function RecipesClient({ initialQuery = "" }: Props) {
  // 🔹 get recipes directly from the store
  const recipes = useRecipeStore((s) => s.recipes);

  const chipsOf = (r: Recipe): string[] => [
    ...(r.categories ?? []),
    ...(((r as any).extraTags as string[]) ?? []),
  ];

  const allTags = useMemo(() => {
    const set = new Set<string>();
    (recipes ?? []).forEach((r) => chipsOf(r).forEach((t) => set.add(t)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [recipes]);

  const [query, setQuery] = useState(initialQuery);
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const toggleTag = (tag: string) =>
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );

  const clearFilters = () => {
    setQuery("");
    setActiveTags([]);
  };

  const filtered = useMemo(() => {
    const list = recipes ?? [];
    const q = query.trim().toLowerCase();

    return list.filter((r) => {
      const title = r.title?.toLowerCase?.() ?? "";
      const desc = (r.description ?? "").toLowerCase();
      const chips = chipsOf(r);

      const matchesQuery =
        !q ||
        title.includes(q) ||
        desc.includes(q) ||
        chips.some((t) => t.toLowerCase().includes(q));

      const matchesTags =
        activeTags.length === 0 || activeTags.every((t) => chips.includes(t));

      return matchesQuery && matchesTags;
    });
  }, [recipes, query, activeTags]);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes…"
          className="w-full md:w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          aria-label="Search recipes"
        />
        {(query || activeTags.length > 0) && (
          <button type="button" onClick={clearFilters} className="text-sm underline">
            Clear
          </button>
        )}
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((t) => (
            <TagPill
              key={t}
              tag={t}
              active={activeTags.includes(t)}
              onClick={toggleTag}
            />
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-500 italic">No recipes match.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </section>
  );
}
