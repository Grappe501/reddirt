"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { JourneyBeat } from "@/content/home/journey";

type JourneyContextValue = {
  beats: readonly JourneyBeat[];
  activeBeatId: string | null;
  setActiveBeatId: (id: string | null) => void;
  scrollToBeat: (beatId: string) => void;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

type JourneyProviderProps = {
  children: ReactNode;
  /** Beats whose `data-journey-beat` nodes exist on this page (scroll spy + guide). */
  beats: readonly JourneyBeat[];
};

export function JourneyProvider({ children, beats }: JourneyProviderProps) {
  const landing = beats.some((b) => b.id === "beat-arrival");
  const [activeBeatId, setActiveBeatId] = useState<string | null>(
    landing ? "beat-arrival" : beats[0]?.id ?? null,
  );

  const scrollToBeat = useCallback((beatId: string) => {
    const el = document.getElementById(beatId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

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
  }, [beats]);

  useEffect(() => {
    if (!landing) return;
    const onScroll = () => {
      if (window.scrollY < 96) setActiveBeatId("beat-arrival");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [landing]);

  const value = useMemo(
    () => ({
      beats,
      activeBeatId,
      setActiveBeatId,
      scrollToBeat,
    }),
    [beats, activeBeatId, scrollToBeat],
  );

  return <JourneyContext.Provider value={value}>{children}</JourneyContext.Provider>;
}

export function useJourney() {
  const ctx = useContext(JourneyContext);
  if (!ctx) {
    throw new Error("useJourney must be used within JourneyProvider");
  }
  return ctx;
}
