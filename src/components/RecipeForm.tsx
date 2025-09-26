"use client";
import React, { useState, useEffect, useRef } from "react";
import { CATEGORY_PRESETS, TIME_OPTIONS, DIFFICULTY_OPTIONS, Recipe, Ingredient, StepItem } from "@/types/recipe";
import { useShortcuts } from "@/lib/useShortcuts";
import { IngredientBuilder } from "@/components/recipe/IngredientBuilder";

const CUISINE_PRESETS = [
  "Italian", "Mexican", "Chinese", "Japanese", "Indian", "Thai", 
  "French", "Mediterranean", "American", "Korean", "Vietnamese", "Greek"
] as const;
import { Button, Input, Textarea } from "@/components/UI";

type Props = {
  initial?: Partial<Recipe>;
  onSubmit: (data: Omit<Recipe, "id" | "createdAt" | "updatedAt" | "schemaVersion">) => void;
  submitLabel?: string;
  onCancel?: () => void;
};

export function RecipeForm({ initial, onSubmit, submitLabel = "Save", onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [categories, setCategories] = useState<string[]>(initial?.categories ?? []);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Keyboard shortcuts
  useShortcuts({
    'MOD+Enter': () => formRef.current?.requestSubmit?.(),
  });
  
  // Debug: Log categories changes
  useEffect(() => {
    console.log('Categories updated:', categories);
  }, [categories]);
  const [timeTotal, setTimeTotal] = useState<string>(() => {
    // Handle both old number format and new string format
    if (initial?.time?.total) {
      const total = initial.time.total;
      if (typeof total === 'number') {
        // Convert old number format to string format
        if (total < 30) return "<30min";
        if (total <= 60) return "30-60min";
        if (total <= 120) return "60-120min";
        return "120min+";
      }
      return total.toString();
    }
    return "";
  });
  const [difficulty, setDifficulty] = useState<string>(initial?.difficulty ?? "");
  const [cuisine, setCuisine] = useState<string>(initial?.cuisine ?? "");
  const [extraTags, setExtraTags] = useState<string[]>(initial?.extraTags ?? []);
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    // Handle both old string[] and new Ingredient[] formats
    if (initial?.ingredients && initial.ingredients.length > 0) {
      const firstIngredient = initial.ingredients[0];
      if (typeof firstIngredient === 'string') {
        // Convert old format to new format
        return (initial.ingredients as unknown as string[]).map(ing => ({
          id: crypto.randomUUID(),
          name: ing,
          quantity: undefined,
          unit: undefined,
          note: undefined,
        }));
      }
      return initial.ingredients as Ingredient[];
    }
    return [];
  });
  
  const [steps, setSteps] = useState<StepItem[]>(() => {
    // Handle both old string[] and new StepItem[] formats
    if (initial?.steps && initial.steps.length > 0) {
      const firstStep = initial.steps[0];
      if (typeof firstStep === 'string') {
        // Convert old format to new format
        return (initial.steps as unknown as string[]).map(step => ({
          id: crypto.randomUUID(),
          text: step,
        }));
      }
      return initial.steps as StepItem[];
    }
    return [];
  });
  const [newCat, setNewCat] = useState("");
  const [newCuisine, setNewCuisine] = useState("");
  const [newTag, setNewTag] = useState("");
  const [error, setError] = useState<string | null>(null);

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Manual validation
    if (!title.trim()) {
      setError("Please fill in the Title");
      return;
    }

    if (ingredients.length === 0) {
      setError("Please add at least one ingredient");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      categories: Array.from(new Set(categories.map((c) => c.trim()).filter(Boolean))),
      time: timeTotal ? { total: timeTotal } : undefined,
      difficulty: difficulty || undefined,
      cuisine: cuisine || undefined,
      extraTags: Array.from(new Set(extraTags.map((t) => t.trim()).filter(Boolean))),
      ingredients,
      steps,
    };

    onSubmit(payload);
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title *
        </label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Recipe name"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the recipe"
          rows={3}
        />
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categories
        </label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {CATEGORY_PRESETS.filter(cat => !categories.includes(cat)).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setCategories([...categories, cat]);
                }}
                className="px-3 py-1 rounded-full text-sm border cursor-pointer transition-colors bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
              >
                {cat}
              </button>
            ))}
          </div>
          {categories.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center rounded-full bg-orange-100 border border-orange-300 px-3 py-1 text-xs text-orange-700"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => setCategories(categories.filter((c) => c !== cat))}
                      className="ml-1 text-orange-500 hover:text-orange-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Add custom category"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newCat.trim() && !categories.includes(newCat.trim())) {
                    setCategories([...categories, newCat.trim()]);
                    setNewCat("");
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                console.log('Add category clicked:', newCat, 'Current categories:', categories);
                if (newCat.trim() && !categories.includes(newCat.trim())) {
                  setCategories([...categories, newCat.trim()]);
                  setNewCat("");
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Time & Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cooking Time
          </label>
          <select
            value={timeTotal}
            onChange={(e) => setTimeTotal(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm
                        focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="">Select cooking time</option>
            <option value="<30min">&lt;30min</option>
            <option value="30-60min">30-60min</option>
            <option value="60-120min">60-120min</option>
            <option value="120min+">120min+</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
          >
            <option value="">Select difficulty</option>
            {DIFFICULTY_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cuisine */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cuisine
        </label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {CUISINE_PRESETS.filter(c => c !== cuisine).map((c) => (
              <button
                key={c}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setCuisine(c);
                }}
                className="px-3 py-1 rounded-full text-sm border cursor-pointer transition-colors bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
              >
                {c}
              </button>
            ))}
          </div>
          {cuisine && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-orange-100 border border-orange-300 px-3 py-1 text-xs text-orange-700">
                  {cuisine}
                  <button
                    type="button"
                    onClick={() => setCuisine("")}
                    className="ml-1 text-orange-500 hover:text-orange-700"
                  >
                    ×
                  </button>
                </span>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              value={newCuisine}
              onChange={(e) => setNewCuisine(e.target.value)}
              placeholder="Add custom cuisine"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newCuisine.trim()) {
                    setCuisine(newCuisine.trim());
                    setNewCuisine("");
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={(e) => {
                e.preventDefault();
                if (newCuisine.trim()) {
                  setCuisine(newCuisine.trim());
                  setNewCuisine("");
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Extra Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Extra Tags
        </label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {extraTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setExtraTags(extraTags.filter((t) => t !== tag))}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newTag.trim() && !extraTags.includes(newTag.trim())) {
                    setExtraTags([...extraTags, newTag.trim()]);
                    setNewTag("");
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (newTag.trim() && !extraTags.includes(newTag.trim())) {
                  setExtraTags([...extraTags, newTag.trim()]);
                  setNewTag("");
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Ingredients */}
      <IngredientBuilder
        value={ingredients}
        onChange={setIngredients}
      />

      {/* Steps */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instructions
        </label>
        <Textarea
          value={steps.map(step => step.text).join('\n')}
          onChange={(e) => {
            const stepTexts = e.target.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
            const newSteps = stepTexts.map(text => ({
              id: crypto.randomUUID(),
              text,
            }));
            setSteps(newSteps);
          }}
          placeholder="Enter each step on a new line"
          rows={6}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit">{submitLabel}</Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}