"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import type { WeekMapMarker } from "@/lib/calendar/build-week-board-model";

import "leaflet/dist/leaflet.css";

const CENTER: [number, number] = [34.75, -92.35];

export function WeekViewMap({ markers, polyline }: { markers: WeekMapMarker[]; polyline: [number, number][] }) {
  const standardPin = useMemo(
    () =>
      L.divIcon({
        className: "h-3 w-3 rounded-full border border-white bg-sky-700 shadow",
        iconSize: [12, 12],
      }),
    [],
  );
  const publicPin = useMemo(
    () =>
      L.divIcon({
        className: "h-3.5 w-3.5 rounded-full border-2 border-dashed border-amber-900 bg-amber-400 shadow",
        iconSize: [14, 14],
      }),
    [],
  );
  return (
    <div className="h-[380px] w-full overflow-hidden rounded-lg border border-kelly-text/15 bg-white">
      <MapContainer center={CENTER} zoom={6.4} className="h-full w-full" scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {polyline.length > 1 ? (
          <Polyline
            positions={polyline}
            pathOptions={{ color: "#0369a1", weight: 3, opacity: 0.75 }}
          />
        ) : null}
        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lng]} icon={m.markerKind === "public_request" ? publicPin : standardPin}>
            <Popup>
              <p className="m-0 text-xs font-semibold">{m.title}</p>
              <p className="m-0 text-[11px] text-zinc-600">
                {m.markerKind === "public_request" ? (
                  <span className="font-semibold text-amber-900">Public request · not confirmed</span>
                ) : null}
                {m.county ?? "—"} · {m.badge}
              </p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
