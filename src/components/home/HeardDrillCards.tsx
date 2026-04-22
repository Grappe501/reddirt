"use client";

import { useState } from "react";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { cn } from "@/lib/utils";
import type { heardItems } from "@/content/homepage";

type Item = (typeof heardItems)[number];

/** Below this, four lines usually hold the full text—no expand affordance. */
const EXPAND_MEANINGFUL_MIN_CHARS = 320;

export function HeardDrillCards({ items }: { items: readonly Item[] | Item[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
      {items.map((item, i) => {
        const expanded = open === item.title;
        const canExpand = item.body.length >= EXPAND_MEANINGFUL_MIN_CHARS;
        return (
          <FadeInWhenVisible key={item.title} delay={0.06 * i}>
            <article
              className={cn(
                "flex h-full flex-col rounded-card border border-civic-ink/10 bg-civic-fog/50 p-6 shadow-sm md:p-7",
                "transition duration-300 hover:border-civic-gold/35 hover:bg-white hover:shadow-md",
                expanded && "border-civic-gold/40 bg-white shadow-lg",
              )}
            >
              <h3 className="font-heading text-lg font-bold leading-snug text-civic-ink md:text-xl">{item.title}</h3>
              <p
                className={cn(
                  "mt-4 font-body text-sm leading-relaxed text-civic-slate/95 md:text-base",
                  canExpand && !expanded && "line-clamp-4",
                )}
              >
                {item.body}
              </p>
              {canExpand ? (
                <div className="mt-5 border-t border-civic-ink/8 pt-4">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpen((v) => (v === item.title ? null : item.title))}
                    className="font-body text-sm font-bold uppercase tracking-wider text-red-dirt hover:text-civic-blue"
                  >
                    {expanded ? "Collapse" : "Expand insight"}
                  </button>
                </div>
              ) : null}
            </article>
          </FadeInWhenVisible>
        );
      })}
    </div>
  );
}
