import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type JourneyBeatProps = {
  id: string;
  variant?: "light" | "mist" | "deep" | "midnight";
  /** Chapter intro (kicker, title, prose) — keeps one editorial beat per “floor” */
  lead?: ReactNode;
  children: ReactNode;
  className?: string;
};

const variants = {
  light: "bg-white text-kelly-ink",
  /** Solid fog — /80 was letting the sitewide body gradient read as “blue + black” on long pages. */
  mist: "bg-kelly-fog text-kelly-ink",
  deep: "bg-kelly-deep text-kelly-mist",
  midnight: "bg-kelly-navy text-kelly-mist",
} as const;

/**
 * Visual chapter — distinct surface + scroll anchor; children are stacked “rooms” inside the chapter.
 */
export function JourneyBeat({ id, variant = "light", lead, children, className }: JourneyBeatProps) {
  return (
    <section
      id={id}
      data-journey-beat={id}
      className={cn(
        "scroll-mt-[5.5rem] border-t border-kelly-ink/[0.06]",
        variants[variant],
        "py-[var(--journey-beat-pad)] lg:py-[var(--journey-beat-pad-lg)]",
        className,
      )}
    >
      {lead ? (
        <div className="mx-auto max-w-content px-[var(--gutter-x)] pb-6 sm:pb-8 lg:pb-14">{lead}</div>
      ) : null}
      <div className={cn("mx-auto max-w-[100vw]", lead ? "divide-y divide-kelly-ink/[0.07]" : "")}>{children}</div>
    </section>
  );
}
