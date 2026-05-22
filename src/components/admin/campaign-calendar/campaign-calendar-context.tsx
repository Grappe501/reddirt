"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { CalendarSurfaceRow } from "@/lib/campaign-events/load-campaign-calendar-events";

export type CampaignCalendarContextValue = {
  rows: CalendarSurfaceRow[];
  electionDayYmd: string;
  nowMs: number;
  reviewRecordId: string | null;
  setReviewRecordId: (id: string | null) => void;
  focusYmd: string;
  setFocusYmd: (ymd: string) => void;
};

const CampaignCalendarContext = createContext<CampaignCalendarContextValue | null>(null);

export function CampaignCalendarProvider({
  rows,
  electionDayYmd,
  nowMs,
  children,
}: {
  rows: CalendarSurfaceRow[];
  electionDayYmd: string;
  nowMs: number;
  children: ReactNode;
}) {
  const defaultFocus = rows[0]?.dateYmd ?? new Date(nowMs).toISOString().slice(0, 10);
  const [reviewRecordId, setReviewRecordId] = useState<string | null>(null);
  const [focusYmd, setFocusYmd] = useState(defaultFocus);

  const value = useMemo(
    () => ({ rows, electionDayYmd, nowMs, reviewRecordId, setReviewRecordId, focusYmd, setFocusYmd }),
    [rows, electionDayYmd, nowMs, reviewRecordId, focusYmd],
  );

  return <CampaignCalendarContext.Provider value={value}>{children}</CampaignCalendarContext.Provider>;
}

export function useCampaignCalendar() {
  const ctx = useContext(CampaignCalendarContext);
  if (!ctx) throw new Error("useCampaignCalendar must be used within CampaignCalendarProvider");
  return ctx;
}
