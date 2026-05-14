"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import { ROSE_BUD } from "@/lib/opportunities/approx-county-center";

import "leaflet/dist/leaflet.css";

export type SettlementMapPin = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  lane: "confirmed" | "tentative" | "travel" | "other";
  county?: string;
  /** 0–1 relative modeled target vote gain for this county (advisory). */
  winAccent?: number;
};

const CENTER: [number, number] = [34.75, -92.35];

function pinIcon(lane: SettlementMapPin["lane"], winAccent?: number) {
  const ring =
    winAccent != null && winAccent > 0.04
      ? `box-shadow:0 0 0 2px hsl(${200 - winAccent * 115}, 72%, 44%);`
      : "";
  const baseStyle = (bg: string, border: string, size: number) =>
    L.divIcon({
      className: "",
      html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${bg};border:${border};${ring}"></div>`,
      iconSize: [size + 4, size + 4],
      iconAnchor: [(size + 4) / 2, (size + 4) / 2],
    });
  if (lane === "confirmed") {
    return baseStyle("#059669", "2px solid #fff", 12);
  }
  if (lane === "tentative") {
    return baseStyle("#fcd34d", "2px dashed #78350f", 13);
  }
  if (lane === "travel") {
    return baseStyle("#0284c7", "2px solid #fff", 11);
  }
  return baseStyle("#71717b", "1px solid #fff", 10);
}

export function KellySettlementMap({
  pins,
  polyline,
  selectedId,
  onSelectPin,
}: {
  pins: SettlementMapPin[];
  polyline: [number, number][];
  selectedId: string | null;
  onSelectPin: (id: string | null) => void;
}) {
  const rose = useMemo(
    () =>
      L.divIcon({
        className: "rounded-full border-2 border-rose-950 bg-rose-400 shadow",
        iconSize: [16, 16],
      }),
    [],
  );

  return (
    <div className="h-[min(52vh,440px)] w-full overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-inner">
      <MapContainer center={CENTER} zoom={6.35} className="h-full w-full" scrollWheelZoom>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {polyline.length > 1 ? (
          <Polyline positions={polyline} pathOptions={{ color: "#0f766e", weight: 3, opacity: 0.72 }} />
        ) : null}
        <Marker position={[ROSE_BUD.lat, ROSE_BUD.lng]} icon={rose} eventHandlers={{ click: () => onSelectPin(null) }}>
          <Popup>
            <p className="m-0 text-xs font-bold">Rose Bud (home base)</p>
            <p className="m-0 text-[11px] text-zinc-600">Default routing origin</p>
          </Popup>
        </Marker>
        {pins.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={pinIcon(m.lane, m.winAccent)}
            eventHandlers={{
              click: () => onSelectPin(m.id === selectedId ? null : m.id),
            }}
          >
            <Popup>
              <p className="m-0 max-w-[220px] text-xs font-semibold leading-snug">{m.title}</p>
              <p className="m-0 mt-1 text-[11px] text-zinc-600">
                {m.county ?? "—"} · {m.lane}
              </p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
