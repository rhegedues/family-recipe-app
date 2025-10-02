export const CATEGORY_PRESETS = [
  "Pasta", "Meat Dish", "Fish", "Vegetarian", "Soup",
  "Dessert", "Snack", "Side Dish", "Salad",
] as const;

export const TIME_OPTIONS = ["<30 min", "30-60 min", "60-120 min", "120 min +"] as const;
export const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"] as const;

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

// src/types/recipe.ts
export type Recipe = {
  id: string;
  title: string;
  description?: string;

  categories: string[];

  time?: { total?: number | string | null };
  difficulty?: Difficulty | string | null;
  cuisine?: string | null;

  tags?: string[];        // keep for future, unused now
  extraTags?: string[];

  ingredients: string[];
  steps: string[];

  createdAt?: string;
  updatedAt?: string;
  schemaVersion?: 1;
};

export const PlannerDays = [
  "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun",
] as const;
export type PlannerDay = typeof PlannerDays[number];

export const PlannerSlots = [
  "Breakfast", "Lunch", "Dinner",
] as const;
export type PlannerSlot = typeof PlannerSlots[number];

export type PlannerWeek = {
  days: readonly typeof PlannerDays[number][];
  slots: readonly typeof PlannerSlots[number][];
  /** recipe IDs by day/slot */
  data: Record<PlannerDay, Record<PlannerSlot, string[]>>;
};

/** ISO week like 2025-W09 */
export type IsoWeekString = `${number}-W${string}`;

// ❌ Legacy fields explicitly NOT allowed.
// If someone tries to use these, TS should squawk during dev reviews.
// (Don't add them here—grep will catch them; see step 3.)