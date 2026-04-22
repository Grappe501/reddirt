"use client";

import { TRUST_RIBBON_ITEMS } from "@/content/home/homepagePremium";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";

export function HomeTrustRibbonSection() {
  return (
    <section
      className="border-y border-civic-blue/20 bg-civic-deep/95"
      aria-label="Campaign credibility"
    >
      <div className="mx-auto grid max-w-[100vw] grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST_RIBBON_ITEMS.map((item, i) => (
          <FadeInWhenVisible key={item.label} delay={i * 0.06} className="border-civic-slate/40 sm:border-l sm:first:border-l-0 lg:border-l">
            <div className="h-full px-[var(--gutter-x)] py-6 transition-colors hover:bg-civic-blue/20 md:py-7 lg:px-10">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-civic-gold md:text-[11px]">
                {item.label}
              </p>
              <p className="mt-2.5 max-w-[22rem] font-body text-sm leading-relaxed text-civic-mist/90">
                {item.detail}
              </p>
            </div>
          </FadeInWhenVisible>
        ))}
      </div>
    </section>
  );
}
