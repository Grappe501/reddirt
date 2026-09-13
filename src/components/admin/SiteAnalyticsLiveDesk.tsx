"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { refreshSiteTrafficDeskAction } from "@/app/admin/site-analytics-actions";
import { SiteAnalyticsWorkbench } from "@/components/admin/SiteAnalyticsWorkbench";
import type { SiteTrafficSnapshot, TrafficWindowDays } from "@/lib/analytics/site-traffic-aggregate";
import type { SiteTrafficIntelligence } from "@/lib/analytics/site-traffic-intelligence";

const POLL_MS = 10_000;

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

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
    <div>
      <div className="sticky top-0 z-30 mb-4 rounded-card border border-kelly-navy/20 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-body text-sm text-kelly-ink">
            <span
              className={
                paused
                  ? "mr-2 inline-block rounded-full bg-kelly-fog px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-kelly-slate"
                  : "mr-2 inline-block rounded-full bg-emerald-700 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white"
              }
            >
              {paused ? "Paused" : polling ? "Refreshing" : "Live"}
            </span>
            Leave this tab open. It pulls new public hits every 10 seconds.
            <span className="text-kelly-slate">
              {" "}
              · {formatClock(live.fetchedAt)} CT
              {live.snapshot.realtime.active15
                ? ` · ${live.snapshot.realtime.active15} active in the last 15 min`
                : ""}
              {arrivedSinceOpen ? ` · +${arrivedSinceOpen} views since you opened` : ""}
              {justArrived ? ` · +${justArrived} just now` : ""}
            </span>
          </p>
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="rounded-full border border-kelly-navy/20 px-3 py-1 font-body text-xs font-semibold text-kelly-navy hover:bg-kelly-fog"
          >
            {paused ? "Resume live" : "Pause"}
          </button>
        </div>
        {tickError ? <p className="mt-2 font-body text-xs text-amber-800">{tickError}</p> : null}
      </div>
      <SiteAnalyticsWorkbench
        snapshot={live.snapshot}
        intel={live.intel}
        openaiReady={openaiReady}
        readError={live.readError}
        newestEventAt={live.newestEventAt}
      />
    </div>
  );
}
