"use client";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Navigation() {
  const router = useRouter();
  const [isDataToolsEnabled, setIsDataToolsEnabled] = useState(false);

  useEffect(() => {
    // Check if data tools are enabled via environment variable
    // Enable automatically in development, require explicit flag in production
    const enabled = 
      process.env.NEXT_PUBLIC_ENABLE_DATA_TOOLS === 'true';
    setIsDataToolsEnabled(enabled);
  }, []);

  const handleRecipesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Force navigation to clean recipes page
    router.push('/recipes');
  };

  return (
    <nav className="flex gap-3 text-sm">
      <Link 
        className="rounded-lg px-3 py-1 hover:bg-gray-100" 
        href="/recipes"
        onClick={handleRecipesClick}
      >
        Recipes
      </Link>
      <Link className="rounded-lg px-3 py-1 hover:bg-gray-100" href="/plan">Meal Planner</Link>
      {isDataToolsEnabled && (
        <Link className="rounded-lg px-3 py-1 hover:bg-gray-100" href="/data">Data</Link>
      )}
    </nav>
  );
}
