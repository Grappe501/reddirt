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
};

const CENTER: [number, number] = [34.75, -92.35];

function pinIcon(lane: SettlementMapPin["lane"]) {
  if (lane === "confirmed") {
    return L.divIcon({
      className: "rounded-full border-2 border-white bg-emerald-600 shadow",
      iconSize: [13, 13],
    });
  }
  if (lane === "tentative") {
    return L.divIcon({
      className: "rounded-full border-2 border-dashed border-amber-900 bg-amber-300 shadow",
      iconSize: [14, 14],
    });
  }
  if (lane === "travel") {
    return L.divIcon({
      className: "rounded-full border-2 border-white bg-sky-600 shadow",
      iconSize: [12, 12],
    });
  }
  return L.divIcon({
    className: "rounded-full border border-white bg-zinc-500 shadow",
    iconSize: [11, 11],
  });
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
            icon={pinIcon(m.lane)}
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
