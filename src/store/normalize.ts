import type { Recipe } from '@/types/recipe';

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
    ingredients: Array.isArray(raw?.ingredients) ? raw.ingredients.map(String) : [],
    steps: Array.isArray(raw?.steps) ? raw.steps.map(String) : [],
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt ?? new Date().toISOString(),
    schemaVersion: 1,
  };
}

export function migrateRecipes(rawList: any): Recipe[] {
  const list = Array.isArray(rawList) ? rawList : [];
  return list.map(migrateRecipe);
}
