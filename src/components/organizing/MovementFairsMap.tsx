"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { LatLngExpression } from "leaflet";
import type { EventItem, FieldAttendance } from "@/content/types";
import { FIELD_PIN, getFieldAttendance } from "@/lib/festivals/field-attendance-style";
import { formatEventWhen } from "@/lib/format/eventDisplay";

import "leaflet/dist/leaflet.css";

const ARK_CENTER: LatLngExpression = [34.75, -92.35];
const DEFAULT_ZOOM = 6.7;

/** Static movement / content events */
const MOVEMENT_EVENT_PIN = "#991b1b";
/** Published CampaignOS events merged onto the same map */
const CALENDAR_OPS_PIN = "#1d4ed8";

export type MapPin = {
  slug: string;
  title: string;
  type: string;
  position: LatLngExpression;
  fieldAttendance: FieldAttendance;
  fillColor: string;
  detailHref: string;
  whenLine: string;
  summary: string;
  mapPinQuality?: EventItem["mapPinQuality"];
  eventSource?: EventItem["eventSource"];
};

function pinZ(att: FieldAttendance): number {
  switch (att) {
    case "confirmed":
      return 600;
    case "tentative":
      return 500;
    case "suggested":
      return 400;
    default:
      return 100;
  }
}

function pinFill(event: EventItem, att: FieldAttendance): string {
  if (event.eventSource === "calendar") {
    if (event.type === "Fairs and Festivals") return FIELD_PIN[att];
    return CALENDAR_OPS_PIN;
  }
  if (event.type === "Fairs and Festivals") return FIELD_PIN[att];
  return MOVEMENT_EVENT_PIN;
}

function buildPins(events: EventItem[]): MapPin[] {
  const mappable = events.filter((e) => e.status === "upcoming" && e.mapCoordinates);
  const atPoint = new Map<string, number>();

  return mappable.map((e) => {
    const c = e.mapCoordinates!;
    const k = `${c.lat.toFixed(3)}_${c.lng.toFixed(3)}`;
    const n = atPoint.get(k) ?? 0;
    atPoint.set(k, n + 1);
    const fieldAttendance = getFieldAttendance(e);
    const fillColor = pinFill(e, fieldAttendance);
    const when = formatEventWhen(e);
    const detailHref = e.detailHref ?? `/events/${e.slug}`;
    if (n === 0) {
      return {
        slug: e.slug,
        title: e.title,
        type: e.type,
        position: [c.lat, c.lng],
        fieldAttendance,
        fillColor,
        detailHref,
        whenLine: when.primary,
        summary: e.summary,
        mapPinQuality: e.mapPinQuality,
        eventSource: e.eventSource,
      };
    }
    const step = 0.012;
    const angle = (2 * Math.PI * n) / 6;
    return {
      slug: e.slug,
      title: e.title,
      type: e.type,
      position: [c.lat + step * Math.sin(angle), c.lng + step * Math.cos(angle)],
      fieldAttendance,
      fillColor,
      detailHref,
      whenLine: when.primary,
      summary: e.summary,
      mapPinQuality: e.mapPinQuality,
      eventSource: e.eventSource,
    };
  });
}

function makeDivIcon(fillColor: string, zIndexOffset: number): L.DivIcon {
  return L.divIcon({
    className: "reddirt-leaflet-pin",
    html: `<div style="background:${fillColor};width:16px;height:16px;border-radius:50%;border:2px solid #2b1e1a;box-shadow:0 1px 4px rgba(0,0,0,.28);z-index:${zIndexOffset}"></div>`,
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
  z,
  isSelected,
  onSelect,
}: {
  pin: MapPin;
  icon: L.DivIcon;
  z: number;
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
      zIndexOffset={z}
      eventHandlers={{
        click: () => onSelect(pin.slug),
      }}
    >
      <Popup className="reddirt-event-popup">
        <div className="min-w-[200px] max-w-[280px] font-body text-deep-soil">
          <p className="text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">{pin.type}</p>
          <p className="mt-1 font-heading text-base font-bold leading-snug">{pin.title}</p>
          <p className="mt-1 text-xs font-semibold text-deep-soil/75">{pin.whenLine}</p>
          {pin.mapPinQuality === "region" ? (
            <p className="mt-1 text-[11px] text-amber-900/90">Approximate region pin — confirm address on the detail page.</p>
          ) : null}
          {pin.eventSource === "calendar" ? (
            <p className="mt-1 text-[11px] text-civic-blue">Campaign HQ calendar — staff-published only.</p>
          ) : null}
          <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-deep-soil/80">{pin.summary}</p>
          <a
            href={pin.detailHref}
            className="mt-3 inline-block text-sm font-bold text-red-dirt underline"
          >
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
  const markerIcons = useMemo(() => {
    const m = new Map<string, L.DivIcon>();
    for (const p of pins) {
      const z = pinZ(p.fieldAttendance);
      const key = `${p.fillColor}-${z}`;
      if (!m.has(key)) m.set(key, makeDivIcon(p.fillColor, z));
    }
    return m;
  }, [pins]);

  const legend = (
    <div className="flex flex-col gap-2 text-sm text-deep-soil/85 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-2">
      <span className="font-body font-semibold">Legend</span>
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full border border-deep-soil/20 shadow-sm"
          style={{ background: MOVEMENT_EVENT_PIN }}
        />
        <span className="font-body">Movement site events</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full border border-deep-soil/20 shadow-sm"
          style={{ background: CALENDAR_OPS_PIN }}
        />
        <span className="font-body">HQ calendar (published)</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full border border-deep-soil/20 shadow-sm"
          style={{ background: FIELD_PIN.unscheduled }}
        />
        <span className="font-body">Fair / festival · listed</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full border border-deep-soil/15 shadow-sm"
          style={{ background: FIELD_PIN.suggested }}
        />
        <span className="font-body">Fair · suggested</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full border border-deep-soil/15 shadow-sm"
          style={{ background: FIELD_PIN.tentative }}
        />
        <span className="font-body">Fair · tentative</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full border border-deep-soil/15 shadow-sm"
          style={{ background: FIELD_PIN.confirmed }}
        />
        <span className="font-body">Fair · confirmed</span>
      </span>
    </div>
  );

  const onSelect = (slug: string) => {
    onSelectSlug?.(slug);
    requestAnimationFrame(() => {
      document.getElementById(`event-card-${slug}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  };

  return (
    <div className="space-y-3">
      {legend}
      <div className="overflow-hidden rounded-2xl border border-deep-soil/10 shadow-[var(--shadow-soft)]">
        <MapContainer
          center={ARK_CENTER}
          zoom={DEFAULT_ZOOM}
          className="z-0 h-[min(58vh,520px)] w-full min-h-[260px] touch-manipulation sm:min-h-[320px]"
          scrollWheelZoom
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
              icon={markerIcons.get(`${p.fillColor}-${pinZ(p.fieldAttendance)}`)!}
              z={pinZ(p.fieldAttendance)}
              isSelected={selectedSlug === p.slug}
              onSelect={onSelect}
            />
          ))}
        </MapContainer>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body text-xs text-deep-soil/60">
          OpenStreetMap + Leaflet — operational field view. Pins without coordinates stay in the list only until staff
          add a point or county.
        </p>
        <Link
          href="/campaign-calendar"
          className="shrink-0 font-body text-xs font-bold uppercase tracking-wider text-red-dirt underline-offset-2 hover:underline"
        >
          Full HQ calendar →
        </Link>
      </div>
    </div>
  );
}
