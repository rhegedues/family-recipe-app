import Link from "next/link";
import RecipesClient from "./RecipesClient";

export default function RecipesPage({
  searchParams,
}: { searchParams?: { q?: string } }) {
  const initialQuery = typeof searchParams?.q === "string" ? searchParams.q : "";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipes</h1>
          <p className="mt-1 text-sm text-gray-500">Client status: ready ✅</p>
        </div>
        <Link
          href="/recipes/new"
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
        >
          + New Recipe
        </Link>
      </div>

      <RecipesClient initialQuery={initialQuery} />
    </main>
  );
}
