import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Matches `globals.css` `:focus-visible` for custom links and controls that skip the Button component. */
export const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold";

/** Minimum ~44px tap height on small screens; relaxes at `sm` for dense dashboard toolbars. */
export const tapMinSmCompact =
  "min-h-[44px] items-center justify-center sm:min-h-0 sm:items-stretch sm:justify-start";
