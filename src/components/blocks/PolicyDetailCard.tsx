import { cn } from "@/lib/utils";

export type PolicyDetailCardTone = "ivory" | "mist" | "navy-veil";

type PolicyDetailCardProps = {
  title: string;
  body: string;
  /** Rotating surface styles so grids feel intentional, not a checkerboard. */
  tone?: PolicyDetailCardTone;
  className?: string;
};

const toneClass: Record<PolicyDetailCardTone, string> = {
  ivory: "from-white to-[var(--kelly-mist)]/35",
  mist: "from-[var(--kelly-mist)]/50 to-[var(--kelly-fog)]/85",
  "navy-veil": "from-kelly-navy/[0.05] to-white",
};

/**
 * Refined card for /priorities and similar policy grids — not plain white boxes.
 */
export function PolicyDetailCard({ title, body, tone = "ivory", className }: PolicyDetailCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-kelly-navy/10 bg-gradient-to-br p-6 shadow-md shadow-kelly-navy/[0.06] transition duration-300",
        "hover:-translate-y-0.5 hover:border-kelly-gold/25 hover:shadow-lg hover:shadow-kelly-navy/[0.08]",
        "focus-within:ring-2 focus-within:ring-kelly-gold/30",
        toneClass[tone],
        className,
      )}
    >
      <div
        className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-kelly-gold via-kelly-gold/80 to-kelly-navy/70 opacity-90"
        aria-hidden
      />
      <div className="relative pl-4 sm:pl-5">
        <h3 className="font-heading text-lg font-bold tracking-tight text-kelly-text sm:text-[1.15rem]">{title}</h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/78">{body}</p>
      </div>
    </article>
  );
}
