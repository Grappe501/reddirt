"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { SiteTrafficSnapshot, TrafficWindowDays } from "@/lib/analytics/site-traffic-aggregate";
import { visitorSeed } from "@/lib/analytics/site-traffic-explorer";
import type { SiteTrafficIntelligence } from "@/lib/analytics/site-traffic-intelligence";
import {
  INTENT_COLOR,
  INTENT_LABEL,
  buildFlightTheater,
  isBodyVisible,
  type FlightBody,
  type FlightIntent,
} from "@/lib/analytics/site-traffic-theater";

type FilterId = "all" | "live" | "joining" | "captured";

const WINDOWS: Array<{ days: TrafficWindowDays; label: string }> = [
  { days: 1, label: "24h" },
  { days: 7, label: "7d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
];

const DUST = Array.from({ length: 72 }, (_, index) => {
  const seed = visitorSeed(`dust-${index}`);
  return {
    x: seed % 1000,
    y: (Math.floor(seed / 1000) % 720),
    r: 0.35 + (seed % 12) / 14,
    o: 0.18 + (seed % 20) / 80,
  };
});

function formatClock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    timeZone: "America/Chicago",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMinutes(n: number): string {
  if (n <= 0) return "a breath";
  if (n < 1) return `${Math.max(1, Math.round(n * 60))}s`;
  const minutes = Math.floor(n);
  const seconds = Math.round((n - minutes) * 60);
  return seconds ? `${minutes}m ${seconds}s` : `${minutes}m`;
}

function radarPoints(counts: Array<{ intent: FlightIntent; count: number }>): string {
  const max = Math.max(1, ...counts.map((row) => row.count));
  const cx = 90;
  const cy = 90;
  return counts
    .map((row, index) => {
      const angle = (Math.PI * 2 * index) / counts.length - Math.PI / 2;
      const radius = 18 + (row.count / max) * 58;
      return `${(cx + Math.cos(angle) * radius).toFixed(1)},${(cy + Math.sin(angle) * radius).toFixed(1)}`;
    })
    .join(" ");
}

export function SiteAnalyticsFlightDeck({
  snapshot,
  intel,
  paused,
  polling,
  fetchedAt,
  arrivedSinceOpen,
  justArrived,
  onTogglePause,
  openaiReady,
  readError,
  newestEventAt,
}: {
  snapshot: SiteTrafficSnapshot;
  intel: SiteTrafficIntelligence;
  paused: boolean;
  polling: boolean;
  fetchedAt: string;
  arrivedSinceOpen: number;
  justArrived: number;
  onTogglePause: () => void;
  openaiReady: boolean;
  readError?: string | null;
  newestEventAt?: string | null;
}) {
  const theater = useMemo(() => buildFlightTheater(snapshot, intel), [snapshot, intel]);
  const spanStart = Date.parse(theater.spanStart);
  const spanEnd = Math.max(Date.parse(theater.spanEnd), Date.now());
  const safeStart = Number.isFinite(spanStart) ? spanStart : Date.now() - 60 * 60 * 1000;
  const safeEnd = Number.isFinite(spanEnd) && spanEnd > safeStart ? spanEnd : safeStart + 60 * 60 * 1000;

  const [filter, setFilter] = useState<FilterId>("all");
  const [locked, setLocked] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [cursor, setCursor] = useState(safeEnd);

  useEffect(() => {
    setCursor(safeEnd);
  }, [safeEnd]);

  useEffect(() => {
    if (!playing) return undefined;
    const id = window.setInterval(() => {
      setCursor((value) => {
        const next = value + Math.max(30_000, (safeEnd - safeStart) / 80);
        return next >= safeEnd ? safeStart : next;
      });
    }, 90);
    return () => window.clearInterval(id);
  }, [playing, safeStart, safeEnd]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (event.key === " ") {
        event.preventDefault();
        setPlaying((value) => !value);
      }
      if (event.key === "Escape") setLocked(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const visible = theater.bodies.filter((body) => {
    if (filter === "live" && !body.live) return false;
    if (filter === "joining" && body.intent !== "joining" && !body.formStarted) return false;
    if (filter === "captured" && !body.converted) return false;
    if (playing && !isBodyVisible(body, cursor)) return false;
    return true;
  });

  const lockedBody = theater.bodies.find((body) => body.id === locked) ?? null;
  const hoverBody = theater.bodies.find((body) => body.id === hover) ?? lockedBody;
  const hottest =
    [...theater.bodies].sort((a, b) => {
      if (b.capture !== a.capture) return b.capture - a.capture;
      return Date.parse(b.lastAt) - Date.parse(a.lastAt);
    })[0] ?? null;
  const goCount = theater.readiness.filter((row) => row.go).length;
  const maxHour = Math.max(1, ...snapshot.hours.map((row) => row.hits));

  return (
    <section className="relative overflow-hidden bg-[#040712] text-[#e8edff]">
      <style>{`
        @keyframes fd-pulse { 0% { opacity: .35; transform: scale(.85); } 70% { opacity: 0; transform: scale(2.1); } 100% { opacity: 0; } }
        @keyframes fd-scan { 0% { transform: translateY(-20%); opacity: .08; } 100% { transform: translateY(120%); opacity: 0; } }
        @keyframes fd-glow { 0%,100% { opacity: .45; } 50% { opacity: .9; } }
      `}</style>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(202,145,61,0.12),transparent_38%),radial-gradient(circle_at_78%_20%,rgba(126,196,255,0.1),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 animate-[fd-scan_7s_linear_infinite] bg-gradient-to-b from-white/10 to-transparent" />

      <div className="relative border-b border-white/10 px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.34em] text-[#ca913d]">
              Observatory · not public
            </p>
            <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight md:text-4xl">
              First-party flight deck
            </h1>
            <p className="mt-1 max-w-2xl font-body text-xs text-[#9aa6d4] md:text-sm">
              Every anonymous neighbor is a body. Brightness is attention. Gold is a finished form.
              City is stamped without storing an IP. Names appear only after they convert.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={
                paused
                  ? "rounded-full bg-white/10 px-2.5 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-[#c5cbe0]"
                  : "rounded-full bg-emerald-500/20 px-2.5 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-emerald-300"
              }
            >
              {paused ? "Hold" : polling ? "Sync" : "Live"}
            </span>
            <span className="font-body text-[11px] text-[#8b95b8]">
              {formatClock(fetchedAt)} CT
              {theater.live ? ` · ${theater.live} on station` : ""}
              {arrivedSinceOpen ? ` · +${arrivedSinceOpen} since open` : ""}
              {justArrived ? ` · +${justArrived} just now` : ""}
            </span>
            <button
              type="button"
              onClick={onTogglePause}
              className="rounded-full border border-white/15 px-3 py-1 font-body text-xs font-semibold text-white hover:bg-white/10"
            >
              {paused ? "Resume" : "Pause"}
            </button>
            {WINDOWS.map((window) => (
              <Link
                key={window.days}
                href={`/admin/site-analytics?days=${window.days}`}
                className={
                  snapshot.days === window.days
                    ? "rounded-full bg-white px-2.5 py-1 font-body text-[11px] font-bold text-[#040712]"
                    : "rounded-full border border-white/15 px-2.5 py-1 font-body text-[11px] font-semibold text-[#c5cbe0]"
                }
              >
                {window.label}
              </Link>
            ))}
          </div>
        </div>
        {readError ? (
          <p className="mt-3 rounded-lg border border-red-400/30 bg-red-950/50 px-3 py-2 font-body text-xs text-red-100">
            {readError}
          </p>
        ) : null}
        {!readError && snapshot.pageViews === 0 ? (
          <p className="mt-3 rounded-lg border border-amber-300/20 bg-amber-950/40 px-3 py-2 font-body text-xs text-amber-100">
            {newestEventAt
              ? `Sky is dark in this window. Newest stored public hit: ${formatWhen(newestEventAt)} CT.`
              : "Sky is dark. The recorder is waiting for the first public hit."}
          </p>
        ) : null}
      </div>

      <div className="relative grid gap-0 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="relative min-h-[540px]">
          <svg viewBox="0 0 1000 720" className="h-[68vh] min-h-[540px] w-full" role="img" aria-label="Arkansas visitor constellation">
            {DUST.map((dot, index) => (
              <circle key={index} cx={dot.x} cy={dot.y} r={dot.r} fill="#d7e3ff" opacity={dot.o} />
            ))}
            <path d={theater.outline} fill="rgba(80,120,210,0.09)" stroke="rgba(202,145,61,0.75)" strokeWidth="2.2" />
            <text
              x={theater.hq.x}
              y={theater.hq.y + 92}
              fill="rgba(202,145,61,0.35)"
              fontSize="22"
              fontFamily="Georgia, serif"
              textAnchor="middle"
              letterSpacing="6"
            >
              ARKANSAS
            </text>
            <circle cx={theater.hq.x} cy={theater.hq.y} r="26" fill="none" stroke="rgba(202,145,61,0.2)" />
            <circle cx={theater.hq.x} cy={theater.hq.y} r="7" fill="#ca913d" className="origin-center animate-[fd-glow_2.8s_ease-in-out_infinite]" />
            <text x={theater.hq.x + 12} y={theater.hq.y - 8} fill="#ca913d" fontSize="11" fontFamily="Georgia, serif">
              Little Rock
            </text>
            {theater.cities.filter((city) => city.name !== "Little Rock").map((city) => (
              <g key={city.name}>
                <circle
                  cx={city.x}
                  cy={city.y}
                  r={city.hits > 0 ? 5 + Math.min(10, city.hits) : 2.5}
                  fill={city.hits > 0 ? "rgba(125,211,252,0.16)" : "rgba(125,211,252,0.06)"}
                  stroke="rgba(125,211,252,0.45)"
                />
                <text
                  x={city.x + 10}
                  y={city.y + 4}
                  fill={city.hits > 0 ? "#8ecae6" : "rgba(142,202,230,0.55)"}
                  fontSize="10"
                  fontFamily="ui-sans-serif, system-ui"
                >
                  {city.name}
                </text>
              </g>
            ))}
            {visible
              .filter((body) => body.converted)
              .map((body) => (
                <line
                  key={`${body.id}-tow`}
                  x1={body.x}
                  y1={body.y}
                  x2={theater.hq.x}
                  y2={theater.hq.y}
                  stroke="rgba(240,193,75,0.28)"
                  strokeDasharray="4 6"
                />
              ))}
            {visible.map((body) => (
              <g
                key={body.id}
                className="cursor-pointer"
                onClick={() => setLocked(body.id)}
                onMouseEnter={() => setHover(body.id)}
                onMouseLeave={() => setHover(null)}
              >
                {body.live ? (
                  <circle cx={body.x} cy={body.y} r={body.r + 8} fill={INTENT_COLOR[body.intent]} opacity="0.18" className="animate-[fd-pulse_1.8s_ease-out_infinite]" />
                ) : null}
                <circle
                  cx={body.x}
                  cy={body.y}
                  r={body.r}
                  fill={INTENT_COLOR[body.intent]}
                  stroke={locked === body.id ? "#fff" : "rgba(255,255,255,0.3)"}
                  strokeWidth={locked === body.id ? 2 : 0.6}
                  opacity={body.warm || body.converted ? 1 : 0.55}
                />
              </g>
            ))}
          </svg>

          {hoverBody ? (
            <div className="pointer-events-none absolute bottom-4 left-4 max-w-sm rounded-lg border border-white/15 bg-[#070b18]/90 px-3 py-2 shadow-xl backdrop-blur">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-[#ca913d]">
                {INTENT_LABEL[hoverBody.intent]} · capture {hoverBody.capture}
              </p>
              <p className="mt-1 font-heading text-lg font-bold">{hoverBody.callsign}</p>
              <p className="font-body text-xs text-[#9aa6d4]">
                {hoverBody.city ?? (hoverBody.source || "Direct / unknown")} · {hoverBody.lastPath} · {hoverBody.pageViews} pages
              </p>
            </div>
          ) : null}

          <div className="absolute right-4 top-4 flex flex-wrap justify-end gap-2">
            {(["all", "live", "joining", "captured"] as FilterId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={
                  filter === id
                    ? "rounded-full bg-white px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-[#040712]"
                    : "rounded-full border border-white/20 px-3 py-1 font-body text-[11px] font-bold uppercase tracking-wider text-[#c5cbe0]"
                }
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        <aside className="border-t border-white/10 bg-[#070b16]/80 p-4 xl:border-l xl:border-t-0">
          <div className="grid grid-cols-3 gap-2">
            <Stat label="On station" value={String(theater.live)} hint="last 15 min" />
            <Stat label="Capture mean" value={`${theater.meanCapture}`} hint="attention score" />
            <Stat label="GO lights" value={`${goCount}/6`} hint="launch board" />
          </div>

          <div className="mt-4">
            <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-[#ca913d]">Go / no-go</p>
            <ul className="mt-2 space-y-1.5">
              {theater.readiness.map((row) => (
                <li key={row.id} className="flex items-start gap-2 font-body text-xs">
                  <span className={row.go ? "mt-1 h-2 w-2 rounded-full bg-emerald-400" : "mt-1 h-2 w-2 rounded-full bg-rose-400"} />
                  <span>
                    <span className="font-semibold text-white">{row.label}</span>
                    <span className="text-[#8b95b8]"> · {row.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 grid grid-cols-[180px_minmax(0,1fr)] gap-3">
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-[#ca913d]">Intent radar</p>
              <svg viewBox="0 0 180 180" className="mt-1 w-full">
                <circle cx="90" cy="90" r="76" fill="none" stroke="rgba(255,255,255,0.08)" />
                <circle cx="90" cy="90" r="48" fill="none" stroke="rgba(255,255,255,0.06)" />
                <polygon points={radarPoints(theater.intents)} fill="rgba(202,145,61,0.18)" stroke="#ca913d" strokeWidth="1.2" />
              </svg>
            </div>
            <ul className="space-y-1 pt-5 font-body text-[11px]">
              {theater.intents.map((row) => (
                <li key={row.intent} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: INTENT_COLOR[row.intent] }} />
                    {INTENT_LABEL[row.intent]}
                  </span>
                  <span className="text-[#c5cbe0]">{row.count}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-[#ca913d]">Flight director</p>
              {hottest ? (
                <button
                  type="button"
                  onClick={() => setLocked(hottest.id)}
                  className="font-body text-[11px] font-semibold text-[#7dd3fc] hover:underline"
                >
                  Lock hottest
                </button>
              ) : null}
            </div>
            <ul className="mt-2 max-h-56 space-y-1.5 overflow-auto pr-1">
              {theater.director.map((line, index) => (
                <li key={`${line.code}-${index}`} className="font-body text-[11px] leading-relaxed text-[#c5cbe0]">
                  <span className="mr-2 font-bold tracking-wider text-[#ca913d]">{line.code}</span>
                  {line.text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="relative border-t border-white/10 px-4 py-3 md:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="rounded-full bg-[#ca913d] px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-[#140f05]"
          >
            {playing ? "Halt replay" : "Replay the window"}
          </button>
          <input
            type="range"
            min={safeStart}
            max={safeEnd}
            value={Math.min(safeEnd, Math.max(safeStart, cursor))}
            onChange={(event) => {
              setPlaying(false);
              setCursor(Number(event.target.value));
            }}
            className="min-w-[200px] flex-1 accent-[#ca913d]"
          />
          <span className="font-body text-[11px] text-[#8b95b8]">
            {formatWhen(new Date(cursor).toISOString())} CT · space to play
          </span>
          <span className="font-body text-[11px] text-[#5b6588]">
            Lenses {openaiReady ? "armed" : "off"} · instruments below
          </span>
        </div>
        <svg viewBox="0 0 240 28" className="mt-2 h-7 w-full" aria-hidden>
          <polyline
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="1.4"
            points={snapshot.hours
              .map((row, index) => `${(index / Math.max(1, snapshot.hours.length - 1)) * 240},${26 - (row.hits / maxHour) * 22}`)
              .join(" ")}
          />
        </svg>
      </div>

      {lockedBody ? <LockPanel body={lockedBody} onClose={() => setLocked(null)} /> : null}
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <p className="font-body text-[10px] uppercase tracking-[0.18em] text-[#8b95b8]">{label}</p>
      <p className="font-heading text-2xl font-bold">{value}</p>
      <p className="font-body text-[10px] text-[#6d7696]">{hint}</p>
    </div>
  );
}

function LockPanel({ body, onClose }: { body: FlightBody; onClose: () => void }) {
  return (
    <div className="border-t border-[#ca913d]/40 bg-[#0b1020] px-4 py-4 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-[0.28em] text-[#ca913d]">
            Lock-on · {INTENT_LABEL[body.intent]} · capture {body.capture}
          </p>
          <h2 className="mt-1 font-heading text-2xl font-bold">{body.callsign}</h2>
          <p className="mt-1 font-body text-sm text-[#9aa6d4]">
            {body.city ?? (body.source || "Direct / unknown")} · {body.pageViews} pages · {formatMinutes(body.minutes)} · last {body.lastPath}
          </p>
        </div>
        <div className="flex gap-2">
          {body.intakeHref ? (
            <Link
              href={body.intakeHref}
              className="rounded-full bg-[#ca913d] px-3 py-1 font-body text-xs font-bold uppercase tracking-wider text-[#140f05]"
            >
              Open intake
            </Link>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-3 py-1 font-body text-xs font-semibold text-white"
          >
            Release
          </button>
        </div>
      </div>
      {body.tours.length ? (
        <p className="mt-3 font-body text-xs text-[#c5cbe0]">{body.tours[body.tours.length - 1]}</p>
      ) : null}
      {body.timeline.length ? (
        <ul className="mt-3 grid gap-1 sm:grid-cols-2">
          {body.timeline.slice(-8).map((event, index) => (
            <li key={`${event.at}-${index}`} className="font-body text-[11px] text-[#8b95b8]">
              {formatClock(event.at)} · {event.name} · {event.path}
              {event.detail ? ` · ${event.detail}` : ""}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
