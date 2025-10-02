"use client";
import * as React from "react";
import { Command } from "cmdk";
import Fuse from "fuse.js";
import { useRecipeStore } from "@/store/recipes";
import type { PlannerDay, PlannerSlot } from "@/types/recipe";
import { useShortcuts, useFocusRestore } from "@/lib/useShortcuts";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  weekId: string;
  day: PlannerDay;
  slot: PlannerSlot;
};

export function QuickAddDialog({ open, onOpenChange, weekId, day, slot }: Props) {
  const { recipes, addToSlot } = useRecipeStore();
  const [query, setQuery] = React.useState("");
  
  // Focus restoration
  useFocusRestore(open);
  
  // Keyboard shortcuts
  useShortcuts({
    Escape: () => onOpenChange(false),
  }, open);

  // Reset query when dialog opens
  React.useEffect(() => {
    if (open) {
      setQuery("");
    }
  }, [open]);

  // Updated keys to match the new normalized shape
  const fuse = React.useMemo(
    () =>
      new Fuse(recipes, {
        keys: [
          "title",
          "description",
          "categories",
          "difficulty",
          "cuisine",
          "extraTags",
          "ingredients", // Add ingredients to search
        ],
        threshold: 0.2, // More strict matching
        includeScore: true,
      }),
    [recipes]
  );

  const results = React.useMemo(() => {
    if (!query) return recipes;
    
    // Use Fuse search with strict matching
    const fuseSearchResults = fuse.search(query);
    return fuseSearchResults.map((r) => r.item);
  }, [query, recipes, fuse]);

  const add = (id: string) => {
    addToSlot(weekId as any, day, slot, id);
    onOpenChange(false);
  };

  // Build the tag list for filtering
  const allTags: Array<{ category: string; tag: string }> = React.useMemo(() => {
    const out: Array<{ category: string; tag: string }> = [];

    for (const r of recipes) {
      // Categories (optional)
      for (const cat of r.categories ?? []) {
        const s = (cat ?? "").toString().trim();
        if (s) out.push({ category: "Category", tag: s });
      }

      // Difficulty (optional)
      if (r.difficulty) {
        const s = r.difficulty.toString().trim();
        if (s) out.push({ category: "Difficulty", tag: s });
      }

      // Cuisine (optional)
      if (r.cuisine) {
        const s = r.cuisine.toString().trim();
        if (s) out.push({ category: "Cuisine", tag: s });
      }

      // Extra tags (already optional)
      for (const tag of r.extraTags ?? []) {
        const s = (tag ?? "").toString().trim();
        if (s) out.push({ category: "Extra", tag: s });
      }
    }

    // de-dupe (case-insensitive)
    const seen = new Set<string>();
    return out.filter(({ category, tag }) => {
      const s = (tag ?? "").toString().trim();
      if (!s) return false;
      const key = `${category}::${s.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [recipes]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
      className={
        open
          ? "fixed inset-0 z-50 grid place-items-start p-4 pt-24 bg-black/30"
          : "hidden"
      }
      onKeyDown={(e) => {
        if (e.key === "Escape") onOpenChange(false);
      }}
    >
      <div className="mx-auto w-full max-w-xl rounded-2xl bg-white shadow-xl">
        <Command className="rounded-2xl" shouldFilter={false} loop={false}>
          <div className="border-b">
            <div className="flex items-center">
              <h2 id="quick-add-title" className="sr-only">
                Add recipe to {day} {slot}
              </h2>
              <Command.Input
                autoFocus
                value={query}
                onValueChange={setQuery}
                placeholder="Search recipes, ingredients, or tags…"
                className="flex-1 rounded-t-2xl px-4 py-3 outline-none"
                aria-describedby="quick-add-title"
              />
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close dialog"
                tabIndex={-1}
              >
                ×
              </button>
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <Command.List>
              <Command.Empty className="p-4 text-sm text-gray-500">
                No results
              </Command.Empty>

              <Command.Group heading="Recipes">
                {results.map((r) => (
                  <Command.Item
                    key={r.id}
                    onSelect={() => add(r.id)}
                    className="px-4 py-2 cursor-pointer data-[selected=true]:bg-orange-100 data-[selected=true]:text-orange-900 hover:bg-gray-100"
                  >
                    {r.title}
                  </Command.Item>
                ))}
              </Command.Group>
            </Command.List>
          </div>
        </Command>
      </div>
    </div>
  );
}
