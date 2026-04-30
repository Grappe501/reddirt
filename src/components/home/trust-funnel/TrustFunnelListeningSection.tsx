"use client";

import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";

const listen = trustFunnelHomeCopy.listening;

const ctaClass =
  "group relative inline-flex min-h-[48px] items-center justify-center overflow-hidden rounded-btn px-6 py-3 text-sm font-bold uppercase tracking-wider transition-[transform,box-shadow] duration-300 ease-out focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/50";

export function TrustFunnelListeningSection() {
  return (
    <section
      className={cn(
        "border-t border-kelly-ink/10 py-section-y lg:py-section-y-lg",
        "bg-kelly-fog/90 bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,rgba(202,145,61,0.07),transparent_55%)]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
      )}
      aria-labelledby="listening-heading"
    >
      <ContentContainer>
        <ScrollReveal className="mx-auto max-w-3xl text-center">
          <h2 id="listening-heading" className="font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            {listen.title}
          </h2>
          <p className="mt-4 font-body text-lg text-kelly-slate">{listen.intro}</p>
        </ScrollReveal>
        <ScrollReveal delay={40} className="mt-10">
          <ul className="mx-auto max-w-2xl list-disc space-y-2 pl-5 font-body text-kelly-slate marker:text-kelly-gold">
            {listen.bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ScrollReveal>
        <ScrollReveal delay={90} className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href={listen.primaryHref}
            className={cn(
              ctaClass,
              "bg-kelly-gold text-kelly-navy shadow-md hover:-translate-y-0.5 hover:bg-kelly-gold-soft hover:shadow-lg",
              "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-kelly-navy/25 after:transition-[width] after:duration-300 after:ease-out hover:after:w-full",
            )}
          >
            {listen.primaryCta}
          </Link>
          <Link
            href={listen.secondaryHref}
            className={cn(
              ctaClass,
              "border-2 border-kelly-ink/18 bg-white/80 text-kelly-ink backdrop-blur-sm hover:-translate-y-0.5 hover:border-kelly-gold/50 hover:shadow-md",
              "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-kelly-gold/80 after:transition-[width] after:duration-300 after:ease-out hover:after:w-full",
            )}
          >
            {listen.secondaryCta}
          </Link>
        </ScrollReveal>
      </ContentContainer>
    </section>
  );
}
