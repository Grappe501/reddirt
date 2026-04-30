"use client";

import { useEffect, useState } from "react";

/**
 * Thin reading progress bar (top of viewport). motion-safe: softens animation when requested.
 */
export function BiographyReaderProgress() {
  const [p, setP] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      const st = el.scrollTop;
      const sh = el.scrollHeight - el.clientHeight;
      setP(sh > 0 ? Math.min(100, Math.max(0, (st / sh) * 100)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-1 bg-kelly-navy/10 motion-safe:transition-[opacity] duration-150"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p)}
      aria-label="Reading progress"
    >
      <div
        className="h-full bg-kelly-gold/90 motion-safe:transition-[width] duration-150 ease-out"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}
