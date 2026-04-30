"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Thin reading progress bar. Width transitions respect prefers-reduced-motion.
 */
export function BiographyReaderProgress() {
  const [p, setP] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onMq = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onMq);
    return () => mq.removeEventListener("change", onMq);
  }, []);

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
      className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-1 bg-kelly-navy/10"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p)}
      aria-label="Reading progress through this page"
    >
      <div
        className={cn(
          "h-full bg-kelly-gold/90",
          !reduceMotion && "transition-[width] duration-150 ease-out",
        )}
        style={{ width: `${p}%` }}
      />
    </div>
  );
}
