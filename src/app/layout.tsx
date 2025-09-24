import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';

export const metadata: Metadata = {
  title: "Family Recipe App",
  description: "Plan meals, save recipes, and cook together.",
  keywords: ["recipes", "meal planning", "cooking", "family"],
  authors: [{ name: "Family Recipe App" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍳</text></svg>" />
      </head>
      <body className="min-h-screen">
        <header className="border-b bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">Family Recipe App</Link>
            <Navigation />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}







