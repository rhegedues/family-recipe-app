"use client";
import { useParams, useRouter } from "next/navigation";
import { useRecipeStore } from "@/store/recipes";
import { Button, Card } from "@/components/UI";
import { ArrowLeft, Edit, Trash2, Clock, Users, ChefHat } from "lucide-react";

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { recipes, deleteRecipe } = useRecipeStore();
  
  const recipeId = params.id as string;
  const recipe = recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Recipe Not Found</h1>
          <p className="text-gray-600 mb-6">The recipe you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/recipes")}>
            Back to Recipes
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${recipe.title}"?\n\nThis action cannot be undone.`
    );
    if (confirmed) {
      deleteRecipe(recipe.id);
      // Show success message (simple alert for now)
      alert(`Recipe "${recipe.title}" has been deleted successfully.`);
      router.push("/recipes");
    }
  };

  const handleEdit = () => {
    // Navigate to recipes page with edit mode enabled
    router.push(`/recipes?edit=${recipe.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header with back button */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="secondary"
          onClick={() => router.push('/recipes')}
          iconLeft={<ArrowLeft className="w-4 h-4" />}
        >
          Back
        </Button>
        <div className="flex-1" />
        <Button variant="secondary" onClick={handleEdit} iconLeft={<Edit className="w-4 h-4" />}>
          Edit Recipe
        </Button>
        <Button
          variant="secondary"
          onClick={handleDelete}
          iconLeft={<Trash2 className="w-4 h-4" />}
          className="text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300"
        >
          Delete Recipe
        </Button>
      </div>

      {/* Recipe Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
        {recipe.description && (
          <p className="text-xl text-gray-600">{recipe.description}</p>
        )}
        
        {/* Categories */}
        {recipe.categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {recipe.categories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Recipe Meta Info */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Time */}
        {recipe.time?.total && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="font-medium">{typeof recipe.time.total === 'number' ? `${recipe.time.total} minutes` : recipe.time.total}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Difficulty */}
        {recipe.difficulty && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Difficulty</p>
                <p className="font-medium">{recipe.difficulty}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Cuisine */}
        {recipe.cuisine && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <ChefHat className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Cuisine</p>
                <p className="font-medium">{recipe.cuisine}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Extra Tags */}
      {recipe.extraTags && recipe.extraTags.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {recipe.extraTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ingredients */}
      {recipe.ingredients.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <Card className="p-6">
            <ul className="space-y-2 list-disc list-inside">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="text-gray-700 leading-6">
                  {ingredient}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Steps */}
      {recipe.steps.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-4">
            {recipe.steps.map((step, index) => (
              <Card key={index} className="p-6">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </span>
                  <div style={{ width: '16px' }}></div>
                  <span className="text-gray-700">{step.replace(/\n/g, ' ').trim()}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Created/Updated info */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
        <p>Created: {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : 'Unknown'}</p>
        {recipe.updatedAt && recipe.updatedAt !== recipe.createdAt && (
          <p>Updated: {new Date(recipe.updatedAt).toLocaleDateString()}</p>
        )}
      </div>
    </div>
  );
}
