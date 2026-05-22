import { calculateCityRoute } from "@/lib/travel-ledger/mileage";
import { CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE } from "../constants";
import type { CampaignEventFactCardData } from "../fact-card-data";

export async function applyTravelMileageToFactCard(
  recordId: string,
  dateYmd: string,
  data: CampaignEventFactCardData,
): Promise<CampaignEventFactCardData> {
  const travel = { ...data.travel };
  const origin =
    travel.originOverrideCity?.trim() || travel.assumedOriginCity?.trim() || "Rose Bud";
  const destination =
    travel.destinationOverrideCity?.trim() || travel.assumedDestinationCity?.trim();

  travel.reimbursementRate = CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE;

  if (!destination) {
    return { ...data, travel };
  }

  try {
    const route = await calculateCityRoute({
      itemId: recordId,
      date: dateYmd,
      cities: [{ city: destination, state: "AR" }],
      mileageRate: CAMPAIGN_EVENT_REIMBURSEMENT_RATE_USD_PER_MILE,
    });
    travel.roundTripMiles = route.totalReimbursableMiles;
    travel.reimbursementAmount = route.reimbursementAmount;
    travel.mileageSource = `city_route_from_${origin}`;
    travel.travelEndPointLabel = `${destination}, AR`;
  } catch {
    travel.mileageSource = "calculation_failed";
  }

  return { ...data, travel };
}
