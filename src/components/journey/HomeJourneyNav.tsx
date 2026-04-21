"use client";

import { useEffect, useRef } from "react";
import { useJourney } from "@/components/journey/journey-context";
import { cn } from "@/lib/utils";

export function HomeJourneyNavDesktop() {
  const { beats, activeBeatId, setActiveBeatId, scrollToBeat } = useJourney();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = beats
      .map((b) => document.querySelector<HTMLElement>(`[data-journey-beat="${b.id}"]`))
      .filter(Boolean) as HTMLElement[];
    if (els.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target instanceof HTMLElement) {
          const id = top.target.getAttribute("data-journey-beat") ?? top.target.id;
          if (id) setActiveBeatId(id);
        }
      },
      { rootMargin: "-18% 0px -52% 0px", threshold: [0, 0.08, 0.2, 0.45] },
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [beats, setActiveBeatId]);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 96) setActiveBeatId("beat-arrival");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [setActiveBeatId]);

  return (
    <nav
      ref={navRef}
      className="sticky top-28 hidden max-h-[calc(100vh-8rem)] w-[13.5rem] shrink-0 flex-col gap-1 self-start overflow-y-auto pb-12 lg:flex xl:w-[15rem]"
      aria-label="Page journey"
    >
      <p className="mb-3 font-body text-[10px] font-bold uppercase tracking-[0.2em] text-civic-slate/55">Your path</p>
      {beats.map((b) => {
        const active = activeBeatId === b.id;
        return (
          <button
            key={b.id}
            type="button"
            onClick={() => scrollToBeat(b.id)}
            className={cn(
              "rounded-lg border px-3 py-2.5 text-left transition",
              active
                ? "border-civic-gold/50 bg-civic-midnight text-civic-mist shadow-md"
                : "border-transparent bg-transparent text-civic-ink hover:border-civic-ink/10 hover:bg-civic-fog/60",
            )}
          >
            <span className="block font-body text-[11px] font-bold uppercase tracking-wider text-civic-gold/90">
              {b.navShort}
            </span>
            <span className="mt-0.5 block font-body text-sm font-semibold leading-snug">{b.navLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}

export function HomeJourneyNavMobile() {
  const { beats, activeBeatId, scrollToBeat } = useJourney();

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-civic-ink/10 bg-cream-canvas/95 px-2 py-2 backdrop-blur-md lg:hidden"
      role="navigation"
      aria-label="Journey shortcuts"
    >
      <div className="flex gap-1 overflow-x-auto pb-safe">
        {beats.map((b) => {
          const active = activeBeatId === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => scrollToBeat(b.id)}
              className={cn(
                "flex-shrink-0 rounded-full px-3 py-2 font-body text-xs font-semibold transition",
                active ? "bg-civic-midnight text-civic-mist" : "bg-deep-soil/[0.06] text-deep-soil",
              )}
            >
              {b.navShort}
            </button>
          );
        })}
      </div>
    </div>
  );
}
