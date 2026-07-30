"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import type { EventItem } from "@/content/types";
import { formatEventWhen } from "@/lib/format/eventDisplay";

import "leaflet/dist/leaflet.css";

const ARK_CENTER: LatLngExpression = [34.75, -92.35];
const DEFAULT_ZOOM = 6.7;

/** Single public pin color — Phase 2 (no HQ/Movement/fair palette). */
const PUBLIC_EVENT_PIN = "#000066";
const PIN_Z = 200;

export type MapPin = {
  slug: string;
  title: string;
  type: string;
  position: LatLngExpression;
  detailHref: string;
  whenLine: string;
  summary: string;
};

/** Exact (or author-set) pins only — Prefer Unknown: region centroids stay list-only. */
function isPublicMapPinEligible(e: EventItem): boolean {
  if (e.status !== "upcoming" || !e.mapCoordinates) return false;
  if (e.mapPinQuality === "region") return false;
  return true;
}

function buildPins(events: EventItem[]): MapPin[] {
  const mappable = events.filter(isPublicMapPinEligible);
  const atPoint = new Map<string, number>();

  return mappable.map((e) => {
    const c = e.mapCoordinates!;
    const k = `${c.lat.toFixed(3)}_${c.lng.toFixed(3)}`;
    const n = atPoint.get(k) ?? 0;
    atPoint.set(k, n + 1);
    const when = formatEventWhen(e);
    const detailHref = e.detailHref ?? `/events/${e.slug}`;
    const base: [number, number] = [c.lat, c.lng];
    if (n === 0) {
      return {
        slug: e.slug,
        title: e.title,
        type: e.type,
        position: base,
        detailHref,
        whenLine: when.primary,
        summary: e.summary,
      };
    }
    const step = 0.012;
    const angle = (2 * Math.PI * n) / 6;
    return {
      slug: e.slug,
      title: e.title,
      type: e.type,
      position: [c.lat + step * Math.sin(angle), c.lng + step * Math.cos(angle)] as [number, number],
      detailHref,
      whenLine: when.primary,
      summary: e.summary,
    };
  });
}

function makeDivIcon(): L.DivIcon {
  return L.divIcon({
    className: "sos-leaflet-pin",
    html: `<div style="background:${PUBLIC_EVENT_PIN};width:16px;height:16px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,102,.28);z-index:${PIN_Z}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function FitMap({ pins, boundsKey }: { pins: MapPin[]; boundsKey: string }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) {
      map.setView(ARK_CENTER, DEFAULT_ZOOM);
      return;
    }
    if (pins.length === 1) {
      map.setView(pins[0].position, 9);
      return;
    }
    const b = L.latLngBounds(pins.map((p) => L.latLng(p.position)));
    map.fitBounds(b, { padding: [48, 48], maxZoom: 11 });
  }, [map, boundsKey, pins]);
  return null;
}

function PanToSelected({ selectedSlug, pins }: { selectedSlug: string | null; pins: MapPin[] }) {
  const map = useMap();
  useEffect(() => {
    if (!selectedSlug) return;
    const p = pins.find((x) => x.slug === selectedSlug);
    if (!p) return;
    map.flyTo(p.position, Math.max(map.getZoom(), 9), { duration: 0.4 });
  }, [selectedSlug, pins, map]);
  return null;
}

function MapPinMarker({
  pin,
  icon,
  isSelected,
  onSelect,
}: {
  pin: MapPin;
  icon: L.DivIcon;
  isSelected: boolean;
  onSelect: (slug: string) => void;
}) {
  const ref = useRef<L.Marker>(null);
  useEffect(() => {
    if (isSelected) ref.current?.openPopup();
  }, [isSelected, pin.slug]);
  return (
    <Marker
      ref={ref}
      position={pin.position}
      icon={icon}
      zIndexOffset={PIN_Z}
      eventHandlers={{
        click: () => onSelect(pin.slug),
      }}
    >
      <Popup className="sos-event-popup">
        <div className="min-w-[200px] max-w-[280px] font-body text-kelly-text">
          <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-text/55">{pin.type}</p>
          <p className="mt-1 font-heading text-base font-bold leading-snug">{pin.title}</p>
          <p className="mt-1 text-xs font-semibold text-kelly-text/75">{pin.whenLine}</p>
          <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-kelly-text/80">{pin.summary}</p>
          <a href={pin.detailHref} className="mt-3 inline-block text-sm font-bold text-kelly-navy underline">
            Open detail page →
          </a>
        </div>
      </Popup>
    </Marker>
  );
}

type MovementFairsMapProps = {
  events: EventItem[];
  selectedSlug?: string | null;
  onSelectSlug?: (slug: string | null) => void;
};

export function MovementFairsMap({ events, selectedSlug = null, onSelectSlug }: MovementFairsMapProps) {
  const pins = useMemo(() => buildPins(events), [events]);
  const boundsKey = useMemo(
    () =>
      pins
        .map((p) => {
          const [lat, lng] = p.position as [number, number];
          return `${p.slug}:${lat},${lng}`;
        })
        .join("|"),
    [pins],
  );
  const markerIcon = useMemo(() => makeDivIcon(), []);

  const onSelect = (slug: string) => {
    onSelectSlug?.(slug);
    requestAnimationFrame(() => {
      document.getElementById(`event-card-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  const listOnlyUpcoming = useMemo(
    () => events.filter((e) => e.status === "upcoming" && !isPublicMapPinEligible(e)).length,
    [events],
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 text-sm text-kelly-text/85 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
        <span className="font-body font-semibold">Map</span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 shrink-0 rounded-full border border-white shadow-sm"
            style={{ background: PUBLIC_EVENT_PIN }}
          />
          <span className="font-body">Published stops with a known location</span>
        </span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-kelly-text/10 shadow-[var(--shadow-soft)]">
        <MapContainer
          center={ARK_CENTER}
          zoom={DEFAULT_ZOOM}
          className="z-0 h-[min(58vh,520px)] w-full min-h-[260px] touch-manipulation sm:min-h-[320px]"
          /** Off on long pages so wheel/trackpad scrolls the document, not the map (avoids “scroll trap”). */
          scrollWheelZoom={false}
          worldCopyJump
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitMap pins={pins} boundsKey={boundsKey} />
          <PanToSelected selectedSlug={selectedSlug} pins={pins} />
          {pins.map((p) => (
            <MapPinMarker
              key={p.slug}
              pin={p}
              icon={markerIcon}
              isSelected={selectedSlug === p.slug}
              onSelect={onSelect}
            />
          ))}
        </MapContainer>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body text-xs text-kelly-text/60">
          Use the map’s +/− buttons to zoom (scroll moves the page).
          {listOnlyUpcoming > 0
            ? ` ${listOnlyUpcoming} upcoming stop${listOnlyUpcoming === 1 ? "" : "s"} stay list-only until a location is known.`
            : " Stops without a known location stay in the list only."}
        </p>
        <Link
          href="/events"
          className="shrink-0 font-body text-xs font-bold uppercase tracking-wider text-kelly-navy underline-offset-2 hover:underline"
        >
          All events →
        </Link>
      </div>
    </div>
  );
}
