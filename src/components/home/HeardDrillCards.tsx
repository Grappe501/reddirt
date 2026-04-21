"use client";

import { useState } from "react";
import Link from "next/link";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";
import { cn } from "@/lib/utils";
import type { heardItems } from "@/content/homepage";

type Item = (typeof heardItems)[number];

const DEEP_LINKS: Record<string, { href: string; label: string }> = {
  "Voters want the office to feel fair—not performative": { href: "/priorities", label: "Read office priorities" },
  "Small businesses and nonprofits need the SOS to be legible": { href: "/resources", label: "Resources & clarity" },
  "Disengagement is often a design problem": { href: "/why-this-movement", label: "Why this campaign" },
};

export function HeardDrillCards({ items }: { items: readonly Item[] | Item[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
      {items.map((item, i) => {
        const expanded = open === item.title;
        const deep = DEEP_LINKS[item.title];
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
              <p className="mt-4 font-body text-sm leading-relaxed text-civic-slate/95 md:text-base">
                {expanded ? item.body : `${item.body.slice(0, 140)}${item.body.length > 140 ? "…" : ""}`}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-civic-ink/8 pt-4">
                <button
                  type="button"
                  onClick={() => setOpen((v) => (v === item.title ? null : item.title))}
                  className="font-body text-sm font-bold uppercase tracking-wider text-red-dirt hover:text-civic-blue"
                >
                  {expanded ? "Collapse" : "Expand insight"}
                </button>
                {deep ? (
                  <Link href={deep.href} className="font-body text-sm font-semibold text-civic-blue underline-offset-4 hover:underline">
                    {deep.label} →
                  </Link>
                ) : null}
              </div>
            </article>
          </FadeInWhenVisible>
        );
      })}
    </div>
  );
}
