"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { refreshSiteTrafficDeskAction } from "@/app/admin/site-analytics-actions";
import { SiteAnalyticsFlightDeck } from "@/components/admin/SiteAnalyticsFlightDeck";
import { SiteAnalyticsWorkbench } from "@/components/admin/SiteAnalyticsWorkbench";
import type { SiteTrafficSnapshot, TrafficWindowDays } from "@/lib/analytics/site-traffic-aggregate";
import type { SiteTrafficIntelligence } from "@/lib/analytics/site-traffic-intelligence";

const POLL_MS = 10_000;

export function SiteAnalyticsLiveDesk({
  snapshot,
  intel,
  openaiReady,
  readError,
  newestEventAt,
}: {
  snapshot: SiteTrafficSnapshot;
  intel: SiteTrafficIntelligence;
  openaiReady: boolean;
  readError?: string | null;
  newestEventAt?: string | null;
}) {
  const days = snapshot.days as TrafficWindowDays;
  const openedViews = useRef(snapshot.pageViews);
  const [live, setLive] = useState({
    snapshot,
    intel,
    readError: readError ?? null,
    newestEventAt: newestEventAt ?? null,
    fetchedAt: new Date().toISOString(),
  });
  const [paused, setPaused] = useState(false);
  const [tickError, setTickError] = useState<string | null>(null);
  const [justArrived, setJustArrived] = useState(0);
  const [polling, setPolling] = useState(false);

  const pull = useCallback(async () => {
    if (document.visibilityState !== "visible") return;
    setPolling(true);
    try {
      const next = await refreshSiteTrafficDeskAction(days);
      setLive((prev) => {
        const gained = Math.max(0, next.snapshot.pageViews - prev.snapshot.pageViews);
        if (gained > 0) setJustArrived(gained);
        return {
          snapshot: next.snapshot,
          intel: next.intel,
          readError: next.readError,
          newestEventAt: next.newestEventAt,
          fetchedAt: next.fetchedAt,
        };
      });
      setTickError(null);
    } catch {
      setTickError("Live refresh missed a beat. The desk is still showing the last good pull.");
    } finally {
      setPolling(false);
    }
  }, [days]);

  useEffect(() => {
    if (paused) return undefined;
    const id = window.setInterval(() => {
      void pull();
    }, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void pull();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [paused, pull]);

  useEffect(() => {
    if (justArrived <= 0) return undefined;
    const id = window.setTimeout(() => setJustArrived(0), 8000);
    return () => window.clearTimeout(id);
  }, [justArrived]);

  const arrivedSinceOpen = Math.max(0, live.snapshot.pageViews - openedViews.current);

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8">
      <SiteAnalyticsFlightDeck
        snapshot={live.snapshot}
        intel={live.intel}
        paused={paused}
        polling={polling}
        fetchedAt={live.fetchedAt}
        arrivedSinceOpen={arrivedSinceOpen}
        justArrived={justArrived}
        onTogglePause={() => setPaused((value) => !value)}
        openaiReady={openaiReady}
        readError={live.readError}
        newestEventAt={live.newestEventAt}
      />
      {tickError ? (
        <p className="bg-[#040712] px-6 pb-3 font-body text-xs text-amber-200">{tickError}</p>
      ) : null}
      <div className="bg-kelly-fog px-4 py-8 sm:px-6 lg:px-8">
        <SiteAnalyticsWorkbench
          snapshot={live.snapshot}
          intel={live.intel}
          openaiReady={openaiReady}
          readError={live.readError}
          newestEventAt={live.newestEventAt}
        />
      </div>
    </div>
  );
}
