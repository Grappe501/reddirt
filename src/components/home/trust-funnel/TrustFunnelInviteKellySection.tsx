"use client";

import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const copy = trustFunnelHomeCopy.inviteKelly;

export function TrustFunnelInviteKellySection() {
  return (
    <section
      id="invite-kelly"
      className="border-t border-kelly-gold/20 bg-gradient-to-br from-kelly-navy via-kelly-navy to-[#162d4a] py-section-y text-white lg:py-section-y-lg"
      aria-labelledby="invite-kelly-heading"
    >
      <ContentContainer>
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-gold">Your community</p>
          <h2 id="invite-kelly-heading" className="mt-3 font-heading text-2xl font-bold md:text-3xl">
            {copy.title}
          </h2>
          <p className="mt-4 font-body text-lg text-white/90">{copy.intro}</p>
          <p className="mt-4 font-body text-sm text-white/75">{copy.body}</p>
        </ScrollReveal>
        <ScrollReveal delay={70} className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href={copy.ctaHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-kelly-gold px-8 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy shadow-md transition hover:bg-kelly-gold-soft"
          >
            {copy.cta}
          </Link>
          <Link
            href={copy.secondaryHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-white/40 px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:border-kelly-gold/60"
          >
            {copy.secondaryCta}
          </Link>
        </ScrollReveal>
      </ContentContainer>
    </section>
  );
}
