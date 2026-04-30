"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type BiographyTocItem = { id: string; label: string };

type Props = {
  items: BiographyTocItem[];
  className?: string;
};

export function BiographyChapterToc({ items, className }: Props) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const sections = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el != null);
    if (sections.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        const id = visible[0]?.target.id;
        if (id) setActive(id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [items]);

  return (
    <aside
      className={cn("w-56 shrink-0 self-start lg:sticky lg:top-28", className)}
      aria-label="Chapter list"
    >
      <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Jump to</p>
      <ol className="mt-3 space-y-2 border-l border-kelly-text/10 pl-3">
        {items.map((it) => {
          const current = active === it.id;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className={cn(
                  "block py-1 font-body text-xs leading-snug transition",
                  current ? "font-semibold text-kelly-navy" : "text-kelly-text/70 hover:text-kelly-navy",
                )}
                aria-current={current ? "location" : undefined}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
