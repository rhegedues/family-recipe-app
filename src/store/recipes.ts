import { create } from 'zustand';
import { persist } from "zustand/middleware";
// import { v4 as uuidv4 } from "uuid";
import { migrateRecipes, migrateRecipe } from './normalize';
import type { Recipe, Ingredient } from '@/types/recipe';
import {
  PlannerWeek,
  PlannerDays,
  PlannerSlots,
  PlannerDay,
  PlannerSlot,
  IsoWeekString,
} from "@/types/recipe";
import { getJSON, setJSON, isBrowser } from "@/lib/storage";
import { validateExportData, createExportFilename, type ExportData } from "@/lib/schema";

type StoreState = {
  // data
  recipes: Recipe[];
  plannerByWeek: Record<IsoWeekString, PlannerWeek>;

  // filters
  textQuery: string;
  selectedCategories: string[];
  selectedTagsByCategory: Record<string, string[]>;

  // recipe ops
  addRecipe: (
    input: Omit<Recipe, "id" | "createdAt" | "updatedAt" | "schemaVersion"> & { id?: string }
  ) => string;
  updateRecipe: (
    id: string,
    updates: Partial<Omit<Recipe, "id" | "createdAt" | "updatedAt" | "schemaVersion">>
  ) => void;
  deleteRecipe: (id: string) => void;

  // ingredient management
  addIngredient: (recipeId: string, ingredient: Omit<Ingredient, "id">) => void;
  updateIngredient: (recipeId: string, ingredientId: string, updates: Partial<Omit<Ingredient, "id">>) => void;
  removeIngredient: (recipeId: string, ingredientId: string) => void;
  reorderIngredients: (recipeId: string, startIndex: number, endIndex: number) => void;

  // filter setters
  setTextQuery: (q: string) => void;
  setSelectedCategories: (cats: string[]) => void;
  setSelectedTags: (section: string, tags: string[]) => void;

  // derived
  filterRecipes: () => Recipe[];

  // planner
  getCurrentIsoWeek: () => IsoWeekString;
  nextWeek: (isoWeek: IsoWeekString) => IsoWeekString;
  prevWeek: (isoWeek: IsoWeekString) => IsoWeekString;
  ensureWeek: (isoWeek: IsoWeekString) => void;
  addToSlot: (
    isoWeek: IsoWeekString,
    day: PlannerDay,
    slot: PlannerSlot,
    recipeId: string
  ) => void;
  removeFromSlot: (
    isoWeek: IsoWeekString,
    day: PlannerDay,
    slot: PlannerSlot,
    recipeId: string
  ) => void;
  clearWeek: (isoWeek: IsoWeekString) => void;

  // data management
  exportData: () => string; // Returns JSON string
  importData: (jsonData: string, replacePlanner?: boolean) => { success: boolean; message: string; };
};

const STORAGE_RECIPES = "fra:recipes";
const STORAGE_PLANNER_PREFIX = "fra:planner:";

/* ---------- helpers ---------- */

function computeIsoWeek(date: Date): IsoWeekString {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  const year = d.getUTCFullYear();
  return `${year}-W${String(weekNo).padStart(2, "0")}`;
}

function firstDateOfIsoWeek(year: number, week: number): Date {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = simple.getUTCDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
  else ISOweekStart.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
  return ISOweekStart;
}

function blankWeek(): PlannerWeek {
  const data = {} as PlannerWeek["data"];
  for (const day of PlannerDays) {
    data[day] = { Breakfast: [], Lunch: [], Dinner: [] };
  }
  return { days: [...PlannerDays], slots: [...PlannerSlots], data };
}

function getSampleRecipes(): Recipe[] {
  return [
    {
      id: "sample-1",
      title: "Classic Spaghetti Carbonara",
      description: "A traditional Italian pasta dish with eggs, cheese, and pancetta",
      categories: ["Pasta", "Italian"],
      time: { total: "30-60min" },
      difficulty: "Medium",
      cuisine: "Italian",
      extraTags: ["Comfort Food", "Quick"],
      ingredients: [
        { id: "sample-1-ing-1", name: "spaghetti", quantity: "400", unit: "g" },
        { id: "sample-1-ing-2", name: "pancetta or guanciale", quantity: "200", unit: "g" },
        { id: "sample-1-ing-3", name: "large eggs", quantity: "4", unit: "piece" },
        { id: "sample-1-ing-4", name: "Pecorino Romano cheese", quantity: "100", unit: "g" },
        { id: "sample-1-ing-5", name: "Black pepper" },
        { id: "sample-1-ing-6", name: "Salt" }
      ],
      steps: [
        { id: "sample-1-step-1", text: "Bring a large pot of salted water to boil and cook spaghetti according to package directions" },
        { id: "sample-1-step-2", text: "Cut pancetta into small cubes and cook in a large pan until crispy" },
        { id: "sample-1-step-3", text: "Beat eggs with grated cheese and black pepper in a bowl" },
        { id: "sample-1-step-4", text: "Drain pasta, reserving 1 cup of pasta water" },
        { id: "sample-1-step-5", text: "Add hot pasta to the pan with pancetta, remove from heat" },
        { id: "sample-1-step-6", text: "Quickly stir in egg mixture, adding pasta water as needed to create a creamy sauce" },
        { id: "sample-1-step-7", text: "Serve immediately with extra cheese and black pepper" }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: 1
    },
    {
      id: "sample-2", 
      title: "Grilled Salmon with Lemon Herbs",
      description: "Simple and healthy grilled salmon with fresh herbs and lemon",
      categories: ["Fish", "Healthy"],
      time: { total: "<30min" },
      difficulty: "Easy",
      cuisine: "Mediterranean",
      extraTags: ["High Protein", "Low Carb"],
      ingredients: [
        { id: "sample-2-ing-1", name: "salmon fillets", quantity: "4", unit: "piece", note: "6oz each" },
        { id: "sample-2-ing-2", name: "lemons", quantity: "2", unit: "piece" },
        { id: "sample-2-ing-3", name: "olive oil", quantity: "3", unit: "tbsp" },
        { id: "sample-2-ing-4", name: "garlic", quantity: "2", unit: "piece", note: "minced" },
        { id: "sample-2-ing-5", name: "fresh dill", quantity: "2", unit: "tbsp" },
        { id: "sample-2-ing-6", name: "fresh parsley", quantity: "2", unit: "tbsp" },
        { id: "sample-2-ing-7", name: "Salt and pepper" }
      ],
      steps: [
        { id: "sample-2-step-1", text: "Preheat grill to medium-high heat" },
        { id: "sample-2-step-2", text: "Mix olive oil, garlic, dill, parsley, salt, and pepper in a bowl" },
        { id: "sample-2-step-3", text: "Brush salmon fillets with the herb mixture" },
        { id: "sample-2-step-4", text: "Grill salmon for 4-5 minutes per side until fish flakes easily" },
        { id: "sample-2-step-5", text: "Squeeze fresh lemon juice over the salmon before serving" },
        { id: "sample-2-step-6", text: "Serve with steamed vegetables or a fresh salad" }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: 1
    },
    {
      id: "sample-3",
      title: "Chicken Stir-Fry with Vegetables",
      description: "Quick and colorful chicken stir-fry with mixed vegetables",
      categories: ["Chicken", "Asian"],
      time: { total: "30-60min" },
      difficulty: "Easy",
      cuisine: "Asian",
      extraTags: ["One Pan", "High Protein"],
      ingredients: [
        { id: "sample-3-ing-1", name: "chicken breast", quantity: "1", unit: "lb", note: "sliced" },
        { id: "sample-3-ing-2", name: "bell peppers", quantity: "2", unit: "piece", note: "sliced" },
        { id: "sample-3-ing-3", name: "broccoli head", quantity: "1", unit: "piece", note: "cut into florets" },
        { id: "sample-3-ing-4", name: "carrot", quantity: "1", unit: "piece", note: "julienned" },
        { id: "sample-3-ing-5", name: "garlic", quantity: "3", unit: "piece", note: "minced" },
        { id: "sample-3-ing-6", name: "ginger", quantity: "1", unit: "inch", note: "grated" },
        { id: "sample-3-ing-7", name: "soy sauce", quantity: "3", unit: "tbsp" },
        { id: "sample-3-ing-8", name: "sesame oil", quantity: "2", unit: "tbsp" },
        { id: "sample-3-ing-9", name: "cornstarch", quantity: "1", unit: "tbsp" },
        { id: "sample-3-ing-10", name: "vegetable oil", quantity: "2", unit: "tbsp" }
      ],
      steps: [
        { id: "sample-3-step-1", text: "Mix soy sauce, sesame oil, and cornstarch in a bowl" },
        { id: "sample-3-step-2", text: "Heat vegetable oil in a large wok or pan over high heat" },
        { id: "sample-3-step-3", text: "Add chicken and cook until golden, about 5 minutes" },
        { id: "sample-3-step-4", text: "Add garlic and ginger, stir for 30 seconds" },
        { id: "sample-3-step-5", text: "Add vegetables and stir-fry for 3-4 minutes until crisp-tender" },
        { id: "sample-3-step-6", text: "Pour sauce over everything and toss to combine" },
        { id: "sample-3-step-7", text: "Serve over rice or noodles" }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: 1
    }
  ];
}

function readPlanner(isoWeek: IsoWeekString): PlannerWeek {
  return getJSON<PlannerWeek>(`${STORAGE_PLANNER_PREFIX}${isoWeek}`, blankWeek());
}
function writePlanner(isoWeek: IsoWeekString, week: PlannerWeek) {
  setJSON(`${STORAGE_PLANNER_PREFIX}${isoWeek}`, week);
}

/* ---------- store ---------- */

export const useRecipeStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // data
      recipes: getJSON<Recipe[]>(STORAGE_RECIPES, getSampleRecipes()),
      plannerByWeek: {},

      // filters
      textQuery: "",
      selectedCategories: [],
      selectedTagsByCategory: {},

      /* ---- recipe ops ---- */

      addRecipe: (input) => {
        const now = new Date().toISOString();
        const id = input.id ?? crypto.randomUUID();
        const recipe: Recipe = {
          ...input,
          id,
          createdAt: now,
          updatedAt: now,
          schemaVersion: 1,
        };
      
        set((s) => ({ recipes: [recipe, ...s.recipes] }));
        setJSON(STORAGE_RECIPES, get().recipes);
        return id;
      },
      
      updateRecipe: (id, updates) => {
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === id
              ? {
                  ...r,
                  ...updates,
                  updatedAt: new Date().toISOString(),
                  schemaVersion: 1,
                }
              : r
          ),
        }));
        setJSON(STORAGE_RECIPES, get().recipes);
      },      

      deleteRecipe: (id) => {
        set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) }));
        setJSON(STORAGE_RECIPES, get().recipes);
      },

      /* ---- ingredient management ---- */

      addIngredient: (recipeId, ingredient) => {
        const newIngredient: Ingredient = {
          ...ingredient,
          id: crypto.randomUUID(),
        };
        
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  ingredients: [...r.ingredients, newIngredient],
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
        setJSON(STORAGE_RECIPES, get().recipes);
      },

      updateIngredient: (recipeId, ingredientId, updates) => {
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  ingredients: r.ingredients.map((ing) =>
                    ing.id === ingredientId ? { ...ing, ...updates } : ing
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
        setJSON(STORAGE_RECIPES, get().recipes);
      },

      removeIngredient: (recipeId, ingredientId) => {
        set((s) => ({
          recipes: s.recipes.map((r) =>
            r.id === recipeId
              ? {
                  ...r,
                  ingredients: r.ingredients.filter((ing) => ing.id !== ingredientId),
                  updatedAt: new Date().toISOString(),
                }
              : r
          ),
        }));
        setJSON(STORAGE_RECIPES, get().recipes);
      },

      reorderIngredients: (recipeId, startIndex, endIndex) => {
        set((s) => ({
          recipes: s.recipes.map((r) => {
            if (r.id !== recipeId) return r;
            
            const ingredients = [...r.ingredients];
            const [movedIngredient] = ingredients.splice(startIndex, 1);
            ingredients.splice(endIndex, 0, movedIngredient);
            
            return {
              ...r,
              ingredients,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
        setJSON(STORAGE_RECIPES, get().recipes);
      },

      /* ---- filter setters ---- */

      setTextQuery: (q) => set({ textQuery: q }),
      setSelectedCategories: (cats) => set({ selectedCategories: cats }),
      setSelectedTags: (section, tags) =>
        set((s) => ({
          selectedTagsByCategory: { ...s.selectedTagsByCategory, [section]: tags },
        })),

      /* ---- derived ---- */

      filterRecipes: () => {
        const { recipes, textQuery, selectedCategories, selectedTagsByCategory } = get();
        const q = textQuery.trim().toLowerCase();
        
        return recipes.filter((r) => {
          // text haystack - handle both old and new formats
          const ingredientTexts = r.ingredients.map(ing => 
            typeof ing === 'string' ? ing : ing.name
          );
          const stepTexts = r.steps.map(step => 
            typeof step === 'string' ? step : step.text
          );
          
          const haystack = [
            r.title,
            r.description || '',
            ...r.categories,
            ...ingredientTexts,
            ...stepTexts,
            r.difficulty || '',
            r.cuisine || '',
            ...(r.extraTags || []),
          ].map((s) => (s || "").toString().toLowerCase());
        
          const textOk = !q || haystack.some((s) => s.includes(q));
        
          // categories: AND logic
          const catsOk =
            selectedCategories.length === 0 ||
            selectedCategories.every((sel) =>
              r.categories.map((c) => c.toLowerCase()).includes(sel.toLowerCase())
            );
        
          return textOk && catsOk;
        });      
      },

      /* ---- planner ---- */

      getCurrentIsoWeek: () => computeIsoWeek(new Date()),

      nextWeek: (isoWeek) => {
        const [yearStr, weekStr] = isoWeek.split("-W");
        const year = Number(yearStr);
        const week = Number(weekStr);
        const d = firstDateOfIsoWeek(year, week);
        d.setUTCDate(d.getUTCDate() + 7);
        return computeIsoWeek(new Date(d));
      },

      prevWeek: (isoWeek) => {
        const [yearStr, weekStr] = isoWeek.split("-W");
        const year = Number(yearStr);
        const week = Number(weekStr);
        const d = firstDateOfIsoWeek(year, week);
        d.setUTCDate(d.getUTCDate() - 7);
        return computeIsoWeek(new Date(d));
      },

      ensureWeek: (isoWeek) => {
        const existing = readPlanner(isoWeek);
        set((state) => ({
          plannerByWeek: { ...state.plannerByWeek, [isoWeek]: existing },
        }));
      },

      addToSlot: (isoWeek, day, slot, recipeId: string) => {
        const state = get();
        const week = state.plannerByWeek[isoWeek] ?? readPlanner(isoWeek);
        const list = week.data[day][slot];
        if (!list.includes(recipeId)) list.push(recipeId);
        writePlanner(isoWeek, week);
        set((s) => ({
          plannerByWeek: { ...s.plannerByWeek, [isoWeek]: { ...week } },
        }));
      },

      removeFromSlot: (isoWeek, day, slot, recipeId: string) => {
        const state = get();
        const week = state.plannerByWeek[isoWeek] ?? readPlanner(isoWeek);
        week.data[day][slot] = week.data[day][slot].filter((id) => id !== recipeId);
        writePlanner(isoWeek, week);
        set((s) => ({
          plannerByWeek: { ...s.plannerByWeek, [isoWeek]: { ...week } },
        }));
      },

      clearWeek: (isoWeek) => {
        const week = blankWeek();
        writePlanner(isoWeek, week);
        set((s) => ({ plannerByWeek: { ...s.plannerByWeek, [isoWeek]: week } }));
      },

      // data management
      exportData: () => {
        const state = get();
        const exportData: ExportData = {
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          recipes: state.recipes,
          planner: state.plannerByWeek,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importData: (jsonData: string, replacePlanner = false) => {
        try {
          const parsed = JSON.parse(jsonData);
          const validated = validateExportData(parsed);
          
          // Merge recipes by ID (upsert)
          const currentRecipes = get().recipes;
          const existingIds = new Set(currentRecipes.map(r => r.id));
          
          const mergedRecipes = [...currentRecipes];
          for (const importedRecipe of validated.recipes) {
            // Use migrateRecipe to ensure proper format conversion
            const normalizedRecipe = migrateRecipe(importedRecipe);
            
            const existingIndex = mergedRecipes.findIndex(r => r.id === normalizedRecipe.id);
            if (existingIndex >= 0) {
              // Update existing recipe
              mergedRecipes[existingIndex] = normalizedRecipe;
            } else {
              // Add new recipe
              mergedRecipes.push(normalizedRecipe);
            }
          }

          // Handle planner data based on mode
          const currentPlanner = get().plannerByWeek;
          let mergedPlanner: Record<IsoWeekString, PlannerWeek>;
          
          if (replacePlanner) {
            // Replace mode: use import file's planner exactly (or empty if import has no planner)
            mergedPlanner = {};
            for (const [weekId, weekData] of Object.entries(validated.planner)) {
              mergedPlanner[weekId as IsoWeekString] = weekData as PlannerWeek;
            }
          } else {
            // Merge mode: union recipe IDs per cell (additive behavior)
            mergedPlanner = { ...currentPlanner };
            for (const [weekId, weekData] of Object.entries(validated.planner)) {
              if (mergedPlanner[weekId as IsoWeekString]) {
                // Merge existing week - union recipe IDs per day/slot
                const existingWeek = mergedPlanner[weekId as IsoWeekString];
                for (const day of PlannerDays) {
                  for (const slot of PlannerSlots) {
                    const existing = existingWeek.data[day][slot] || [];
                    const imported = weekData.data[day]?.[slot] || [];
                    const combined = [...new Set([...existing, ...imported])]; // Remove duplicates
                    existingWeek.data[day][slot] = combined;
                  }
                }
              } else {
                // Add new week
                mergedPlanner[weekId as IsoWeekString] = weekData as PlannerWeek;
              }
            }
          }

          // Update store
          set({
            recipes: mergedRecipes,
            plannerByWeek: mergedPlanner,
          });

          // Persist to localStorage
          setJSON(STORAGE_RECIPES, mergedRecipes);
          
          // Always clear all existing planner data first, then write new data
          if (isBrowser()) {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
              if (key.startsWith(STORAGE_PLANNER_PREFIX)) {
                localStorage.removeItem(key);
              }
            });
          }
          
          // Write new planner data
          for (const [weekId, week] of Object.entries(mergedPlanner)) {
            writePlanner(weekId as IsoWeekString, week);
          }

          const plannerMessage = Object.keys(mergedPlanner).length > 0 
            ? `${Object.keys(mergedPlanner).length} planner weeks` 
            : 'planner data cleared';
            
          return {
            success: true,
            message: `Successfully imported ${validated.recipes.length} recipes and ${plannerMessage}.`,
          };
        } catch (error) {
          return {
            success: false,
            message: `Import failed: ${error instanceof Error ? error.message : 'Invalid file format'}`,
          };
        }
      },
    }),
    {
      name: "fra:root",
      partialize: (s) => ({ recipes: s.recipes }),
      storage: {
        getItem: () => {
          if (!isBrowser()) return null as any;
          const recipes = getJSON<Recipe[]>(STORAGE_RECIPES, []);
          return { state: JSON.stringify({ recipes }) } as any;
        },
        setItem: (_name, value) => {
          try {
            const state = JSON.parse(value as any);
            setJSON(STORAGE_RECIPES, state.state.recipes ?? []);
          } catch {}
        },
        removeItem: () => {},
      },
    }
  )
);