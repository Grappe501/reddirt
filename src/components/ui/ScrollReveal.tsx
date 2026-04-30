"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  /** Render as `li` when nesting in lists (valid HTML). */
  as?: "div" | "li";
  children: ReactNode;
  /** Delay (ms) after intersection before transitioning in */
  delay?: number;
  className?: string;
  /** Slight upward motion in px when motion is allowed */
  yOffset?: number;
};

/**
 * Viewport-triggered fade + subtle rise. SSR-safe: no hiding until mounted + prefs known.
 */
export function ScrollReveal({ as: Comp = "div", children, delay = 0, className, yOffset = 12 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | HTMLLIElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [intersecting, setIntersecting] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (!mounted || reduceMotion) {
      if (mounted && reduceMotion) setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setIntersecting(true);
          obs.disconnect();
        }
      },
      { rootMargin: "-40px 0px -10% 0px", threshold: 0.06 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [mounted, reduceMotion]);

  useEffect(() => {
    if (!intersecting || reduceMotion) return;
    if (delay <= 0) {
      setRevealed(true);
      return;
    }
    const t = window.setTimeout(() => setRevealed(true), delay);
    return () => window.clearTimeout(t);
  }, [intersecting, delay, reduceMotion]);

  const motionOk = mounted && !reduceMotion;
  const show = !motionOk || revealed;

  return (
    <Comp
      ref={ref as never}
      className={cn(className)}
      style={
        motionOk
          ? {
              opacity: show ? 1 : 0,
              transform: show ? "translateY(0)" : `translateY(${yOffset}px)`,
              transition: "opacity 450ms ease-out, transform 450ms ease-out",
            }
          : undefined
      }
    >
      {children}
    </Comp>
  );
}
