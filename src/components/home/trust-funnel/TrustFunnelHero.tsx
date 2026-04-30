"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentImage } from "@/components/media/ContentImage";
import { media } from "@/content/media/registry";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import { siteConfig } from "@/config/site";
import { voterRegistrationHref } from "@/config/navigation";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

const copy = trustFunnelHomeCopy.hero;

/** Homepage trust-funnel hero: service-forward framing, no primary donate CTA. */
export function TrustFunnelHero() {
  const heroVideo = siteConfig.heroVideoSrc;

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
        <div className="absolute inset-0 bg-gradient-to-b from-kelly-navy/94 via-kelly-deep/86 to-kelly-navy/90" />
        <div
          className="absolute inset-0 bg-gradient-to-l from-kelly-navy/95 from-0% via-kelly-navy/78 via-[50%] to-transparent to-[70%]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-18%,rgba(202,145,61,0.12),transparent_55%)]" />
      </div>

      <ContentContainer className="relative z-[1] flex min-h-[min(100svh,880px)] flex-col justify-end pb-[max(3rem,env(safe-area-inset-bottom))] pt-28 md:justify-center md:pb-16 md:pt-24 lg:pt-28">
        <div className="ml-auto w-full max-w-[min(100%,22rem)] rounded-3xl border border-white/12 bg-kelly-navy/84 p-5 shadow-[0_24px_60px_rgba(12,18,34,0.55)] backdrop-blur-md xs:max-w-md sm:max-w-lg sm:p-7 md:max-w-xl md:p-8 lg:max-w-[32rem] text-white">
          <motion.p
            className="font-body text-[11px] font-bold uppercase tracking-[0.26em] text-kelly-gold md:text-xs"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.04 }}
          >
            {copy.eyebrow}
          </motion.p>
          <motion.h1
            id="trust-funnel-hero-heading"
            className="mt-4 font-heading text-[clamp(2.1rem,6.5vw,3.35rem)] font-bold leading-[1.05] tracking-tight text-white md:text-[clamp(2.35rem,5.5vw,3.6rem)]"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
          >
            {copy.headline}
          </motion.h1>
          <motion.p
            className="mt-5 max-w-xl font-body text-sm font-medium leading-relaxed text-kelly-gold/95 md:text-base"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.14 }}
          >
            {copy.subhead}
          </motion.p>
          <motion.p
            className="mt-4 max-w-xl font-body text-base leading-relaxed text-white/92 md:text-lg"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.18 }}
          >
            {copy.body}
          </motion.p>
          <motion.div
            className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap"
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.26 }}
          >
            <Link
              href="/understand"
              className={cn(
                "inline-flex min-h-[48px] items-center justify-center rounded-btn px-6 py-3.5 text-center text-sm font-bold uppercase tracking-[0.1em]",
                "bg-kelly-gold text-kelly-navy shadow-lg transition",
                "hover:bg-kelly-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold",
              )}
            >
              {copy.ctas.learnOffice}
            </Link>
            <Link
              href="/about"
              className={cn(
                "inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-white/50 bg-kelly-navy/30 px-6 py-3.5 text-center text-sm font-bold uppercase tracking-[0.1em] text-white backdrop-blur-sm",
                "transition hover:border-kelly-gold/65 hover:bg-kelly-navy/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
              )}
            >
              {copy.ctas.meetKelly}
            </Link>
            <Link
              href={voterRegistrationHref}
              className={cn(
                "inline-flex min-h-[48px] items-center justify-center rounded-btn border-2 border-kelly-gold/50 bg-transparent px-6 py-3.5 text-center text-sm font-bold uppercase tracking-[0.1em] text-kelly-gold",
                "transition hover:bg-kelly-gold/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold",
              )}
            >
              {copy.ctas.voteRegister}
            </Link>
          </motion.div>
          <motion.p
            className="mt-8 text-sm font-medium text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38, duration: 0.5 }}
          >
            <span className="font-heading text-kelly-gold">{copy.closing.accent}</span>
            <span className="text-white/85"> {copy.closing.rest}</span>
          </motion.p>
        </div>
      </ContentContainer>
    </section>
  );
}
