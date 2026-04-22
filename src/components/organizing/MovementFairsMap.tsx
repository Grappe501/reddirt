"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { APIProvider, Map as GoogleMap, Marker } from "@vis.gl/react-google-maps";
import type { EventItem, FieldAttendance } from "@/content/types";
import { FIELD_PIN, getFieldAttendance } from "@/lib/festivals/field-attendance-style";

const ARK_CENTER = { lat: 34.75, lng: -92.35 };
const DEFAULT_ZOOM = 6.7;

function pinIconDataUrl(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
<path fill="${color}" stroke="#2b1e1a" stroke-width="1.2" d="M12 0C5.4 0 0 5.1 0 11.4c0 6.3 12 24.6 12 24.6s12-18.3 12-24.6C24 5.1 18.6 0 12 0z"/>
<circle fill="#fff" cx="12" cy="11" r="3.5"/>
</svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

export type MapPin = {
  slug: string;
  title: string;
  position: { lat: number; lng: number };
  fieldAttendance: FieldAttendance;
};

function pinZ(att: FieldAttendance): number {
  switch (att) {
    case "confirmed":
      return 60;
    case "tentative":
      return 50;
    case "suggested":
      return 40;
    default:
      return 10;
  }
}

function buildPins(events: EventItem[]): MapPin[] {
  const fairs = events.filter(
    (e) => e.type === "Fairs and Festivals" && e.mapCoordinates && e.status === "upcoming",
  );
  const atPoint = new Map<string, number>();

  return fairs.map((e) => {
    const c = e.mapCoordinates!;
    const k = `${c.lat.toFixed(3)}_${c.lng.toFixed(3)}`;
    const n = atPoint.get(k) ?? 0;
    atPoint.set(k, n + 1);
    const fieldAttendance = getFieldAttendance(e);
    if (n === 0) {
      return {
        slug: e.slug,
        title: e.title,
        position: c,
        fieldAttendance,
      };
    }
    const step = 0.012;
    const angle = (2 * Math.PI * n) / 6;
    return {
      slug: e.slug,
      title: e.title,
      position: { lat: c.lat + step * Math.sin(angle), lng: c.lng + step * Math.cos(angle) },
      fieldAttendance,
    };
  });
}

type MovementFairsMapProps = {
  apiKey: string | null;
  events: EventItem[];
};

export function MovementFairsMap({ apiKey, events }: MovementFairsMapProps) {
  const router = useRouter();
  const pins = useMemo(() => buildPins(events), [events]);
  const icons = useMemo(() => {
    const m: Record<FieldAttendance, string> = {
      unscheduled: pinIconDataUrl(FIELD_PIN.unscheduled),
      suggested: pinIconDataUrl(FIELD_PIN.suggested),
      tentative: pinIconDataUrl(FIELD_PIN.tentative),
      confirmed: pinIconDataUrl(FIELD_PIN.confirmed),
    };
    return m;
  }, []);

  if (!apiKey) {
    return (
      <div
        className="rounded-2xl border border-dashed border-deep-soil/20 bg-deep-soil/[0.04] p-6 text-center"
        role="status"
      >
        <p className="font-heading text-base font-bold text-deep-soil">Map unavailable</p>
        <p className="mt-2 font-body text-sm text-deep-soil/75">
          Add <code className="rounded bg-deep-soil/10 px-1.5 py-0.5 font-mono text-xs">GOOGLE_MAPS_API_KEY</code> (or{" "}
          <code className="font-mono text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>) in{" "}
          <code className="font-mono text-xs">.env</code> with Maps JavaScript API enabled and HTTP referrer limits set for
          this site.
        </p>
      </div>
    );
  }

  if (pins.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-deep-soil/85">
        <span className="font-body font-semibold">Fairs &amp; festivals</span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border border-deep-soil/20 shadow-sm" style={{ background: FIELD_PIN.unscheduled }} />
          <span className="font-body">Listed</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border border-deep-soil/15 shadow-sm" style={{ background: FIELD_PIN.suggested }} />
          <span className="font-body">Suggested route</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border border-deep-soil/15 shadow-sm" style={{ background: FIELD_PIN.tentative }} />
          <span className="font-body">Tentative</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-full border border-deep-soil/15 shadow-sm" style={{ background: FIELD_PIN.confirmed }} />
          <span className="font-body">Confirmed</span>
        </span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-deep-soil/10 shadow-[var(--shadow-soft)]">
        <APIProvider apiKey={apiKey} region="US" language="en">
          <GoogleMap
            className="h-[min(55vh,480px)] w-full min-h-[320px]"
            defaultCenter={ARK_CENTER}
            defaultZoom={DEFAULT_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI={false}
            zoomControl
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl
          >
            {pins.map((p) => (
              <Marker
                key={p.slug}
                position={p.position}
                title={p.title}
                onClick={() => {
                  router.push(`/events/${p.slug}`);
                }}
                zIndex={pinZ(p.fieldAttendance)}
                icon={{
                  url: icons[p.fieldAttendance],
                }}
              />
            ))}
          </GoogleMap>
        </APIProvider>
      </div>
      <p className="font-body text-xs text-deep-soil/60">
        Pins use city centers. Orange marks are from a same-day coverage model (~2h on site + drive time between stops). Set
        <code className="mx-1 font-mono">fieldAttendance</code> in content to override (tentative / confirmed).
      </p>
    </div>
  );
}
