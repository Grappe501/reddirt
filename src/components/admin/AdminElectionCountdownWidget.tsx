"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { ELECTION_DAY_2026 } from "@/lib/campaign-dates";

const STORAGE_KEY = "reddirt-admin-election-countdown-v1";

type Stored = {
  x: number;
  y: number;
  minimized: boolean;
};

const DEFAULT: Stored = { x: 16, y: 72, minimized: false };

function loadStored(): Stored {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

function saveStored(s: Stored) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

type Pos = { x: number; y: number };

export function AdminElectionCountdownWidget() {
  const pathname = usePathname() ?? "";
  const hideOnIntelligence = pathname.startsWith("/admin/intelligence");
  const [pos, setPos] = useState<Pos>({ x: DEFAULT.x, y: DEFAULT.y });
  const [minimized, setMinimized] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    const s = loadStored();
    setPos({ x: s.x, y: s.y });
    setMinimized(s.minimized);
  }, []);

  const persist = useCallback((next: Stored) => {
    setPos({ x: next.x, y: next.y });
    setMinimized(next.minimized);
    saveStored(next);
  }, []);

  const daysToElection = differenceInCalendarDays(parseISO(ELECTION_DAY_2026), new Date());

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const x = Math.max(8, Math.min(window.innerWidth - 120, dragRef.current.origX + dx));
    const y = Math.max(8, Math.min(window.innerHeight - 48, dragRef.current.origY + dy));
    setPos({ x, y });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    const x = Math.max(8, Math.min(window.innerWidth - 120, dragRef.current.origX + dx));
    const y = Math.max(8, Math.min(window.innerHeight - 48, dragRef.current.origY + dy));
    dragRef.current = null;
    setDragging(false);
    persist({ x, y, minimized });
  };

  const daysLabel =
    daysToElection < 0
      ? "Past"
      : daysToElection === 0
        ? "Today"
        : `${daysToElection} day${daysToElection === 1 ? "" : "s"}`;

  if (hideOnIntelligence) {
    return null;
  }

  return (
    <div
      role="status"
      aria-label="Election Day countdown"
      className={`fixed z-[90] select-none font-body shadow-lg ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{ left: pos.x, top: pos.y }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className="rounded-2xl border border-kelly-navy/25 bg-kelly-page/95 backdrop-blur-sm">
        <div className="flex items-center gap-1 border-b border-kelly-text/10 px-2 py-1">
          <span className="flex-1 text-[9px] font-bold uppercase tracking-wider text-kelly-slate">Election countdown</span>
          <button
            type="button"
            className="rounded px-1.5 text-[10px] font-bold text-kelly-muted hover:bg-kelly-wash"
            onClick={() => persist({ ...pos, minimized: !minimized })}
            aria-label={minimized ? "Expand countdown" : "Minimize countdown"}
          >
            {minimized ? "+" : "−"}
          </button>
        </div>
        {!minimized ? (
          <div className="px-3 py-2">
            <p className="font-heading text-lg font-bold text-kelly-navy">{daysLabel}</p>
            <p className="text-[10px] text-kelly-muted">Nov. 3, 2026 · drag to move</p>
          </div>
        ) : (
          <p className="px-2 py-1.5 font-heading text-sm font-bold text-kelly-navy">{daysLabel}</p>
        )}
      </div>
    </div>
  );
}
