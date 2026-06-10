"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";

import { ROSE_BUD } from "@/lib/opportunities/approx-county-center";
import type { VictoryBoardCountyPin } from "@/lib/victory-os/victory-board/types";

import "leaflet/dist/leaflet.css";

const CENTER: [number, number] = [34.75, -92.35];

function countyIcon(pin: VictoryBoardCountyPin, selected: boolean) {
  const size = pin.pinSize + (selected ? 4 : 0);
  const ring = selected ? "box-shadow:0 0 0 3px #1e3a5f;" : "";
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:${pin.fillColor};border:2px solid ${pin.strokeColor};${ring}"></div>`,
    iconSize: [size + 4, size + 4],
    iconAnchor: [(size + 4) / 2, (size + 4) / 2],
  });
}

export function VictoryBoardCountyMap({
  pins,
  selectedSlug,
  onSelectPin,
}: {
  pins: VictoryBoardCountyPin[];
  selectedSlug: string | null;
  onSelectPin: (slug: string | null) => void;
}) {
  const rose = useMemo(
    () =>
      L.divIcon({
        className: "rounded-full border-2 border-rose-950 bg-rose-400 shadow",
        iconSize: [14, 14],
      }),
    [],
  );

  return (
    <div className="h-[min(56vh,480px)] w-full overflow-hidden rounded-2xl border border-kelly-text/10 bg-white shadow-inner">
      <MapContainer center={CENTER} zoom={6.35} className="h-full w-full" scrollWheelZoom>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[ROSE_BUD.lat, ROSE_BUD.lng]} icon={rose}>
          <Popup>
            <p className="m-0 text-xs font-bold">Rose Bud (home base)</p>
          </Popup>
        </Marker>
        {pins.map((pin) => (
          <Marker
            key={pin.countySlug}
            position={[pin.lat, pin.lng]}
            icon={countyIcon(pin, pin.countySlug === selectedSlug)}
            eventHandlers={{
              click: () => onSelectPin(pin.countySlug === selectedSlug ? null : pin.countySlug),
            }}
          >
            <Popup>
              <p className="m-0 max-w-[240px] text-xs font-semibold leading-snug">{pin.displayName}</p>
              <p className="m-0 mt-1 text-[11px] text-zinc-600">{pin.tooltipLine}</p>
              {pin.decisionStatus ? (
                <p className="m-0 mt-1 text-[11px] font-medium text-zinc-800">Decision: {pin.decisionStatus}</p>
              ) : null}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
