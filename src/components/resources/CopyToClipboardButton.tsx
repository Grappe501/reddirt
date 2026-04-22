"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <path d="M8 10h8M8 14h4" />
    </svg>
  );
}

type CopyToClipboardButtonProps = {
  text: string;
  label: string;
  className?: string;
};

/**
 * Small icon control for copy-paste blocks (resource scripts, etc.).
 */
export function CopyToClipboardButton({ text, label, className }: CopyToClipboardButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "err">("idle");

  const onCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("err");
      setTimeout(() => setState("idle"), 2500);
    }
  }, [text]);

  return (
    <button
      type="button"
      onClick={onCopy}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-deep-soil/15 bg-cream-canvas text-deep-soil/70 transition hover:border-red-dirt/35 hover:text-red-dirt",
        className,
      )}
      aria-label={label}
    >
      <ClipboardIcon className="h-4 w-4" />
      <span className="sr-only">
        {state === "copied" ? "Copied" : state === "err" ? "Copy failed" : label}
      </span>
    </button>
  );
}
