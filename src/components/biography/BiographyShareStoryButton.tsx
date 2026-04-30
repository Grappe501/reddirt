"use client";

import { useCallback, useEffect, useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "onDark";

type Props = {
  className?: string;
  variant?: Variant;
  /** Page URL to share (default: current origin + /biography) */
  shareUrl?: string;
  shareTitle?: string;
  shareText?: string;
  children: ReactNode;
};

const variantClass: Record<Variant, string> = {
  default: cn(
    "border-2 border-kelly-navy/25 bg-transparent text-kelly-navy",
    "hover:border-kelly-gold/60 hover:bg-kelly-wash/50",
  ),
  onDark: cn("border-2 border-white/35 bg-white/[0.06] text-white", "hover:border-kelly-gold/55 hover:bg-white/10"),
};

export function BiographyShareStoryButton({
  className,
  variant = "default",
  shareUrl,
  shareTitle = "The Road That Brought Her Here",
  shareText = "Kelly Grappe’s story — read at your own pace.",
  children,
}: Props) {
  const [copied, setCopied] = useState(false);
  const statusId = useId();

  const url = shareUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/biography` : "/biography");

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);

  const onClick = useCallback(async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url });
        return;
      } catch {
        /* user cancelled or share failed */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      /* ignore */
    }
  }, [shareTitle, shareText, url]);

  return (
    <>
      <span id={statusId} className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {copied ? "Biography link copied to clipboard." : ""}
      </span>
      <button
        type="button"
        onClick={onClick}
        aria-describedby={copied ? statusId : undefined}
        className={cn(
          "inline-flex min-h-12 w-full items-center justify-center rounded-btn px-6 py-3 text-sm font-bold uppercase tracking-wider transition",
          "focus-visible:outline focus-visible:ring-2 focus-visible:ring-offset-2",
          variant === "default" && "focus-visible:ring-kelly-gold/50 focus-visible:ring-offset-white",
          variant === "onDark" && "focus-visible:ring-kelly-gold/60 focus-visible:ring-offset-kelly-navy",
          variantClass[variant],
          className,
        )}
      >
        {copied ? "Link copied — share it when you’re ready" : children}
      </button>
    </>
  );
}
