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
      className="relative min-h-[100svh] overflow-hidden border-b border-civic-gold/15 md:min-h-[min(100svh,920px)]"
      aria-label="Campaign hero"
    >
      {/* MEDIA: full-bleed video or still — swap src via CMS/env */}
      <div className="absolute inset-0" aria-hidden>
        {heroVideo ? (
          <video className="h-full w-full object-cover" autoPlay muted loop playsInline>
            <source src={heroVideo} />
          </video>
        ) : (
          <ContentImage media={media.heroHome} priority warmOverlay={false} className="block min-h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-civic-midnight/95 via-civic-deep/88 to-civic-midnight/92" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(201,162,39,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_50%,rgba(30,47,77,0.5),transparent_45%)]" />
      </div>

      <ContentContainer className="relative z-[1] flex min-h-[100svh] flex-col justify-end pb-12 pt-28 md:min-h-[min(100svh,920px)] md:justify-center md:pb-20 md:pt-24 lg:pt-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end lg:gap-10">
          <div className="lg:col-span-7 xl:col-span-6">
            <motion.p
              className="font-body text-[11px] font-bold uppercase tracking-[0.28em] text-civic-gold-soft md:text-xs"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.05 }}
            >
              {hero.eyebrow}
            </motion.p>
            <motion.h1
              className="mt-5 font-heading text-[clamp(2.75rem,8vw,4.5rem)] font-bold leading-[1.02] tracking-tight text-civic-mist md:text-[clamp(3.25rem,7.2vw,4.75rem)]"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.12 }}
            >
              {hero.titleBefore}
              <span className="text-civic-gold"> {hero.titleAccent}</span>
              {hero.titleAfter ? <span className="mt-1 block text-civic-fog">{hero.titleAfter}</span> : null}
            </motion.h1>
            <motion.p
              className="mt-6 max-w-xl font-body text-lg leading-relaxed text-civic-mist/85 md:text-xl"
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
                  "bg-civic-gold text-civic-midnight shadow-lg shadow-black/25 transition duration-normal",
                  "hover:bg-civic-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic-gold",
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
                  "inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-civic-mist/35 bg-transparent px-7 py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em] text-civic-mist",
                  "transition hover:border-civic-gold/50 hover:bg-civic-mist/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic-mist",
                )}
              >
                {hero.ctaSecondaryLabel}
              </Link>
            </motion.div>
            <motion.p
              className="mt-10 max-w-md border-l-2 border-civic-gold/50 pl-4 font-body text-[11px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-civic-mist/55 md:text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
            >
              75 counties · One promise · The people come first.
            </motion.p>
          </div>

          <motion.div
            className="relative hidden min-h-[280px] lg:col-span-5 lg:block xl:col-span-6"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* MEDIA: portrait / b-roll panel */}
            <div className="relative overflow-hidden rounded-card border border-civic-gold/20 shadow-2xl shadow-black/40">
              <div className="absolute inset-0 bg-gradient-to-t from-civic-midnight via-transparent to-transparent" />
              <ContentImage
                media={media.heroHome}
                warmOverlay={false}
                className="block max-h-[min(52vh,520px)] w-full object-cover opacity-90"
              />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <p className="font-heading text-lg font-semibold leading-snug text-civic-mist md:text-xl">
                  People Over Politics. Always.
                </p>
                <p className="mt-2 font-body text-sm text-civic-mist/70">
                  {/* MEDIA: Replace with caption or short pull-quote from trail footage */}
                  Trail photography and b-roll: Kelly speaking, listening, and showing up across Arkansas.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </ContentContainer>
    </section>
  );
}
