import { STATEWIDE_EVENT_REGION } from "@/content/arkansas-movement-regions";

/**
 * Approximate centroids for movement regions (field planning / map fallback when a calendar row has county
 * but no geocode). Not survey-grade—good enough to place pins and fitBounds.
 */
export const MOVEMENT_REGION_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  "Northwest Arkansas": { lat: 36.08, lng: -94.16 },
  "West Central Arkansas": { lat: 34.55, lng: -93.2 },
  "North Central Arkansas": { lat: 35.88, lng: -92.85 },
  "Northeast Arkansas": { lat: 35.84, lng: -90.7 },
  "Upper Delta": { lat: 35.2, lng: -90.18 },
  "Central Arkansas": { lat: 34.75, lng: -92.29 },
  "Lower Delta": { lat: 34.2, lng: -91.5 },
  "Southeast Arkansas": { lat: 34.23, lng: -92.02 },
  "Southwest Arkansas": { lat: 33.62, lng: -93.05 },
  [STATEWIDE_EVENT_REGION]: { lat: 34.75, lng: -92.35 },
};

const ARK_FALLBACK = { lat: 34.75, lng: -92.35 };

export function centroidForMovementRegionLabel(region: string): { lat: number; lng: number } {
  return MOVEMENT_REGION_CENTROIDS[region] ?? ARK_FALLBACK;
}
