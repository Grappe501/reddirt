"use client";

import { useEffect, useState } from "react";
import { BookOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const SESSION_KEY = "reddirt-self-teach-hint-dismissed";

/**
 * One-time-per-session nudge: explains dotted teaching terms + where to find theme control.
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
        "relative z-10 border-b border-kelly-navy/10 bg-gradient-to-r from-kelly-mist/90 via-kelly-page to-kelly-mist/80 px-[var(--gutter-x)] py-2.5 dark:border-white/10 dark:from-kelly-deep/95 dark:via-kelly-fog/90 dark:to-kelly-deep/95",
        className,
      )}
      role="region"
      aria-label="How to use this site"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-start gap-2.5 sm:items-center">
          <BookOpen
            className="mt-0.5 h-5 w-5 shrink-0 text-kelly-navy dark:text-kelly-gold-soft"
            aria-hidden
          />
          <p className="text-sm leading-snug text-kelly-text dark:text-kelly-fog">
            <strong className="font-semibold text-kelly-navy dark:text-kelly-gold-soft">Self-teaching mode:</strong>{" "}
            <span className="text-kelly-text/90 dark:text-kelly-fog/90">
              Words with a <span className="underline decoration-dotted decoration-kelly-slate/60">dotted underline</span> open a
              plain-English definition on hover or keyboard focus. Use{" "}
              <span className="whitespace-nowrap font-medium text-kelly-navy dark:text-kelly-gold-soft">Theme</span> in the header
              for comfortable reading (defaults to light).
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
          <span className="hidden text-[10px] font-bold uppercase tracking-wider text-kelly-text/50 dark:text-kelly-fog/55 sm:inline">
            Try it
          </span>
          <ThemeToggle variant="panel" layout="full" />
          <button
            type="button"
            onClick={dismiss}
            className="rounded-lg p-2 text-kelly-text/60 transition hover:bg-kelly-text/5 hover:text-kelly-text dark:text-kelly-fog/70 dark:hover:bg-white/5 dark:hover:text-kelly-fog"
            aria-label="Dismiss this tip for the rest of your visit"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
