"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export type FaqItem = { q: string; a: string };

export function FAQAccordion({ items, className }: { items: FaqItem[]; className?: string }) {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, i) => {
        const panelId = `${baseId}-panel-${i}`;
        const headerId = `${baseId}-header-${i}`;
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)]"
          >
            <h3 className="font-heading text-lg font-bold text-deep-soil">
              <button
                type="button"
                id={headerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-dirt md:px-6 md:py-5"
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span>{item.q}</span>
                <span aria-hidden className="text-red-dirt">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              hidden={!isOpen}
              className="border-t border-deep-soil/10 px-5 pb-5 pt-2 md:px-6"
            >
              <p className="font-body text-base leading-relaxed text-deep-soil/80">{item.a}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
