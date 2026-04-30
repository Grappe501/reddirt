"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { motion, useReducedMotion } from "framer-motion";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { siteConfig } from "@/config/site";

const STORAGE_KEY = "kelly_sos_home_donate_floating_dismissed";
const OPEN_DELAY_MS = 1600;

/**
 * Homepage-only full-viewport donate prompt: softened backdrop, delayed entry, session dismissal.
 * Donate stays primary; secondary control is explicit low-shame exit (copy Steve-approved).
 */
export function HomeDonateFloatingGate() {
  const titleId = useId();
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  /** mounted in DOM (portal) — stays true through exit fade */
  const [portalActive, setPortalActive] = useState(false);
  /** visible opacity */
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        return;
      }
    } catch {
      /* ignore */
    }
    const tOpen = window.setTimeout(() => {
      setPortalActive(true);
      requestAnimationFrame(() => setOpen(true));
    }, OPEN_DELAY_MS);
    return () => window.clearTimeout(tOpen);
  }, []);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
    window.setTimeout(() => setPortalActive(false), reduceMotion ? 80 : 360);
  }, [reduceMotion]);

  useEffect(() => {
    if (!portalActive || !open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [portalActive, open, dismiss]);

  if (!mounted || !portalActive) return null;

  const donateExternal = /^https?:\/\//i.test(siteConfig.donateHref.trim());

  const fadeMs = reduceMotion ? 0.12 : 0.36;

  const node = (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      initial={false}
      animate={{ opacity: open ? 1 : 0 }}
      transition={{ duration: fadeMs, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain bg-kelly-navy/88 px-4 py-10 backdrop-blur-sm"
    >
      <h2 id={titleId} className="sr-only">
        Support the campaign — donate
      </h2>
      <button
        type="button"
        onClick={dismiss}
        className="fixed right-3 top-3 z-[101] flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-kelly-navy/75 text-xl font-light leading-none text-white transition duration-300 hover:border-kelly-gold/50 hover:bg-kelly-blue/75 hover:text-kelly-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold sm:right-4 sm:top-4"
        aria-label="Close and continue to the site"
      >
        ×
      </button>

      <div className="flex w-full max-w-md flex-col items-center">
        <div className="relative aspect-square w-full max-w-[min(100%,18.5rem)] overflow-hidden rounded-full border-2 border-kelly-gold/40 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:max-w-[20rem]">
          <Image
            src={brandMediaFromLegacySite.kellyPortrait}
            alt={brandMediaFromLegacySite.kellyPortraitAlt}
            width={2000}
            height={1125}
            className="h-full w-full object-cover object-[50%_22%]"
            priority
            unoptimized
          />
        </div>

        <div className="mt-10 w-full max-w-sm">
          <Link
            href={siteConfig.donateHref}
            {...(donateExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="flex min-h-[52px] w-full items-center justify-center rounded-btn bg-kelly-gold px-6 py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em] text-kelly-navy shadow-lg transition duration-300 hover:bg-kelly-gold-soft hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
          >
            Donate
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="mt-4 w-full text-center font-body text-sm font-medium tracking-wide text-white/88 underline decoration-white/35 underline-offset-4 transition duration-300 hover:text-kelly-gold hover:decoration-kelly-gold/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
          >
            Click to Website
          </button>
        </div>
      </div>
    </motion.div>
  );

  return createPortal(node, document.body);
}
