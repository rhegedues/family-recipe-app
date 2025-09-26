"use client";
import React, { useState, useEffect, useRef } from 'react';
import type { Ingredient } from '@/types/recipe';
import { UNIT_OPTIONS } from '@/types/recipe';
import { Button } from '@/components/UI';

interface IngredientBuilderProps {
  value: Ingredient[];
  onChange: (ingredients: Ingredient[]) => void;
  className?: string;
}

export function IngredientBuilder({ value, onChange, className = "" }: IngredientBuilderProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(value);
  const [errors, setErrors] = useState<string[]>([]);
  const lastRowRef = useRef<HTMLInputElement>(null);

  // Update local state when value prop changes
  useEffect(() => {
    setIngredients(value);
  }, [value]);

  // Auto-append empty row when last row becomes non-empty
  useEffect(() => {
    if (ingredients.length === 0 || ingredients[ingredients.length - 1].name.trim()) {
      const newIngredient: Ingredient = {
        id: crypto.randomUUID(),
        name: '',
        quantity: '',
        unit: '',
        note: '',
      };
      setIngredients(prev => [...prev, newIngredient]);
    }
  }, [ingredients]);

  const updateIngredient = (index: number, updates: Partial<Ingredient>) => {
    const updated = ingredients.map((ing, i) => 
      i === index ? { ...ing, ...updates } : ing
    );
    setIngredients(updated);
    onChange(updated.filter(ing => ing.name.trim())); // Only pass non-empty ingredients
  };

  const removeIngredient = (index: number) => {
    const updated = ingredients.filter((_, i) => i !== index);
    setIngredients(updated);
    onChange(updated.filter(ing => ing.name.trim()));
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Focus next input or add new row
      const nextInput = document.querySelector(`[data-ingredient-index="${index + 1}"] input`) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      } else {
        // Add new row and focus it
        const newIngredient: Ingredient = {
          id: crypto.randomUUID(),
          name: '',
          quantity: '',
          unit: '',
          note: '',
        };
        const updated = [...ingredients, newIngredient];
        setIngredients(updated);
        setTimeout(() => {
          const newInput = document.querySelector(`[data-ingredient-index="${ingredients.length}"] input`) as HTMLInputElement;
          newInput?.focus();
        }, 0);
      }
    } else if (e.key === 'Backspace' && !ingredients[index].name.trim()) {
      e.preventDefault();
      removeIngredient(index);
    }
  };

  const validateIngredients = (): string[] => {
    const errors: string[] = [];
    const nonEmptyIngredients = ingredients.filter(ing => ing.name.trim());
    
    if (nonEmptyIngredients.length === 0) {
      errors.push('At least one ingredient is required');
    }

    // Check for duplicate empty rows
    const emptyCount = ingredients.filter(ing => !ing.name.trim()).length;
    if (emptyCount > 1) {
      errors.push('Remove empty ingredient rows');
    }

    return errors;
  };

  // Validate on change
  useEffect(() => {
    setErrors(validateIngredients());
  }, [ingredients]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-2">Ingredients</div>
      
      {ingredients.map((ingredient, index) => (
        <div 
          key={ingredient.id} 
          className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50"
          data-ingredient-index={index}
        >
          {/* Drag Handle */}
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
            aria-label={`Drag to reorder ingredient ${index + 1}`}
            aria-grabbed="false"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
            </svg>
          </button>

          {/* Quantity */}
          <input
            type="text"
            placeholder="Qty"
            value={ingredient.quantity || ''}
            onChange={(e) => updateIngredient(index, { quantity: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label={`Quantity for ingredient ${index + 1}`}
          />

          {/* Unit */}
          <select
            value={ingredient.unit || ''}
            onChange={(e) => updateIngredient(index, { unit: e.target.value })}
            className="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label={`Unit for ingredient ${index + 1}`}
          >
            <option value="">Unit</option>
            {UNIT_OPTIONS.map(unit => (
              <option key={unit} value={unit === 'Custom' ? '' : unit}>
                {unit}
              </option>
            ))}
          </select>

          {/* Name */}
          <input
            type="text"
            placeholder="Ingredient name"
            value={ingredient.name}
            onChange={(e) => updateIngredient(index, { name: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label={`Name for ingredient ${index + 1}`}
            ref={index === ingredients.length - 1 ? lastRowRef : undefined}
          />

          {/* Note */}
          <input
            type="text"
            placeholder="Note (optional)"
            value={ingredient.note || ''}
            onChange={(e) => updateIngredient(index, { note: e.target.value })}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
            aria-label={`Note for ingredient ${index + 1}`}
          />

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => removeIngredient(index)}
            className="text-red-500 hover:text-red-700 p-1"
            aria-label={`Remove ingredient ${index + 1}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ))}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="text-sm text-red-600 space-y-1">
          {errors.map((error, index) => (
            <div key={index}>• {error}</div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        Press Enter to add a new ingredient, Backspace on empty name to remove
      </div>
    </div>
  );
}