import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl p-8 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-gray-600 mt-2">
        Check the URL or go back to Recipes.
      </p>
      <Link className="underline mt-4 inline-block" href="/recipes">
        Back to Recipes
      </Link>
    </main>
  );
}
