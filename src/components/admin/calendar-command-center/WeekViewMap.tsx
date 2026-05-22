"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import type { WeekMapMarker } from "@/lib/calendar/build-week-board-model";

import "leaflet/dist/leaflet.css";

const CENTER: [number, number] = [34.75, -92.35];

function weekMarkerIcon(m: WeekMapMarker, standardPin: L.DivIcon, publicPin: L.DivIcon): L.DivIcon {
  const accent = m.winTargetAccent;
  if (accent == null || accent <= 0.03) {
    return m.markerKind === "public_request" ? publicPin : standardPin;
  }
  const hue = Math.round(200 - accent * 110);
  const fill = m.markerKind === "public_request" ? "#fbbf24" : "#0369a1";
  const border = m.markerKind === "public_request" ? "2px dashed #78350f" : "1px solid #fff";
  return L.divIcon({
    className: "",
    html: `<div style="width:12px;height:12px;border-radius:9999px;background:${fill};border:${border};box-shadow:0 0 0 2px hsl(${hue},72%,42%);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export function WeekViewMap({
  markers,
  polyline,
  winTargetLegend = false,
}: {
  markers: WeekMapMarker[];
  polyline: [number, number][];
  winTargetLegend?: boolean;
}) {
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
    <div className="space-y-2">
      {winTargetLegend ? (
        <p className="font-body text-[10px] text-kelly-muted">
          Pin halo (teal→gold) encodes modeled <span className="font-semibold">target vote gain</span> for that county this week — advisory scenario only.
        </p>
      ) : null}
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
          <Marker key={m.id} position={[m.lat, m.lng]} icon={weekMarkerIcon(m, standardPin, publicPin)}>
            <Popup>
              <p className="m-0 text-xs font-semibold">{m.title}</p>
              <p className="m-0 text-[11px] text-zinc-600">
                {m.markerKind === "public_request" ? (
                  <span className="font-semibold text-amber-900">Public request · not confirmed</span>
                ) : null}
                {m.county ?? "—"} · {m.badge}
                {m.winTargetAccent != null && m.winTargetAccent > 0.03 ? (
                  <span className="mt-1 block text-[10px] text-sky-900">
                    Win-target accent {(m.winTargetAccent * 100).toFixed(0)}% of max gain this week (scenario).
                  </span>
                ) : null}
              </p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
    </div>
  );
}
