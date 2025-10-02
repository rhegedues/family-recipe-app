"use client";

import Link from "next/link";
import TagPill from "./TagPill";
import type { Recipe } from "@/types/recipe";

type Props = {
  recipe: Recipe;
  onTagClick?: (tag: string) => void; // optional, not required
};

export function RecipeCard({ recipe, onTagClick }: Props) {
  const tags = ((recipe as any).tags as string[] | undefined) ?? [];
  const categories = ((recipe as any).categories as string[] | undefined) ?? [];
  const extraTags = ((recipe as any).extraTags as string[] | undefined) ?? [];

  return (
    <div className="group rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-tight">
          <Link href={`/recipes/${recipe.id}`} className="hover:underline">
            {recipe.title}
          </Link>
        </h3>
      </div>

      {recipe.description ? (
        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{recipe.description}</p>
      ) : null}

      {/* show categories / extraTags if present */}
      {(categories.length || extraTags.length) ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {categories.map((t) => (
            <TagPill key={`cat-${t}`} tag={t} />
          ))}
          {extraTags.map((t) => (
            <TagPill key={`x-${t}`} tag={t} />
          ))}
        </div>
      ) : null}

      {/* show main tags (the ones we filter by) */}
      {tags.length ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <TagPill
              key={`tag-${t}`}
              tag={t}
              onClick={onTagClick}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
