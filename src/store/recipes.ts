import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/* ========= Recipe types ========= */

export type Ingredient = { id: string; name: string; quantity?: string; unit?: string; note?: string };
export type StepItem = { id: string; text: string };
export type RecipeTime = { prep?: number; cook?: number; total?: number | string; unit?: string };

export type Recipe = {
  id: string;
  title: string;
  description?: string;
  ingredients: any[] | string[]; // tolerant during recovery
  steps: any[] | string[];       // tolerant during recovery
  tags?: string[];
  categories?: string[];
  difficulty?: string;
  cuisine?: string;
  extraTags?: string[];
  time?: RecipeTime;
} & Record<string, unknown>; // TEMP: tolerate extras while stabilizing

export type ImportResult = { success: boolean; message: string };

/* ========= Planner types (match components) ========= */

export type IsoWeekString = `${number}-W${string}`;
export type PlannerDay = string;   // "Mon" | "Tue" | ... (component provides)
export type PlannerSlot = string;  // "Breakfast" | "Lunch" | "Dinner" ... (component provides)

export type PlannerGrid = Record<PlannerDay, Record<PlannerSlot, string[]>>;
export type PlannerWeek = { data: PlannerGrid }; // <-- MealPlanner uses week.data[day][slot]

function makeEmptyGrid(): PlannerGrid {
  return {
    Mon: { Breakfast: [], Lunch: [], Dinner: [] },
    Tue: { Breakfast: [], Lunch: [], Dinner: [] },
    Wed: { Breakfast: [], Lunch: [], Dinner: [] },
    Thu: { Breakfast: [], Lunch: [], Dinner: [] },
    Fri: { Breakfast: [], Lunch: [], Dinner: [] },
    Sat: { Breakfast: [], Lunch: [], Dinner: [] },
    Sun: { Breakfast: [], Lunch: [], Dinner: [] },
  } as PlannerGrid;
}

/* ISO week helpers */
function getIsoWeekId(d = new Date()): IsoWeekString {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // Thu of current week
  const firstThu = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((date.getTime() - firstThu.getTime()) / 86400000 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7
    );
  const year = date.getUTCFullYear();
  return `${year}-W${String(week).padStart(2, "0")}` as IsoWeekString;
}
function parseIsoWeek(id: IsoWeekString): { year: number; week: number } {
  const m = id.match(/^(\d+)-W(\d{1,2})$/);
  return { year: Number(m?.[1] ?? new Date().getUTCFullYear()), week: Number(m?.[2] ?? 1) };
}
function isoWeekToDate({ year, week }: { year: number; week: number }): Date {
  const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
  const dow = (simple.getUTCDay() + 6) % 7;
  simple.setUTCDate(simple.getUTCDate() - dow + 3); // Thu
  return simple;
}
function offsetIsoWeek(id: IsoWeekString, delta: number): IsoWeekString {
  const baseThu = isoWeekToDate(parseIsoWeek(id));
  baseThu.setUTCDate(baseThu.getUTCDate() + delta * 7);
  return getIsoWeekId(baseThu);
}

/* ========= Store ========= */

type RecipeState = {
  /* Recipes */
  recipes: Recipe[];
  addRecipe: (r: Recipe) => void;
  setRecipes: (rs: Recipe[]) => void;
  updateRecipe: (id: string, patch: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;

  /* Import/Export */
  exportData: () => string;
  importData: (jsonText: string, options?: { mode?: "merge" | "replace" }) => ImportResult;

  /* Planner — match MealPlanner.tsx expectations */
  plannerByWeek: Record<IsoWeekString, PlannerWeek>;

  getCurrentIsoWeek: () => IsoWeekString;
  ensureWeek: (weekId: IsoWeekString) => void;
  getWeek: (weekId: IsoWeekString) => PlannerWeek;

  /* navigation helpers */
  offsetWeek: (weekId: IsoWeekString, delta: number) => IsoWeekString;
  prevWeek: (weekId: IsoWeekString) => IsoWeekString;
  nextWeek: (weekId: IsoWeekString) => IsoWeekString;

  /* slot operations (aliases for clarity) */
  addToSlot: (weekId: IsoWeekString, day: PlannerDay, slot: PlannerSlot, recipeId: string) => void;
  removeFromSlot: (weekId: IsoWeekString, day: PlannerDay, slot: PlannerSlot, recipeId: string) => void;

  /* convenience used by UI */
  clearWeek: (weekId: IsoWeekString) => void;
};

const noopStorage = {
  getItem: (_: string) => null,
  setItem: (_: string, __: string) => {},
  removeItem: (_: string) => {},
};

export const useRecipeStore = create<RecipeState>()(
  persist(
    (set, get) => ({
      /* ---- recipes ---- */
      recipes: [],
      addRecipe: (r) => set({ recipes: [...get().recipes, r] }),
      setRecipes: (rs) => set({ recipes: rs }),
      updateRecipe: (id, patch) =>
        set({ recipes: get().recipes.map((r) => (r.id === id ? { ...r, ...patch } : r)) }),
      deleteRecipe: (id) => set({ recipes: get().recipes.filter((r) => r.id !== id) }),

      /* ---- export/import ---- */
      exportData: () => JSON.stringify({ version: 1, recipes: get().recipes, plannerByWeek: get().plannerByWeek }, null, 2),

      importData: (jsonText, options) => {
        try {
          const parsed = JSON.parse(jsonText);

          // recipes: array or { recipes: [...] }
          const incomingRecipes: Recipe[] = Array.isArray(parsed)
            ? parsed
            : Array.isArray(parsed?.recipes)
            ? parsed.recipes
            : [];

          // planner: accept either { plannerByWeek: {week: {data}} } or legacy { planner: {week: grid}}
          const incomingPlannerByWeek: Record<IsoWeekString, PlannerWeek> =
            parsed?.plannerByWeek
              ? parsed.plannerByWeek
              : parsed?.planner
              ? Object.fromEntries(
                  Object.entries(parsed.planner as Record<string, PlannerGrid>).map(([k, grid]) => [
                    k,
                    { data: grid as PlannerGrid },
                  ])
                )
              : {};

          const mode = options?.mode ?? "merge";

          if (mode === "replace") {
            set({ recipes: incomingRecipes, plannerByWeek: incomingPlannerByWeek });
            return { success: true, message: `Imported ${incomingRecipes.length} recipes (replaced).` };
          }

          // merge recipes by id
          const byId = new Map(get().recipes.map((r) => [r.id, r]));
          let updated = 0,
            added = 0;
          for (const r of incomingRecipes) {
            if (byId.has(r.id)) {
              byId.set(r.id, { ...byId.get(r.id)!, ...r });
              updated++;
            } else {
              byId.set(r.id, r);
              added++;
            }
          }

          // shallow merge planner weeks (incoming wins per-week)
          const mergedPlannerByWeek = { ...get().plannerByWeek, ...incomingPlannerByWeek };

          set({ recipes: Array.from(byId.values()), plannerByWeek: mergedPlannerByWeek });
          return {
            success: true,
            message: `Imported ${incomingRecipes.length} recipes (added ${added}, updated ${updated}).`,
          };
        } catch (e: any) {
          return { success: false, message: `Import failed: ${e?.message || e}` };
        }
      },

      /* ---- planner ---- */
      plannerByWeek: {},

      getCurrentIsoWeek: () => getIsoWeekId(),

      ensureWeek: (weekId) => {
        if (!get().plannerByWeek[weekId]) {
          set({
            plannerByWeek: {
              ...get().plannerByWeek,
              [weekId]: { data: makeEmptyGrid() },
            },
          });
        }
      },

      getWeek: (weekId) => {
        const week = get().plannerByWeek[weekId];
        return week ?? { data: makeEmptyGrid() };
      },

      offsetWeek: (weekId, delta) => offsetIsoWeek(weekId, delta),
      prevWeek: (weekId) => offsetIsoWeek(weekId, -1),
      nextWeek: (weekId) => offsetIsoWeek(weekId, +1),

      addToSlot: (weekId, day, slot, recipeId) =>
        set(() => {
          const week = get().plannerByWeek[weekId] ?? { data: makeEmptyGrid() };
          const grid = { ...week.data };
          const dayRow = { ...(grid[day] ?? {}) };
          dayRow[slot] = [...(dayRow[slot] ?? []), recipeId];
          grid[day] = dayRow;
          return {
            plannerByWeek: { ...get().plannerByWeek, [weekId]: { data: grid } },
          };
        }),

      removeFromSlot: (weekId, day, slot, recipeId) =>
        set(() => {
          const week = get().plannerByWeek[weekId] ?? { data: makeEmptyGrid() };
          const grid = { ...week.data };
          const list = (grid[day]?.[slot] ?? []).filter((id: string) => id !== recipeId);
          grid[day] = { ...(grid[day] ?? {}), [slot]: list };
          return {
            plannerByWeek: { ...get().plannerByWeek, [weekId]: { data: grid } },
          };
        }),

      clearWeek: (weekId) =>
        set(() => ({
          plannerByWeek: { ...get().plannerByWeek, [weekId]: { data: makeEmptyGrid() } },
        })),
    }),
    {
      name: "recipes",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : (noopStorage as any)
      ),
      // Persist exactly what the app reads
      partialize: (state) => ({
        recipes: state.recipes,
        plannerByWeek: state.plannerByWeek,
      }),
    }
  )
);