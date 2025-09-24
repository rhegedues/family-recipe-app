"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useRecipeStore } from "@/store/recipes";
import { Button, Input, Chip } from "@/components/UI";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeForm } from "@/components/RecipeForm";
import { CATEGORY_PRESETS } from "@/types/recipe";
import { useShortcuts, useFocusRestore } from "@/lib/useShortcuts";


const CATS = ["All", ...CATEGORY_PRESETS];

export default function RecipesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // 1) Mount flag, but no early return
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // 2) Call store hooks on every render (order is stable)
  const {
    recipes, addRecipe, updateRecipe, setTextQuery, filterRecipes,
    selectedCategories, setSelectedCategories,
  } = useRecipeStore();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<null | string>(null);
  const [cat, setCat] = useState<string>("All");
  const [query, setQuery] = useState("");
  
  // Focus restoration for form dialog
  useFocusRestore(showForm);
  
  // Keyboard shortcuts for form dialog
  useShortcuts({
    Escape: () => {
      if (showForm) {
        setEditing(null);
        setShowForm(false);
        router.push('/recipes');
      }
    },
  }, showForm);

  // Handle edit parameter from URL
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && recipes.find(r => r.id === editId)) {
      setEditing(editId);
      setShowForm(true);
    } else {
      // Clear edit state when no edit parameter or invalid editId
      setEditing(null);
      setShowForm(false);
    }
  }, [searchParams, recipes]);

  // Listen for navigation events to clear edit state
  useEffect(() => {
    const handleRouteChange = () => {
      const editId = searchParams.get('edit');
      if (!editId) {
        setEditing(null);
        setShowForm(false);
      }
    };

    // Check on mount and when searchParams change
    handleRouteChange();
  }, [searchParams]);

  // 3) Only compute filtered list after mount to avoid SSR mismatch
  const filtered = mounted ? filterRecipes() : [];

  const onQueryChange = (v: string) => {
    setQuery(v);
    setTextQuery(v);
  };

  const onCatClick = (c: string) => {
    if (c === "All") { setSelectedCategories([]); setCat("All"); return; }
    const next = selectedCategories.includes(c)
      ? selectedCategories.filter((x) => x !== c)
      : [...selectedCategories, c];
    setSelectedCategories(next);
    setCat(next.length ? "Custom" : "All");
  };

  const currentEditing = editing
    ? recipes.find((r) => r.id === editing) ?? null
    : null;

  return (
    <div className="mx-auto max-w-6xl">
      {/* HERO */}
      <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-green-400 p-8 text-white">
        <h1 className="text-3xl font-bold">Family Recipes</h1>
        <p className="mt-1 text-lg opacity-95">Organize, plan, and cook with love</p>
      </div>

      {/* FILTER BAR */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="min-w-[240px] flex-1">
          <Input
            placeholder="Search recipes…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
          />
        </div>
        <Button variant="secondary" aria-label="Filter">⚙️ Filter</Button>
        <Button iconLeft={<span>＋</span>} onClick={() => { setEditing(null); setShowForm(true); }}>
          Add Recipe
        </Button>
      </div>

      {/* CATEGORY CHIPS */}
      <div className="mb-6 flex flex-wrap gap-2">
  {CATS.map((c) => {
    const active = c === "All" ? selectedCategories.length === 0 : selectedCategories.includes(c);
    return (
      <Chip key={c} active={active} onClick={() => onCatClick(c)}>
        {c}
      </Chip>
    );
  })}
</div>


      {/* FORM */}
      {showForm && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-labelledby="recipe-form-title"
          className="mb-6 rounded-2xl border bg-white p-4"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 id="recipe-form-title" className="font-semibold">
              {editing ? "Edit recipe" : "Add recipe"}
            </h2>
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(false);
                router.push('/recipes');
              }}
              className="text-gray-500 hover:text-gray-700 text-lg font-bold"
              aria-label="Close form"
            >
              ×
            </button>
          </div>
          <RecipeForm
  initial={currentEditing ?? undefined}
  onSubmit={(data) => {
    try {
      if (currentEditing) {
        updateRecipe(currentEditing.id, data);
        alert(`Recipe "${data.title}" has been updated successfully.`);
        router.push(`/recipes/${currentEditing.id}`);
      } else {
        const newRecipeId = addRecipe(data);
        alert(`Recipe "${data.title}" has been created successfully.`);
        router.push(`/recipes/${newRecipeId}`);
      }
      setShowForm(false);
      setEditing(null);
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Error saving recipe. Please try again.');
    }
  }}
  onCancel={() => {
    setShowForm(false);
    setEditing(null);
  }}
/>
        </div>
      )}

      {/* LIST / EMPTY — render only after mount */}
      {mounted && (
        <>
          {recipes.length === 0 && !showForm ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-gray-600">
              No recipes yet.{" "}
              <button className="underline" onClick={() => setShowForm(true)}>
                Add your first one
              </button>
              .
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
