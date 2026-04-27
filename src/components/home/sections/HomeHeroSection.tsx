"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentImage } from "@/components/media/ContentImage";
import { media } from "@/content/media/registry";
import { siteConfig } from "@/config/site";
import { isExternalHref } from "@/lib/href";
import { cn } from "@/lib/utils";
import type { HomepageHeroMerged } from "@/lib/content/homepage-merge";

export type HomeHeroSectionProps = {
  hero: HomepageHeroMerged;
};

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
};

export function HomeHeroSection({ hero }: HomeHeroSectionProps) {
  const heroVideo = siteConfig.heroVideoSrc;

  return (
    <section
      className="relative min-h-[100svh] overflow-hidden border-b border-kelly-gold/15 md:min-h-[min(100svh,920px)]"
      aria-label="Campaign hero"
    >
      {/* MEDIA: full-bleed video or still — swap src via CMS/env */}
      <div className="absolute inset-0" aria-hidden>
        {heroVideo ? (
          <video
            className="h-full w-full object-cover object-[44%_28%] sm:object-[48%_center] lg:object-[52%_center]"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={heroVideo} />
          </video>
        ) : (
          <ContentImage
            media={media.heroHome}
            priority
            warmOverlay={false}
            mediaClassName="min-h-full w-full object-cover object-[40%_24%] xs:object-[44%_26%] sm:object-[48%_center] md:object-[50%_center] lg:object-[52%_center]"
            className="block min-h-full"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-kelly-navy/95 via-kelly-deep/88 to-kelly-navy/92" />
        {/* Read lane on the right (panel is ml-auto) — left stays lighter so the candidate reads clearly */}
        <div
          className="absolute inset-0 bg-gradient-to-l from-kelly-navy/97 from-0% via-kelly-navy/82 via-[48%] to-transparent to-[72%]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(202,145,61,0.14),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_50%,rgba(0,0,102,0.45),transparent_45%)]" />
      </div>

      <ContentContainer className="relative z-[1] flex min-h-[100svh] flex-col justify-end pb-12 pt-28 md:min-h-[min(100svh,920px)] md:justify-center md:pb-20 md:pt-24 lg:pt-28">
        {/* Right-aligned panel (phone + desktop) so copy clears Kelly — image crop favors left/center */}
        <div className="ml-auto w-full max-w-[min(100%,22rem)] rounded-3xl border border-white/12 bg-kelly-navy/82 p-5 shadow-[0_24px_60px_rgba(12,18,34,0.55)] backdrop-blur-md xs:max-w-md sm:max-w-lg sm:p-7 md:max-w-xl md:p-8 lg:max-w-[28rem] text-white">
          <motion.p
            className="font-body text-[11px] font-bold uppercase tracking-[0.28em] text-kelly-gold md:text-xs"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
          >
            {hero.eyebrow}
          </motion.p>
          <motion.h1
            className="mt-5 font-heading text-[clamp(2.75rem,8vw,4.5rem)] font-bold leading-[1.02] tracking-tight text-white md:text-[clamp(3.25rem,7.2vw,4.75rem)] [text-shadow:0_2px_24px_rgba(12,18,34,0.45)]"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.12 }}
          >
            {hero.titleBefore}
            <span className="text-kelly-gold"> {hero.titleAccent}</span>
            {hero.titleAfter ? (
              <span className="mt-1 block text-white/95">{hero.titleAfter}</span>
            ) : null}
          </motion.h1>
          <motion.p
            className="mt-6 max-w-xl font-body text-lg leading-relaxed text-white/95 [text-shadow:0_1px_3px_rgba(12,18,34,0.92)] md:text-xl"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
          >
            {hero.subtitle}
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col gap-3 xs:flex-row xs:flex-wrap xs:items-center"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.28 }}
          >
            <Link
              href={hero.ctaPrimaryHref}
              target={isExternalHref(hero.ctaPrimaryHref) ? "_blank" : undefined}
              rel={isExternalHref(hero.ctaPrimaryHref) ? "noopener noreferrer" : undefined}
              className={cn(
                "inline-flex min-h-[48px] items-center justify-center rounded-btn px-7 py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em]",
                "bg-kelly-gold text-kelly-navy shadow-lg shadow-black/25 transition duration-normal",
                "hover:bg-kelly-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold",
              )}
            >
              {hero.ctaPrimaryLabel}
              {isExternalHref(hero.ctaPrimaryHref) ? (
                <span className="sr-only"> Opens KellyGrappe.com in a new tab.</span>
              ) : null}
            </Link>
            <Link
              href={hero.ctaSecondaryHref}
              target={isExternalHref(hero.ctaSecondaryHref) ? "_blank" : undefined}
              rel={isExternalHref(hero.ctaSecondaryHref) ? "noopener noreferrer" : undefined}
              className={cn(
                "inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-white/50 bg-kelly-navy/25 px-7 py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em] text-white backdrop-blur-[2px]",
                "transition hover:border-kelly-gold/70 hover:bg-kelly-navy/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              )}
            >
              {hero.ctaSecondaryLabel}
            </Link>
          </motion.div>
          <motion.p
            className="mt-10 max-w-xl rounded-r-card border-l-[3px] border-kelly-gold bg-kelly-navy/92 py-4 pl-5 pr-4 font-heading text-lg font-semibold leading-snug text-white shadow-lg shadow-black/20 md:py-5 md:pl-6 md:text-xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-kelly-gold">People over politics</span>
            <span className="text-white">—always.</span>
          </motion.p>
          <motion.p
            className="mt-8 max-w-md border-l-2 border-kelly-gold/70 pl-4 font-body text-[11px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-white/85 md:text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            75 counties · One promise · The people come first.
          </motion.p>
        </div>
      </ContentContainer>
    </section>
  );
}
