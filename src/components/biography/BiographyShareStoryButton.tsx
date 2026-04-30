"use client";

import { useCallback, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Page URL to share (default: current origin + /biography) */
  shareUrl?: string;
  shareTitle?: string;
  shareText?: string;
  children: ReactNode;
};

export function BiographyShareStoryButton({
  className,
  shareUrl,
  shareTitle = "The Road That Brought Her Here",
  shareText = "Kelly Grappe’s story — read at your own pace.",
  children,
}: Props) {
  const [copied, setCopied] = useState(false);

  const url = shareUrl ?? (typeof window !== "undefined" ? `${window.location.origin}/biography` : "/biography");

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
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      /* ignore */
    }
  }, [shareTitle, shareText, url]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-btn border-2 border-kelly-navy/25 bg-transparent px-6 py-3 text-sm font-bold uppercase tracking-wider text-kelly-navy transition hover:border-kelly-gold/60 hover:bg-kelly-wash/50 focus-visible:outline focus-visible:ring-2 focus-visible:ring-kelly-gold/45",
        className,
      )}
    >
      {copied ? "Link copied" : children}
    </button>
  );
}
