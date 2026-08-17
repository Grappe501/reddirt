"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { ContentImage } from "@/components/media/ContentImage";
import { EditableCopy } from "@/components/site-edit/EditableCopy";
import { SiteEditMediaChrome } from "@/components/site-edit/SiteEditMediaChrome";
import { media } from "@/content/media/registry";
import { trustFunnelHomeCopy } from "@/content/home/trust-funnel-home";
import {
  trustFunnelCtaOutlineOnDark,
  trustFunnelCtaPrimary,
} from "@/components/home/trust-funnel/trustFunnelChrome";
import { cn } from "@/lib/utils";

const defaults = trustFunnelHomeCopy.hero;

export type TrustFunnelHeroCopy = {
  brand: string;
  office: string;
  promise: string;
  body: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

type Props = {
  editing?: boolean;
  copy?: TrustFunnelHeroCopy;
};

/**
 * Homepage opening impression — brand, office, promise, two CTAs.
 * Still only (no autoplay video). Prefer a HERO trail still only when curated.
 * Edit mode: inline copy + Change media on background slot.
 */
export function TrustFunnelHero({ editing = false, copy }: Props) {
  const reduceMotion = useReducedMotion();
  const y = reduceMotion ? 0 : 12;
  const dur = reduceMotion ? 0.01 : 0.42;
  const ease = [0.22, 1, 0.36, 1] as const;
  const c: TrustFunnelHeroCopy = copy ?? {
    brand: defaults.brand,
    office: defaults.office,
    promise: defaults.promise,
    body: defaults.body,
    ctaPrimary: defaults.ctas[0].label,
    ctaSecondary: defaults.ctas[1].label,
  };

  return (
    <section
      className="relative min-h-[min(92svh,740px)] overflow-hidden border-b border-kelly-gold/15 sm:min-h-[min(100svh,880px)]"
      aria-labelledby="trust-funnel-hero-heading"
    >
      <div className="absolute inset-0" aria-hidden={!editing}>
        <SiteEditMediaChrome slotKey="home.hero.background" editing={editing}>
          <ContentImage
            media={media.heroHome}
            priority
            warmOverlay={false}
            mediaClassName="min-h-full w-full object-cover object-[42%_28%] sm:object-[48%_center] md:object-[50%_center]"
            className="block min-h-full"
          />
        </SiteEditMediaChrome>
        <div className="absolute inset-0 bg-gradient-to-b from-kelly-navy/93 via-kelly-deep/84 to-kelly-navy/88" />
        <div
          className="absolute inset-0 bg-gradient-to-l from-kelly-navy/93 from-0% via-kelly-navy/75 via-[50%] to-transparent to-[70%]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-18%,rgba(202,145,61,0.12),transparent_55%)]" />
      </div>

      <ContentContainer className="relative z-[1] flex min-h-[min(92svh,740px)] flex-col justify-end pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-24 sm:min-h-[min(100svh,880px)] sm:pt-28 md:justify-center md:pb-16 md:pt-24 lg:pt-28">
        <div className="ml-auto w-full max-w-[min(100%,22rem)] rounded-card border border-white/18 bg-kelly-navy p-5 shadow-[0_24px_60px_rgba(12,18,34,0.7)] xs:max-w-md sm:max-w-lg sm:p-7 md:max-w-xl md:p-8 lg:max-w-[32rem] text-white">
          <motion.h1
            id="trust-funnel-hero-heading"
            className="font-heading text-[clamp(1.85rem,7.2vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-white sm:text-[clamp(2rem,6vw,3.25rem)]"
            initial={reduceMotion ? false : { opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: reduceMotion ? 0 : 0.04, ease }}
          >
            <EditableCopy
              copyKey="home.hero.brand"
              value={c.brand}
              editing={editing}
              as="span"
              className="font-heading text-[clamp(1.85rem,7.2vw,3.25rem)] font-bold leading-[1.08] tracking-tight text-white sm:text-[clamp(2rem,6vw,3.25rem)]"
            />
          </motion.h1>
          <motion.div
            className="mt-3 font-body text-sm font-bold uppercase tracking-[0.2em] text-kelly-gold md:text-base md:tracking-[0.18em]"
            initial={reduceMotion ? false : { opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: reduceMotion ? 0 : 0.1, ease }}
          >
            <EditableCopy
              copyKey="home.hero.office"
              value={c.office}
              editing={editing}
              as="p"
              className="font-body text-sm font-bold uppercase tracking-[0.2em] text-kelly-gold md:text-base md:tracking-[0.18em]"
            />
          </motion.div>
          <motion.div
            className="mt-5 font-heading text-[clamp(1.35rem,3.5vw,1.95rem)] font-bold leading-snug tracking-tight text-white"
            initial={reduceMotion ? false : { opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: reduceMotion ? 0 : 0.16, ease }}
          >
            <EditableCopy
              copyKey="home.hero.promise"
              value={c.promise}
              editing={editing}
              as="p"
              className="font-heading text-[clamp(1.35rem,3.5vw,1.95rem)] font-bold leading-snug tracking-tight text-white"
            />
          </motion.div>
          <motion.div
            className="mt-4 max-w-xl font-body text-base leading-relaxed text-white md:text-lg"
            initial={reduceMotion ? false : { opacity: 0, y }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: dur, delay: reduceMotion ? 0 : 0.22, ease }}
          >
            <EditableCopy
              copyKey="home.hero.body"
              value={c.body}
              editing={editing}
              as="p"
              multiline
              className="max-w-xl font-body text-base leading-relaxed text-white md:text-lg"
            />
          </motion.div>
          <div className="mt-7 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3" role="group" aria-label="Primary actions">
            {(
              [
                { label: c.ctaPrimary, href: defaults.ctas[0].href, variant: "primary" as const, key: "home.hero.ctaPrimary" },
                { label: c.ctaSecondary, href: defaults.ctas[1].href, variant: "secondary" as const, key: "home.hero.ctaSecondary" },
              ] as const
            ).map((cta, i) => {
              const href = cta.href;
              const isPrimary = cta.variant === "primary";
              return (
                <motion.div
                  key={cta.key}
                  className="sm:inline-flex"
                  initial={reduceMotion ? false : { opacity: 0, y }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: dur,
                    delay: reduceMotion ? 0 : 0.28 + i * 0.05,
                    ease,
                  }}
                >
                  {editing ? (
                    <div className="flex w-full flex-col gap-1 sm:w-auto">
                      <EditableCopy
                        copyKey={cta.key}
                        value={cta.label}
                        editing={editing}
                        as="span"
                        className="font-body text-sm text-white"
                      />
                      <Link
                        href={href}
                        className={cn(
                          "w-full sm:w-auto",
                          isPrimary ? trustFunnelCtaPrimary : trustFunnelCtaOutlineOnDark,
                        )}
                      >
                        {cta.label}
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={href}
                      className={cn(
                        "w-full sm:w-auto",
                        isPrimary ? trustFunnelCtaPrimary : trustFunnelCtaOutlineOnDark,
                      )}
                    >
                      {cta.label}
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </ContentContainer>
    </section>
  );
}
