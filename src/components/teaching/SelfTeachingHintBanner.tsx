"use client";

import { useEffect, useState } from "react";
import { BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SESSION_KEY = "reddirt-self-teach-hint-dismissed";

/**
 * One-time-per-session nudge: explains dotted teaching terms.
 */
export function SelfTeachingHintBanner({ className }: { className?: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
    } catch {
      /* ignore */
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  function dismiss() {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  return (
    <div
      className={cn(
        "relative z-10 border-b border-kelly-navy/10 bg-gradient-to-r from-kelly-mist/90 via-kelly-page to-kelly-mist/80 px-[var(--gutter-x)] py-2.5",
        className,
      )}
      role="region"
      aria-label="How to use this site"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-2.5 sm:items-center">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-kelly-navy" aria-hidden />
          <p className="text-sm leading-snug text-kelly-text">
            <strong className="font-semibold text-kelly-navy">Self-teaching mode:</strong>{" "}
            <span className="text-kelly-text/90">
              Words with a <span className="underline decoration-dotted decoration-kelly-slate/60">dotted underline</span> open a
              plain-English definition on hover or keyboard focus.
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end">
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-2 text-kelly-text/60 transition hover:bg-kelly-text/5 hover:text-kelly-text"
            aria-label="Dismiss this tip for the rest of your visit"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
