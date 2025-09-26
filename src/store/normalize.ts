import type { Recipe, Ingredient, StepItem } from '@/types/recipe';

// Helper function to convert string array to structured ingredients
function migrateIngredients(ingredients: any): Ingredient[] {
  if (!Array.isArray(ingredients)) return [];
  
  // If already structured, return as-is
  if (ingredients.length > 0 && typeof ingredients[0] === 'object' && ingredients[0].id) {
    return ingredients as Ingredient[];
  }
  
  // Convert string array to structured format
  return ingredients.map((ingredient: string) => ({
    id: crypto.randomUUID(),
    name: String(ingredient).trim(),
    quantity: undefined,
    unit: undefined,
    note: undefined,
  }));
}

// Helper function to convert string array to structured steps
function migrateSteps(steps: any): StepItem[] {
  if (!Array.isArray(steps)) return [];
  
  // If already structured, return as-is
  if (steps.length > 0 && typeof steps[0] === 'object' && steps[0].id) {
    return steps as StepItem[];
  }
  
  // Convert string array to structured format
  return steps.map((step: string) => ({
    id: crypto.randomUUID(),
    text: String(step).trim(),
  }));
}

export function migrateRecipe(raw: any): Recipe {
  const categories: string[] =
    Array.isArray(raw?.categories) ? raw.categories :
    Array.isArray(raw?.tags?.Course) ? raw.tags.Course :
    Array.isArray(raw?.type) ? raw.type :                // super-legacy
    (raw?.mainType ? [raw.mainType] : []);               // kill mainType by absorbing

  const extraTags: string[] =
    Array.isArray(raw?.extraTags) ? raw.extraTags :
    Array.isArray(raw?.tags?.Extra) ? raw.tags.Extra : [];

  const timeTotal =
    typeof raw?.time === 'number' ? raw.time :
    raw?.time?.total ?? null;

  return {
    id: String(raw?.id ?? crypto.randomUUID()),
    title: String(raw?.title ?? 'Untitled'),
    description: typeof raw?.description === 'string' ? raw.description : '',
    categories: categories.filter(Boolean),
    time: (timeTotal ?? null) !== null ? { total: Number(timeTotal) } : undefined,
    difficulty: raw?.difficulty ?? null,
    cuisine: raw?.cuisine ?? null,
    extraTags,
    ingredients: migrateIngredients(raw?.ingredients),
    steps: migrateSteps(raw?.steps),
    source: raw?.source,
    photo: raw?.photo ?? null,
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt ?? new Date().toISOString(),
    schemaVersion: 1,
  };
}

export function migrateRecipes(rawList: any): Recipe[] {
  const list = Array.isArray(rawList) ? rawList : [];
  return list.map(migrateRecipe);
}
