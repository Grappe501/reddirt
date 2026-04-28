"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { siteConfig } from "@/config/site";

const STORAGE_KEY = "kelly_sos_home_donate_floating_dismissed";

/**
 * Homepage-only full-viewport donate prompt: opaque backdrop, centered Kelly portrait,
 * Donate CTA and explicit close (X). Dismissal is remembered for the browser session.
 */
export function HomeDonateFloatingGate() {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      setVisible(!sessionStorage.getItem(STORAGE_KEY));
    } catch {
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  const continueId = useId();

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, dismiss]);

  if (!mounted || !visible) return null;

  const donateExternal = /^https?:\/\//i.test(siteConfig.donateHref.trim());

  const node = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain bg-kelly-navy/92 px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 backdrop-blur-md sm:px-5 sm:pb-12 sm:pt-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={continueId}
    >
      <button
        type="button"
        onClick={dismiss}
        className="fixed right-3 top-3 z-[101] flex h-11 w-11 items-center justify-center rounded-full border-2 border-kelly-gold bg-kelly-navy text-2xl font-semibold leading-none text-kelly-gold shadow-[0_4px_24px_rgba(0,0,0,0.45)] ring-2 ring-kelly-gold/35 ring-offset-2 ring-offset-kelly-navy transition hover:bg-kelly-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold sm:right-4 sm:top-4"
        aria-label="Close and continue to the site"
      >
        ×
      </button>

      <div className="flex w-full max-w-md flex-col items-center">
        <div className="mb-2 text-center">
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.24em] text-kelly-gold">Kelly Grappe · Arkansas Secretary of State</p>
          <h2 id={titleId} className="mt-3 font-heading text-xl font-bold leading-tight text-white sm:text-2xl">
            Support the campaign
          </h2>
          <p id={continueId} className="mt-3 max-w-sm font-body text-sm leading-snug text-white/88">
            Every gift helps. Prefer to look around first? Continue—Kelly’s story, priorities, and ways to volunteer are one tap away.
          </p>
        </div>

        <div className="relative aspect-square w-full max-w-[min(100%,18.5rem)] overflow-hidden rounded-full border-2 border-kelly-gold/40 shadow-[0_24px_80px_rgba(0,0,0,0.5)] sm:max-w-[20rem]">
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

        <div className="mt-10 w-full max-w-sm space-y-3">
          <Link
            href={siteConfig.donateHref}
            {...(donateExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="flex min-h-[52px] w-full items-center justify-center rounded-btn bg-kelly-gold px-6 py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em] text-kelly-navy shadow-lg transition hover:bg-kelly-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
          >
            Donate
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="flex min-h-[48px] w-full items-center justify-center rounded-btn border-2 border-white/40 bg-transparent px-6 py-3 text-center text-sm font-semibold text-white underline decoration-white/60 underline-offset-4 transition hover:border-kelly-gold/70 hover:text-kelly-gold hover:decoration-kelly-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-gold"
          >
            Continue to website
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
