import { loadLedgerItems, loadTravelLedgerSettings } from "@/lib/travel-ledger/storage";
import { buildTripContext } from "./build-trip-context";
import type { TitleCityMatch, TripResolutionAutopilotResult } from "./autopilot-types";
import { computeReadiness } from "./autopilot-readiness-score";
import { classifyCampaignTrip } from "./campaign-trip-classifier";
import { findCityAliasMatches } from "./city-county-alias-memory";
import { extractTitleCity } from "./title-city-extractor";
import { extractTitlePurpose } from "./title-purpose-extractor";
import { validateCityMileage } from "./google-maps-city-validator";
import { selectNextQuestion } from "./next-question-selector";
import { findReviewerMemoryCity } from "./reviewer-memory";

export type TripResolutionAutopilotSummary = {
  before: TripAutopilotMetrics;
  after: TripAutopilotMetrics;
  titleCityMatches: number;
  titlePurposeMatches: number;
  results: TripResolutionAutopilotResult[];
};

export type TripAutopilotMetrics = {
  totalPreparedItems: number;
  needsCity: number;
  readyToApprove: number;
  mileageCalculated: number;
  invoiceSafe: number;
};

export async function runTripResolutionAutopilot(): Promise<TripResolutionAutopilotSummary> {
  const [items, settings] = await Promise.all([loadLedgerItems(), loadTravelLedgerSettings()]);
  const before = computeBeforeMetrics(items);
  const results: TripResolutionAutopilotResult[] = [];

  for (const item of items) {
    const context = buildTripContext(item, items);
    const titleCity = await resolveTitleFirstCity(context.title);
    const purposeExtraction = extractTitlePurpose(context.title, titleCity);
    const classification = classifyCampaignTrip({
      title: context.title,
      titleCityMatch: titleCity,
      purposeExtraction,
      duplicateRisk: context.duplicateCandidates.length > 0,
    });
    const candidateCities =
      item.travelCities.length > 0
        ? item.travelCities
        : titleCity.cities ?? (titleCity.city ? [{ city: titleCity.city, state: titleCity.state ?? "AR" }] : []);
    const mileageValidation =
      candidateCities.length && classification.likelyCampaignTravel
        ? await validateCityMileage({ item, cities: candidateCities, mileageRate: settings.mileageRate })
        : undefined;
    const resultShell = {
      itemId: item.id,
      title: context.title,
      date: item.date,
      titleCityMatch: titleCity.source === "none" ? undefined : titleCity,
      purposeExtraction,
      classification,
      mileageValidation,
      preparedFields: {
        city: candidateCities[0]?.city,
        state: candidateCities[0]?.state,
        routeText: mileageValidation?.routeText ?? item.routeText,
        totalReimbursableMiles: mileageValidation?.totalReimbursableMiles ?? item.totalReimbursableMiles,
        reimbursementAmount:
          mileageValidation?.totalReimbursableMiles !== undefined
            ? Math.round(mileageValidation.totalReimbursableMiles * settings.mileageRate * 100) / 100
            : item.reimbursementAmount,
        businessPurpose: purposeExtraction.businessPurpose,
      },
      warnings: [
        ...context.duplicateCandidates.map((candidate) => `Possible duplicate: ${candidate.date} ${candidate.sourceTitles[0] ?? candidate.id}`),
        ...(mileageValidation?.warnings ?? []),
      ],
      humanApprovalRequired: true as const,
    };
    const readiness = computeReadiness(resultShell);
    results.push({
      ...resultShell,
      readiness,
      nextQuestion: selectNextQuestion({
        titleCityMatch: titleCity,
        purposeExtraction,
        classification,
        mileageValidation,
      }),
    });
  }

  return {
    before,
    after: computeAfterMetrics(results),
    titleCityMatches: results.filter((result) => result.titleCityMatch?.city).length,
    titlePurposeMatches: results.filter((result) => result.purposeExtraction && result.purposeExtraction.classification !== "unknown").length,
    results,
  };
}

async function resolveTitleFirstCity(title: string): Promise<TitleCityMatch> {
  const titleMatch = extractTitleCity(title);
  if (titleMatch.source !== "none") return titleMatch;

  const memory = await findReviewerMemoryCity(title);
  if (memory) return memory;

  return {
    ...titleMatch,
    reason: "No title city, alias, county, or reviewer memory match found before OpenAI.",
  };
}

function computeBeforeMetrics(items: Awaited<ReturnType<typeof loadLedgerItems>>): TripAutopilotMetrics {
  return {
    totalPreparedItems: items.length,
    needsCity: items.filter((item) => !item.travelCities.length && item.reviewStatus !== "denied").length,
    readyToApprove: items.filter((item) => item.reviewStatus === "ready_for_approval" && item.approvalStatus === "not_approved").length,
    mileageCalculated: items.filter((item) => item.totalReimbursableMiles > 0).length,
    invoiceSafe: items.filter((item) => item.approvalStatus === "approved" || item.approvalStatus === "approved_with_changes").length,
  };
}

function computeAfterMetrics(results: TripResolutionAutopilotResult[]): TripAutopilotMetrics {
  return {
    totalPreparedItems: results.length,
    needsCity: results.filter((result) => result.readiness === "needs_city_input").length,
    readyToApprove: results.filter((result) => result.readiness === "ready_to_approve").length,
    mileageCalculated: results.filter((result) => (result.preparedFields.totalReimbursableMiles ?? 0) > 0).length,
    invoiceSafe: results.filter((result) => result.readiness === "ready_to_approve").length,
  };
}

export function checkTitleCityResolution(title: string): string | undefined {
  return extractTitleCity(title).city ?? findCityAliasMatches(title)[0]?.entry.city;
}

