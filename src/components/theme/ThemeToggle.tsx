"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "./ThemeProvider";

type Props = {
  /** `header`: icon on navy bar. `panel`: readable on page backgrounds (e.g. teaching banner). */
  variant?: "header" | "panel";
  /** `icon` only, or `full` with text label for the current mode. */
  layout?: "icon" | "full";
  className?: string;
};

export function ThemeToggle({ variant = "header", layout = "icon", className }: Props) {
  const { theme, cycle, mounted } = useTheme();

  const label =
    theme === "dark"
      ? "Reading theme: dark. Activate to match your device."
      : theme === "system"
        ? "Reading theme: matching device. Activate for light."
        : "Reading theme: light. Activate for dark.";

  if (!mounted) {
    return (
      <span
        className={cn(
          "inline-flex h-10 min-w-10 items-center justify-center rounded-lg",
          variant === "header" && "text-white/50",
          className,
        )}
        aria-hidden
      />
    );
  }

  const Icon = theme === "dark" ? Moon : theme === "system" ? Laptop : Sun;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold",
        variant === "header" &&
          "min-h-10 min-w-10 text-white/90 hover:bg-white/10 hover:text-white lg:min-h-11 lg:min-w-11",
        variant === "panel" &&
          "min-h-10 border border-kelly-text/12 bg-kelly-page/90 px-2.5 text-kelly-navy hover:bg-kelly-page dark:border-white/12 dark:bg-kelly-deep/80 dark:text-kelly-gold-soft dark:hover:bg-kelly-deep",
        layout === "full" && "px-3",
        className,
      )}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      {layout === "full" ? (
        <span className="text-xs font-semibold capitalize tracking-wide">{theme}</span>
      ) : null}
    </button>
  );
}
