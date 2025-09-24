import * as React from "react";

export function Card(
  { className = "", ...props }: React.HTMLAttributes<HTMLDivElement>
) {
  return (
    <div
      className={`rounded-2xl bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)] border border-gray-100 ${className}`}
      {...props}
    />
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  iconLeft?: React.ReactNode;
};

export function Button({ variant = "primary", iconLeft, className = "", children, ...props }: ButtonProps) {
  const base =
    "inline-flex items-center gap-2 justify-center rounded-xl px-4 py-2 font-medium transition-colors";
  const styles = {
    primary:
      "bg-orange-500 text-white hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300",
  } as const;
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {iconLeft ? <span className="-ml-1">{iconLeft}</span> : null}
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-400 ${props.className ?? ""}`}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-400 ${props.className ?? ""}`}
    />
  );
}

export function Chip(
  { active = false, className = "", children, ...props }:
  React.HTMLAttributes<HTMLButtonElement> & { active?: boolean }
) {
  return (
    <button
      {...props}
      aria-pressed={active}
      className={`px-4 py-2 rounded-full text-sm border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
        active 
          ? "bg-orange-700 text-white border-orange-700 hover:bg-orange-800" 
          : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
      } ${className}`}
    >
      {children}
    </button>
  );
}
