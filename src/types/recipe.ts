export const CATEGORY_PRESETS = [
  "Pasta", "Meat Dish", "Fish", "Vegetarian", "Soup",
  "Dessert", "Snack", "Side Dish", "Salad",
] as const;

export const TIME_OPTIONS = ["<30 min", "30-60 min", "60-120 min", "120 min +"] as const;
export const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard"] as const;

export const UNIT_OPTIONS = [
  "g", "kg", "ml", "l", "tsp", "tbsp", "cup", "piece", "Custom"
] as const;

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Ingredient = {
  id: string;
  name: string;
  quantity?: string;
  unit?: string;
  note?: string;
};

export type StepItem = {
  id: string;
  text: string;
};

export type Recipe = {
  id: string;
  title: string;
  description?: string;

  // canonical categorization (multi-select)
  categories: string[];            // e.g., ["Pasta", "Vegetarian"]

  // meta
  time?: { total?: number | string | null }; // minutes or time range string
  difficulty?: Difficulty | string | null;
  cuisine?: string | null;

  // optional extra tagging
  extraTags?: string[];

  // content - structured format
  ingredients: Ingredient[];
  steps: StepItem[];

  // optional fields
  source?: string;
  photo?: string | null;

  // bookkeeping
  createdAt?: string; // ISO
  updatedAt?: string; // ISO

  // schema
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