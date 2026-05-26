import { countyResourcePressureAnalyzer } from "./countyResourcePressureAnalyzer";
import { eventROIAnalyzer } from "./eventROIAnalyzer";
import { countyMomentumForecast } from "./countyMomentumForecast";
import { travelPriorityPlanner } from "./travelPriorityPlanner";
import { volunteerCapacityForecast } from "./volunteerCapacityForecast";
import { organizationalFragilityDetector } from "./organizationalFragilityDetector";
import { fieldCoverageGapFinder } from "./fieldCoverageGapFinder";
import { loadResourceAllocationModel } from "./resourceAllocationModel";
import type { CountyResourceAllocationBrief } from "./resourceAllocationTypes";

export function resourceAllocationBriefBuilder(countySlug: string): CountyResourceAllocationBrief {
  const modelRow = loadResourceAllocationModel().rows.find((x) => x.countySlug === countySlug);
  const pressure = countyResourcePressureAnalyzer(countySlug);
  const roi = eventROIAnalyzer(countySlug);
  const momentum = countyMomentumForecast(countySlug);
  const travel = travelPriorityPlanner(countySlug);
  const volunteer = volunteerCapacityForecast(countySlug);
  const fragility = organizationalFragilityDetector(countySlug);
  const fieldGap = fieldCoverageGapFinder(countySlug);

  return {
    countySlug,
    countyName: modelRow?.countyName ?? countySlug,
    operationalHealth: modelRow?.organizationalHealth ?? 0,
    resourcePressure: pressure.pressureScore ?? 0,
    volunteerCapacity: Number(volunteer.volunteerCapacity === "MISSING" ? 0 : volunteer.volunteerCapacity),
    travelBurden: travel.travelPriorityScore ?? 0,
    countyMomentum: {
      label: "county momentum",
      forecastType: "FORECAST",
      confidence: momentum.confidence,
      score: momentum.score,
      sourceLayers: momentum.sourceLayers,
      note: "FORECAST: county momentum from registration/civic/event trend signals.",
    },
    burnoutRisk: {
      label: "volunteer burnout risk",
      forecastType: "FORECAST",
      confidence: volunteer.confidence,
      score: volunteer.score,
      sourceLayers: volunteer.sourceLayers,
      note: "FORECAST: volunteer stress from capacity and staffing pressure.",
    },
    interventionUrgency: {
      label: "county intervention urgency",
      forecastType: "FORECAST",
      confidence: fragility.confidence,
      score: Math.max(pressure.pressureScore ?? 0, fragility.fragilityScore ?? 0),
      sourceLayers: fragility.sourceLayers,
      note: "FORECAST: intervention urgency from pressure + fragility signals.",
    },
    eventROISummary: `FORECAST: ROI ${roi.eventROI} (${roi.roiBand})`,
    staffingGaps: fieldGap.staffingGapScore ?? 100,
    operationalConfidenceScore: modelRow?.dataConfidence ?? 0,
    recommendedSafeOperatorActions: [
      "Prioritize coordinator staffing support for highest pressure counties.",
      "Adjust candidate time blocks by forecasted intervention urgency.",
      "Run operator review on low-confidence forecasts before acting.",
      "Do not dispatch automated field actions; require human approval.",
    ],
    sourceLayers: modelRow?.sourceLayers ?? ["data/resource-allocation/resource-allocation-model.json"],
  };
}

