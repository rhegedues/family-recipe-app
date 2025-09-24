import { create } from 'zustand';
import { persist } from "zustand/middleware";
// import { v4 as uuidv4 } from "uuid";
import { migrateRecipes } from './normalize';
import type { Recipe } from '@/types/recipe';
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
      recipes: getJSON<Recipe[]>(STORAGE_RECIPES, []),
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
          // text haystack
          const haystack = [
            r.title,
            r.description || '',
            ...r.categories,
            ...r.ingredients,
            ...r.steps,
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
            // Normalize date fields to strings
            const normalizedRecipe = {
              ...importedRecipe,
              createdAt: importedRecipe.createdAt ? 
                (typeof importedRecipe.createdAt === 'number' ? 
                  new Date(importedRecipe.createdAt).toISOString() : 
                  importedRecipe.createdAt) : undefined,
              updatedAt: importedRecipe.updatedAt ? 
                (typeof importedRecipe.updatedAt === 'number' ? 
                  new Date(importedRecipe.updatedAt).toISOString() : 
                  importedRecipe.updatedAt) : undefined,
            };
            
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