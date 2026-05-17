import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { TripResolutionAutopilotSummary } from "./run-trip-resolution-autopilot";

const DATA_PATH = path.join(process.cwd(), "data", "ai", "trip-resolution-autopilot-packet.json");
const REPORT_PATH = path.join(process.cwd(), "reports", "trip-resolution-autopilot-packet.md");

export async function saveTripResolutionAutopilotArtifacts(summary: TripResolutionAutopilotSummary) {
  await mkdir(path.dirname(DATA_PATH), { recursive: true });
  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(DATA_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  await writeFile(REPORT_PATH, renderReport(summary), "utf8");
}

function renderReport(summary: TripResolutionAutopilotSummary): string {
  const ready = summary.results.filter((result) => result.readiness === "ready_to_approve");
  const needsCity = summary.results.filter((result) => result.readiness === "needs_city_input");
  const likelyExcludes = summary.results.filter((result) => result.readiness === "likely_exclude");
  const duplicates = summary.results.filter((result) => result.readiness === "duplicate_review");
  const mileage = summary.results.filter((result) => (result.preparedFields.totalReimbursableMiles ?? 0) > 0);

  return [
    "# Trip Resolution Autopilot Packet",
    "",
    "## Metrics",
    "",
    `- Total prepared items: ${summary.before.totalPreparedItems}`,
    `- Needs city before/after: ${summary.before.needsCity} -> ${summary.after.needsCity}`,
    `- Ready to approve before/after: ${summary.before.readyToApprove} -> ${summary.after.readyToApprove}`,
    `- Mileage calculated before/after: ${summary.before.mileageCalculated} -> ${summary.after.mileageCalculated}`,
    `- Invoice-safe before/after: ${summary.before.invoiceSafe} -> ${summary.after.invoiceSafe}`,
    `- Title city matches: ${summary.titleCityMatches}`,
    `- Title purpose matches: ${summary.titlePurposeMatches}`,
    "",
    "## Items Ready To Approve",
    ...renderRows(ready),
    "",
    "## Items Needing City",
    ...renderRows(needsCity),
    "",
    "## Likely Excludes",
    ...renderRows(likelyExcludes),
    "",
    "## Duplicate Risks",
    ...renderRows(duplicates),
    "",
    "## Mileage Calculated",
    ...renderRows(mileage),
    "",
    "## Top Unresolved Questions",
    ...summary.results.slice(0, 25).map((result) => `- ${result.date} ${result.title}: ${result.nextQuestion.question}`),
    "",
  ].join("\n");
}

function renderRows(rows: TripResolutionAutopilotSummary["results"]): string[] {
  if (!rows.length) return ["- None"];
  return rows.slice(0, 25).map((result) => {
    const city = result.preparedFields.city ? ` -> ${result.preparedFields.city}` : "";
    return `- ${result.date} ${result.title}${city} (${result.readiness})`;
  });
}

