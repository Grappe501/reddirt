"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { JourneyBeat } from "@/content/home/journey";
import { HOME_JOURNEY_BEATS } from "@/content/home/journey";

type JourneyContextValue = {
  beats: readonly JourneyBeat[];
  activeBeatId: string | null;
  setActiveBeatId: (id: string | null) => void;
  scrollToBeat: (beatId: string) => void;
};

const JourneyContext = createContext<JourneyContextValue | null>(null);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const [activeBeatId, setActiveBeatId] = useState<string | null>("beat-arrival");

  const scrollToBeat = useCallback((beatId: string) => {
    const el = document.getElementById(beatId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const value = useMemo(
    () => ({
      beats: HOME_JOURNEY_BEATS,
      activeBeatId,
      setActiveBeatId,
      scrollToBeat,
    }),
    [activeBeatId, scrollToBeat],
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
