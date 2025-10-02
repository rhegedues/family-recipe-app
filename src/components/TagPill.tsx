"use client";
import clsx from "clsx";

const COLORS: Record<string, string> = {
  breakfast: "bg-yellow-100 text-yellow-800",
  lunch: "bg-green-100 text-green-800",
  dinner: "bg-blue-100 text-blue-800",
  dessert: "bg-pink-100 text-pink-800",
  quick: "bg-emerald-100 text-emerald-800",
  healthy: "bg-lime-100 text-lime-800",
};

export default function TagPill({
  tag,
  active = false,
  onClick,
  className,
}: {
  tag: string;
  active?: boolean;
  onClick?: (tag: string) => void;
  className?: string;
}) {
  const key = tag.toLowerCase();
  const color = COLORS[key] ?? "bg-slate-100 text-slate-700";
  return (
    <button
      type="button"
      onClick={onClick ? () => onClick(tag) : undefined}
      className={clsx(
        "px-2.5 py-1 rounded-full text-xs font-medium transition",
        color,
        active && "ring-2 ring-offset-1 ring-black/10",
        onClick && "hover:opacity-90",
        className
      )}
      aria-pressed={active}
    >
      {tag}
    </button>
  );
}
