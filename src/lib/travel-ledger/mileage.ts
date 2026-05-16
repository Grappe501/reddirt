import { createHash } from "node:crypto";
import type { TravelCity } from "./types";

export type CityRouteCalculation = {
  travelCities: TravelCity[];
  routeText: string;
  baseRoundTripMiles: number;
  driveAroundPct: number;
  driveAroundMiles: number;
  totalReimbursableMiles: number;
  reimbursementAmount: number;
};

const HOME_LABEL = "Rose Bud";
const FALLBACK_ROUND_TRIP_MILES: Record<string, number> = {
  "little rock|ar": 86.2,
  "prescott|ar": 286.4,
  "conway|ar": 78.0,
  "sherwood|ar": 82.4,
  "fayetteville|ar": 364.0,
  "camden|ar": 266.0,
  "washington|ar": 288.0,
  "jacksonville|ar": 74.0,
  "mountain home|ar": 188.0,
  "yellville|ar": 214.0,
  "russellville|ar": 154.0,
  "stone county|ar": 120.0,
  "searcy|ar": 48.0,
  "batesville|ar": 112.0,
  "rose bud|ar": 0,
};

export async function calculateCityRoute({
  itemId,
  date,
  cities,
  mileageRate,
  driveAroundMilesOverride,
}: {
  itemId: string;
  date: string;
  cities: TravelCity[];
  mileageRate: number;
  driveAroundMilesOverride?: number;
}): Promise<CityRouteCalculation> {
  const normalized = cities.filter((city) => city.city.trim()).map(normalizeCity);
  const distances = await Promise.all(normalized.map(resolveRoundTripCityMiles));
  const baseRoundTripMiles = roundOne(distances.reduce((total, miles) => total + miles, 0));
  const driveAroundPct = deterministicDriveAroundPct(`${itemId}-${date}-${normalized.map((city) => `${city.city}-${city.state}`).join("-")}`);
  const driveAroundMiles = roundOne(driveAroundMilesOverride ?? baseRoundTripMiles * driveAroundPct);
  const totalReimbursableMiles = roundOne(baseRoundTripMiles + driveAroundMiles);

  return {
    travelCities: normalized,
    routeText: [HOME_LABEL, ...normalized.map((city) => city.label || city.city), HOME_LABEL].join(" -> "),
    baseRoundTripMiles,
    driveAroundPct,
    driveAroundMiles,
    totalReimbursableMiles,
    reimbursementAmount: roundMoney(totalReimbursableMiles * mileageRate),
  };
}

async function resolveRoundTripCityMiles(city: TravelCity): Promise<number> {
  const fallbackMiles = FALLBACK_ROUND_TRIP_MILES[key(city.city, city.state)] ?? 0;
  if (!process.env.GOOGLE_MAPS_API_KEY) return fallbackMiles;

  try {
    const params = new URLSearchParams({
      origins: "352 School Rd, Rose Bud, AR",
      destinations: `${city.city}, ${city.state}`,
      units: "imperial",
      key: process.env.GOOGLE_MAPS_API_KEY,
    });
    const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?${params}`);
    const body = (await response.json()) as {
      status: string;
      rows?: Array<{ elements?: Array<{ status: string; distance?: { value: number } }> }>;
    };
    const meters = body.rows?.[0]?.elements?.[0]?.distance?.value;
    if (!response.ok || body.status !== "OK" || !meters) return fallbackMiles;
    return roundOne((meters / 1609.344) * 2);
  } catch {
    return fallbackMiles;
  }
}

function normalizeCity(city: TravelCity): TravelCity {
  return {
    city: titleCase(city.city.trim()),
    state: (city.state || "AR").trim().toUpperCase(),
    label: city.label?.trim(),
  };
}

function deterministicDriveAroundPct(seed: string, min = 0.12, max = 0.16): number {
  const hash = createHash("sha256").update(seed).digest();
  const value = hash.readUInt32BE(0) / 0xffffffff;
  return Math.round((min + (max - min) * value) * 1000) / 1000;
}

function key(city: string, state: string): string {
  return `${city.trim().toLowerCase()}|${state.trim().toLowerCase()}`;
}

function titleCase(value: string): string {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
