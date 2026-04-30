"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentImage } from "@/components/media/ContentImage";
import { media } from "@/content/media/registry";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { siteConfig } from "@/config/site";
import { voterRegistrationHref } from "@/config/navigation";
import { cn } from "@/lib/utils";

const copy = trustFunnelHomeCopy.hero;

const ctaClass = cn(
  "inline-flex min-h-[48px] items-center justify-center rounded-btn px-6 py-3.5 text-center text-sm font-bold uppercase tracking-[0.1em]",
  "transition-[transform,box-shadow,background-color,border-color] duration-300 ease-out",
  "hover:scale-[1.02] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
  "active:scale-[1.01]",
);

/** Homepage trust-funnel hero: service-forward framing, no primary donate CTA. */
export function TrustFunnelHero() {
  const heroVideo = siteConfig.heroVideoSrc;
  const reduceMotion = useReducedMotion();
  const y = reduceMotion ? 0 : 12;
  const dur = reduceMotion ? 0.01 : 0.42;
  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section
      className="relative min-h-[min(100svh,880px)] overflow-hidden border-b border-kelly-gold/15"
      aria-labelledby="trust-funnel-hero-heading"
    >
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
            mediaClassName="min-h-full w-full object-cover object-[40%_24%] sm:object-[48%_center] md:object-[50%_center]"
            className="block min-h-full"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-kelly-navy/93 via-kelly-deep/84 to-kelly-navy/88" />
        <div
          className="absolute inset-0 bg-gradient-to-l from-kelly-navy/93 from-0% via-kelly-navy/75 via-[50%] to-transparent to-[70%]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-18%,rgba(202,145,61,0.12),transparent_55%)]" />
      </div>

      <ContentContainer className="relative z-[1] flex min-h-[min(100svh,880px)] flex-col justify-end pb-[max(3rem,env(safe-area-inset-bottom))] pt-28 md:justify-center md:pb-16 md:pt-24 lg:pt-28">
        <div className="ml-auto w-full max-w-[min(100%,22rem)] rounded-3xl border border-white/12 bg-kelly-navy/82 p-5 shadow-[0_24px_60px_rgba(12,18,34,0.55)] backdrop-blur-md xs:max-w-md sm:max-w-lg sm:p-7 md:max-w-xl md:p-8 lg:max-w-[32rem] text-white">
          <motion.p
            className="font-body text-[11px] font-bold uppercase tracking-[0.26em] text-kelly-gold md:text-xs"
            initial={reduceMotion ? false : { opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: reduceMotion ? 0 : 0.04, ease }}
          >
            {copy.eyebrow}
          </motion.p>
          <motion.h1
            id="trust-funnel-hero-heading"
            className="mt-4 font-heading text-[clamp(2.1rem,6.5vw,3.35rem)] font-bold leading-[1.05] tracking-tight text-white md:text-[clamp(2.35rem,5.5vw,3.6rem)]"
            initial={reduceMotion ? false : { opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: reduceMotion ? 0 : 0.1, ease }}
          >
            {copy.headline}
          </motion.h1>
          <motion.p
            className="mt-5 max-w-xl font-body text-sm font-medium leading-relaxed text-kelly-gold/95 md:text-base"
            initial={reduceMotion ? false : { opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: reduceMotion ? 0 : 0.16, ease }}
          >
            {copy.subhead}
          </motion.p>
          <motion.p
            className="mt-4 max-w-xl font-body text-base leading-relaxed text-white/92 md:text-lg"
            initial={reduceMotion ? false : { opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: reduceMotion ? 0 : 0.22, ease }}
          >
            {copy.body}
          </motion.p>
          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <motion.div
              className="sm:inline-flex"
              initial={reduceMotion ? false : { opacity: 0, y }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur, delay: reduceMotion ? 0 : 0.3, ease }}
            >
              <Link
                href="/understand"
                className={cn(
                  ctaClass,
                  "w-full sm:w-auto",
                  "bg-kelly-gold text-kelly-navy shadow-md hover:bg-kelly-gold-soft focus-visible:outline-kelly-gold",
                )}
              >
                {copy.ctas.learnOffice}
              </Link>
            </motion.div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur, delay: reduceMotion ? 0 : 0.36, ease }}
              className="sm:inline-flex"
            >
              <Link
                href="/about"
                className={cn(
                  ctaClass,
                  "w-full sm:w-auto",
                  "border-2 border-white/50 bg-kelly-navy/30 text-white backdrop-blur-sm hover:border-kelly-gold/65 hover:bg-kelly-navy/45 focus-visible:outline-white",
                )}
              >
                {copy.ctas.meetKelly}
              </Link>
            </motion.div>
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: dur, delay: reduceMotion ? 0 : 0.42, ease }}
              className="sm:inline-flex"
            >
              <Link
                href={voterRegistrationHref}
                className={cn(
                  ctaClass,
                  "w-full sm:w-auto",
                  "border-2 border-kelly-gold/50 bg-transparent text-kelly-gold hover:bg-kelly-gold/12 focus-visible:outline-kelly-gold",
                )}
              >
                {copy.ctas.voteRegister}
              </Link>
            </motion.div>
          </div>
          <motion.p
            className="mt-8 text-sm font-medium text-white/80"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.48 }}
          >
            <span className="font-heading text-kelly-gold">{copy.closing.accent}</span>
            <span className="text-white/85"> {copy.closing.rest}</span>
          </motion.p>
        </div>
      </ContentContainer>
    </section>
  );
}
