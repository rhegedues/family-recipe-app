import { z } from 'zod';
import type { Recipe, IsoWeekString, PlannerWeek, Ingredient, StepItem } from '@/types/recipe';

// Ingredient schema
export const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.string().optional(),
  unit: z.string().optional(),
  note: z.string().optional(),
});

// Step schema
export const StepSchema = z.object({
  id: z.string(),
  text: z.string(),
});

// Recipe schema for export/import - supports both old and new formats
export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  categories: z.array(z.string()),
  time: z.object({
    total: z.union([
      z.number().positive(),
      z.string().refine((val) => {
        // Allow specific time range strings
        return ['<30min', '30-60min', '60-120min', '120min+'].includes(val);
      }, { message: "Time must be a positive number or one of: '<30min', '30-60min', '60-120min', '120min+'" }),
      z.null()
    ]).optional()
  }).optional(),
  difficulty: z.union([z.string(), z.null()]).optional(),
  cuisine: z.union([z.string(), z.null()]).optional(),
  extraTags: z.array(z.string()).optional(),
  // Support both old (string[]) and new (Ingredient[]) formats
  ingredients: z.union([
    z.array(z.string()), // Legacy format
    z.array(IngredientSchema) // New structured format
  ]),
  // Support both old (string[]) and new (StepItem[]) formats
  steps: z.union([
    z.array(z.string()), // Legacy format
    z.array(StepSchema) // New structured format
  ]),
  source: z.string().optional(),
  photo: z.union([z.string(), z.null()]).optional(),
  createdAt: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'number' ? new Date(val).toISOString() : val
  ).optional(),
  updatedAt: z.union([z.string(), z.number()]).transform(val => 
    typeof val === 'number' ? new Date(val).toISOString() : val
  ).optional(),
  schemaVersion: z.literal(1).optional(),
}).strict();

// Planner week schema
export const PlannerWeekSchema = z.object({
  days: z.array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])).readonly(),
  slots: z.array(z.enum(["Breakfast", "Lunch", "Dinner"])).readonly(),
  data: z.record(z.string(), z.record(z.string(), z.array(z.string()))),
}).strict();

// Complete export schema
export const ExportSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: z.string(), // ISO timestamp
  recipes: z.array(RecipeSchema),
  planner: z.record(z.string(), PlannerWeekSchema),
}).strict();

export type ExportData = z.infer<typeof ExportSchema>;

// Validation functions
export function validateExportData(data: unknown): ExportData {
  return ExportSchema.parse(data);
}

export function validateRecipe(data: unknown): Recipe {
  const parsed = RecipeSchema.parse(data);
  
  // Transform old format to new format
  const ingredients = Array.isArray(parsed.ingredients) 
    ? parsed.ingredients.map(ing => 
        typeof ing === 'string' 
          ? { id: crypto.randomUUID(), name: ing, quantity: undefined, unit: undefined, note: undefined }
          : ing
      )
    : [];
    
  const steps = Array.isArray(parsed.steps)
    ? parsed.steps.map(step =>
        typeof step === 'string'
          ? { id: crypto.randomUUID(), text: step }
          : step
      )
    : [];
  
  return {
    ...parsed,
    ingredients,
    steps,
  };
}

export function validatePlannerWeek(data: unknown): PlannerWeek {
  return PlannerWeekSchema.parse(data);
}

// Helper to create export filename
export function createExportFilename(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  return `family-recipe-export-v1-${dateStr}.json`;
}
