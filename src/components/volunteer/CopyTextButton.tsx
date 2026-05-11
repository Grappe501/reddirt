"use client";

import { useState } from "react";

export function CopyTextButton({
  text,
  label,
  copiedLabel = "Copied",
  className = "",
}: {
  text: string;
  label: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch {
      setDone(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`rounded-lg border border-kelly-navy/25 bg-kelly-navy/[0.06] px-3 py-1.5 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-navy/10 ${className}`}
    >
      {done ? copiedLabel : label}
    </button>
  );
}
