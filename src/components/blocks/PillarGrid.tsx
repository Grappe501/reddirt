import { ResponsiveGrid } from "@/components/layout/ResponsiveGrid";

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

export function PillarGrid({ items, cols = "2", className }: PillarGridProps) {
  return (
    <ResponsiveGrid cols={cols} className={className}>
      {items.map((item) => (
        <article
          key={item.id ?? item.title}
          className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-7 shadow-[var(--shadow-soft)] md:p-8"
        >
          <h3 className="font-heading text-xl font-bold text-deep-soil lg:text-2xl">{item.title}</h3>
          <p className="mt-3 font-body text-base leading-relaxed text-deep-soil/75">{item.body}</p>
        </article>
      ))}
    </ResponsiveGrid>
  );
}
