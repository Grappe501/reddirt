"use client";

import { useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { CommunityOpportunity } from "@/lib/opportunities/community-opportunity-types";

import "leaflet/dist/leaflet.css";

const CENTER: [number, number] = [34.75, -92.35];

export function OpportunitiesMap({ rows }: { rows: CommunityOpportunity[] }) {
  const pts = useMemo(
    () => rows.filter((r) => typeof r.lat === "number" && typeof r.lng === "number"),
    [rows],
  );
  const pin = useMemo(
    () =>
      L.divIcon({
        className: "h-3 w-3 rounded-full border border-white bg-rose-600 shadow",
        iconSize: [12, 12],
      }),
    [],
  );
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-lg border border-kelly-text/15">
      <MapContainer center={CENTER} zoom={6.5} className="h-full w-full" scrollWheelZoom>
        <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pts.map((r) => (
          <Marker key={r.id} position={[r.lat!, r.lng!]} icon={pin}>
            <Popup>
              <p className="m-0 text-xs font-semibold">{r.title}</p>
              <p className="m-0 text-[11px] text-zinc-600">
                {r.county}
                {r.city ? ` · ${r.city}` : ""}
              </p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
