"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "reddirt_home_donate_floating_dismissed";

/**
 * Homepage-only full-viewport donate prompt: opaque backdrop, centered square portrait,
 * Donate CTA or explicit close (X). Dismissal is remembered for the browser session.
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
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overscroll-contain bg-civic-midnight/97 px-4 py-10 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={cn(
          "relative w-full max-w-[min(100%,20rem)] rounded-3xl border border-white/15 bg-civic-deep/95 p-5 shadow-[0_32px_80px_rgba(0,0,0,0.55)]",
          "sm:max-w-sm sm:p-6",
        )}
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-civic-midnight/80 text-xl font-light leading-none text-white transition hover:border-sunlight-gold/50 hover:bg-civic-blue/80 hover:text-sunlight-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunlight-gold"
          aria-label="Close and continue to the site"
        >
          ×
        </button>

        <div className="pt-2 text-center">
          <p id={titleId} className="font-heading text-lg font-bold text-white sm:text-xl">
            Chip in to fuel the campaign
          </p>
          <p className="mt-2 font-body text-sm leading-relaxed text-white/85">
            Fair elections for Arkansas take resources. If you’re able, help us reach every county.
          </p>
        </div>

        <div className="relative mx-auto mt-6 aspect-square w-[min(100%,14rem)] overflow-hidden rounded-2xl border-2 border-sunlight-gold/40 shadow-lg sm:w-[15.5rem]">
          <Image
            src={brandMediaFromLegacySite.kellyPortrait}
            alt={brandMediaFromLegacySite.kellyPortraitAlt}
            width={480}
            height={480}
            className="h-full w-full object-cover"
            priority
            unoptimized
          />
        </div>

        <div className="mt-8">
          <Link
            href={siteConfig.donateHref}
            {...(donateExternal
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="flex min-h-[52px] w-full items-center justify-center rounded-btn bg-civic-gold px-6 py-3.5 text-center text-sm font-bold uppercase tracking-[0.12em] text-civic-midnight shadow-lg transition hover:bg-civic-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-civic-gold"
          >
            Donate
          </Link>
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
