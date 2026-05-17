import { calculateCityRoute } from "@/lib/travel-ledger/mileage";
import type { TravelCity, TravelLedgerItem } from "@/lib/travel-ledger/types";
import type { CityMileageValidation } from "./autopilot-types";

export async function validateCityMileage(input: {
  item: TravelLedgerItem;
  cities: TravelCity[];
  mileageRate: number;
}): Promise<CityMileageValidation | undefined> {
  const first = input.cities[0];
  if (!first) return undefined;

  const route = await calculateCityRoute({
    itemId: input.item.id,
    date: input.item.date,
    cities: input.cities,
    mileageRate: input.mileageRate,
  });

  return {
    city: first.city,
    state: first.state,
    routeText: route.routeText,
    baseMiles: route.baseRoundTripMiles,
    totalReimbursableMiles: route.totalReimbursableMiles,
    source: process.env.GOOGLE_MAPS_API_KEY ? "google_maps" : "fallback",
    confidence: route.baseRoundTripMiles > 0 ? "high" : "low",
    warnings: route.baseRoundTripMiles > 0 ? [] : ["No known fallback or Google Maps distance for inferred city."],
  };
}

