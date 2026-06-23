import electionHistorySource from "../../../../data/election/arkansas-county-election-history.normalized.json";
import { getCountyVoterFileRollup } from "@/lib/election-plan/load-voter-file-location-rollups";

import type { CountyWorkbenchElectionRow } from "./types";

type BundledHistoryRow = (typeof electionHistorySource.rows)[number];

function normalizeCountyName(name: string): string {
  return name.replace(/\s+County$/i, "").trim().toLowerCase();
}

export function findBundledElectionHistoryRow(countyName: string): BundledHistoryRow | undefined {
  const key = normalizeCountyName(countyName);
  return electionHistorySource.rows.find((r) => normalizeCountyName(r.county) === key);
}

/** SOS official JSON — works without Prisma on Netlify. */
export function bundledCountyElectionHistory(countyName: string): CountyWorkbenchElectionRow[] {
  const row = findBundledElectionHistoryRow(countyName);
  if (!row) return [];

  const elections: CountyWorkbenchElectionRow[] = [];

  function push(name: string, electionDate: string, ballotsCast: number | undefined) {
    if (ballotsCast == null || ballotsCast <= 0) return;
    elections.push({
      electionName: name,
      electionDate,
      registeredVoters: null,
      ballotsCast,
      turnoutPct: null,
      isOfficial: true,
    });
  }

  push("2024 General · Presidential", "2024-11-05", row.presidential2024TotalVotes);
  push("2024 General · Treasurer", "2024-11-05", row.treasurer2024TotalVotes);
  push("2022 General · Secretary of State", "2022-11-08", row.sos2022TotalVotes);
  push("2022 General · Treasurer", "2022-11-08", row.treasurer2022TotalVotes);
  push("2020 General · Presidential", "2020-11-03", row.presidential2020TotalVotes);
  push("2018 General · Secretary of State", "2018-11-06", row.sos2018TotalVotes);
  push("2016 General · Presidential", "2016-11-08", row.presidential2016TotalVotes);

  return elections.sort((a, b) => b.electionDate.localeCompare(a.electionDate));
}

export function bundledRegisteredVotersEstimate(electionPlanSlug: string): number | null {
  const slug = electionPlanSlug.replace(/-county$/, "");
  const rollup = getCountyVoterFileRollup(slug);
  const active = rollup?.registration.active;
  return active != null && active > 0 ? active : null;
}

export function offlineEnrichmentWarnings(countyName: string): string[] {
  const warnings: string[] = [];
  if (findBundledElectionHistoryRow(countyName)) {
    warnings.push("Election history loaded from bundled Arkansas SOS JSON (offline).");
  } else {
    warnings.push("No bundled election history row for this county name.");
  }
  warnings.push(
    "Census ACS and BLS blocks require CountyPublicDemographics in the database — not available offline.",
  );
  warnings.push("Elected officials require CountyElectedOfficial DB rows — not available offline.");
  return warnings;
}
