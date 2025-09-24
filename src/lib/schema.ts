import { z } from 'zod';
import type { Recipe, IsoWeekString, PlannerWeek } from '@/types/recipe';

// Recipe schema for export/import
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
  ingredients: z.array(z.string()),
  steps: z.array(z.string()),
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
  return RecipeSchema.parse(data);
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
