import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";
import { cn } from "@/lib/utils";

export type PillarItem = {
  title: string;
  body: string;
  id?: string;
};

type PillarGridProps = {
  items: PillarItem[];
  cols?: "2" | "3" | "4";
  className?: string;
};

const barColors = ["bg-kelly-gold", "bg-kelly-navy/70", "bg-kelly-blue/60"] as const;

export function PillarGrid({ items, cols = "2", className }: PillarGridProps) {
  return (
    <ResponsiveGrid cols={cols} className={className}>
      {items.map((item, i) => {
        const bar = barColors[i % barColors.length] ?? barColors[0];
        return (
          <article
            key={item.id ?? item.title}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-7 md:p-8",
              "border-kelly-navy/12 bg-gradient-to-br from-white via-white to-[var(--kelly-mist)]/35",
              "shadow-md shadow-kelly-navy/[0.07] transition duration-300",
              "hover:-translate-y-1 hover:border-kelly-gold/30 hover:shadow-xl hover:shadow-kelly-navy/10",
            )}
          >
            <div
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-kelly-gold/10 blur-2xl transition group-hover:bg-kelly-gold/[0.16]"
              aria-hidden
            />
            <span className={cn("relative mb-3 block h-1 w-10 rounded-full", bar)} aria-hidden />
            <h3 className="relative font-heading text-xl font-bold tracking-tight text-kelly-text lg:text-2xl">
              {item.title}
            </h3>
            <p className="relative mt-4 font-body text-base leading-[1.65] text-kelly-text/78">{item.body}</p>
          </article>
        );
      })}
    </ResponsiveGrid>
  );
}
