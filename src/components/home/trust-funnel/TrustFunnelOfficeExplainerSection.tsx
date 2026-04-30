"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

const ofc = trustFunnelHomeCopy.officeExplainer;

const cardKeys = ["elections", "business", "records"] as const;

export function TrustFunnelOfficeExplainerSection() {
  const baseId = useId();
  const [open, setOpen] = useState<(typeof cardKeys)[number] | null>(null);

  return (
    <section className="border-t border-kelly-ink/10 py-section-y lg:py-section-y-lg" aria-labelledby="office-explainer-heading">
      <ContentContainer>
        <ScrollReveal yOffset={10} className="mx-auto max-w-3xl text-center">
          <h2 id="office-explainer-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            {ofc.title}
          </h2>
          <p className="mt-4 font-body text-lg text-kelly-slate">{ofc.intro}</p>
        </ScrollReveal>
        <ul className="mt-12 grid list-none gap-5 md:grid-cols-3">
          {cardKeys.map((key, i) => {
            const card = ofc.cards[key];
            const expanded = open === key;
            const panelId = `${baseId}-${key}-panel`;
            const headerId = `${baseId}-${key}-header`;
            return (
              <ScrollReveal key={key} delay={80 + i * 70} yOffset={14}>
                <li
                  className={cn(
                    "flex min-h-0 flex-col rounded-card border border-kelly-ink/10 bg-kelly-fog/50 p-6 shadow-sm outline-none transition-[transform,box-shadow,border-color] duration-300 ease-out",
                    "hover:-translate-y-1 hover:border-kelly-gold/35 hover:shadow-[0_12px_36px_rgba(0,0,102,0.1)]",
                    expanded && "border-kelly-gold/40 shadow-[0_12px_36px_rgba(0,0,102,0.1)]",
                    "focus-within:border-kelly-gold/45 focus-within:ring-2 focus-within:ring-kelly-gold/25",
                  )}
                >
                  <h3 id={headerId} className="font-heading text-lg font-bold text-kelly-navy">
                    {card.title}
                  </h3>
                  <p className="mt-3 font-body text-sm leading-relaxed text-kelly-slate">{card.body}</p>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    className="mt-4 inline-flex min-h-11 items-center rounded-md text-left font-body text-sm font-semibold text-kelly-blue underline decoration-kelly-blue/30 underline-offset-4 transition hover:decoration-kelly-blue focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50"
                    onClick={() => setOpen((v) => (v === key ? null : key))}
                  >
                    {expanded ? "Show less" : "A bit more detail"}
                  </button>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={headerId}
                    hidden={!expanded}
                    className="mt-3 font-body text-sm leading-relaxed text-kelly-slate/95"
                  >
                    {card.detail}
                  </div>
                </li>
              </ScrollReveal>
            );
          })}
        </ul>
        <ScrollReveal delay={120} className="mt-10 flex justify-center">
          <Link
            href={ofc.ctaHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-navy/25 bg-transparent px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-kelly-navy transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-kelly-gold hover:bg-kelly-wash/50 hover:shadow-[0_8px_24px_rgba(0,0,102,0.08)] focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50 active:translate-y-0"
          >
            {ofc.cta}
          </Link>
        </ScrollReveal>
      </ContentContainer>
    </section>
  );
}
