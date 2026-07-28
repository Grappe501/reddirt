"use client";

import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const copy = trustFunnelHomeCopy.meetKelly;

/** Concise Meet Kelly preview — full biography stays on `/about` (Slice 1). */
export function TrustFunnelMeetKellySection() {
  return (
    <section
      id="meet-kelly"
      className="border-t border-kelly-ink/10 bg-white py-section-y lg:py-section-y-lg"
      aria-labelledby="meet-kelly-heading"
    >
      <ContentContainer>
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <h2 id="meet-kelly-heading" className="font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-lg leading-relaxed text-kelly-slate">{copy.intro}</p>
          <p className="mt-3 font-body text-base leading-relaxed text-kelly-slate/90">{copy.body}</p>
        </ScrollReveal>
        <ScrollReveal delay={60} className="mt-8 flex justify-center">
          <Link
            href={copy.ctaHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-navy px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-kelly-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
          >
            {copy.cta}
          </Link>
        </ScrollReveal>
      </ContentContainer>
    </section>
  );
}
