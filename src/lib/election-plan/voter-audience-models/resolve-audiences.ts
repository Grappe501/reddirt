import {
  getVoterAudienceProfile,
  listVoterAudienceProfiles,
} from "@/lib/election-plan/voter-audience-models/load";
import type { VoterAudienceProfile } from "@/lib/election-plan/voter-audience-models/types";

function unique(ids: string[]): string[] {
  return [...new Set(ids)];
}

function resolve(ids: string[]): VoterAudienceProfile[] {
  return unique(ids)
    .map((id) => getVoterAudienceProfile(id))
    .filter((p): p is VoterAudienceProfile => Boolean(p));
}

/** Question bank category slugs → primary speak-to cast */
const CATEGORY_AUDIENCES: Record<string, string[]> = {
  "county-administration": ["carol-whitfield", "coach-pat-nolan", "linda-sutton"],
  "security-cyber": ["carol-whitfield", "frank-donnelly", "robert-kessler"],
  "elections-integrity": ["frank-donnelly", "carol-whitfield", "robert-kessler", "marcia-truman"],
  "three-way-race": ["paul-listener", "marcia-truman", "robert-kessler"],
  "business-services": ["robert-kessler", "marcia-truman", "carol-whitfield"],
  "voter-access": ["keisha-lyons", "tyler-martinez", "rev-james-holloway", "maria-gutierrez"],
  "current-record": ["marcia-truman", "carol-whitfield", "susan-ellis"],
  "office-role": ["marcia-truman", "susan-ellis", "paul-listener", "carol-whitfield"],
  "direct-democracy": ["diane-porter", "paul-listener", "tyler-martinez"],
  "opponent-record": ["marcia-truman", "diane-porter", "frank-donnelly"],
  "faith-community": ["rev-james-holloway", "coach-pat-nolan"],
  "delta-turnout": ["aisha-reed", "rev-james-holloway", "keisha-lyons"],
};

/** Trap lane IDs → who Kelly is pivoting toward */
const TRAP_LANE_AUDIENCES: Record<string, string[]> = {
  "2021-vs-2025-pivot": ["diane-porter", "carol-whitfield", "frank-donnelly", "marcia-truman"],
  "integrity-without-participation": ["carol-whitfield", "linda-sutton", "frank-donnelly", "keisha-lyons"],
  "county-champion": ["coach-pat-nolan", "linda-sutton", "carol-whitfield", "marcia-truman"],
  "fraud-data-dare": ["frank-donnelly", "susan-ellis", "bill-jennings", "robert-kessler"],
  "experience-equals-sos-ready": ["marcia-truman", "carol-whitfield", "robert-kessler", "paul-listener"],
  "culture-war-escalation": ["susan-ellis", "linda-sutton", "rev-james-holloway", "marcia-truman"],
};

/** Legislative intel pages */
const LEGISLATIVE_INTEL_AUDIENCES: Record<string, string[]> = {
  "2021-integrity": ["carol-whitfield", "frank-donnelly", "linda-sutton", "marcia-truman"],
  "2025-direct-democracy": ["diane-porter", "tyler-martinez", "paul-listener", "rev-james-holloway"],
};

/** Per-line speak-to for legislative practice lines */
const LEGISLATIVE_PRACTICE_LINE_AUDIENCES: Record<string, string[][]> = {
  "2021-integrity": [
    ["frank-donnelly", "carol-whitfield", "linda-sutton"],
    ["carol-whitfield", "coach-pat-nolan"],
    ["marcia-truman", "robert-kessler"],
    ["carol-whitfield", "diane-porter"],
  ],
  "2025-direct-democracy": [
    ["diane-porter", "paul-listener"],
    ["diane-porter", "rev-james-holloway", "tyler-martinez"],
    ["carol-whitfield", "coach-pat-nolan"],
    ["diane-porter", "frank-donnelly"],
  ],
};

export function resolveAudiencesForCategory(category: string): VoterAudienceProfile[] {
  return resolve(CATEGORY_AUDIENCES[category] ?? ["marcia-truman", "carol-whitfield"]);
}

export function resolveAudiencesForHooks(hooks: string[]): VoterAudienceProfile[] {
  const all = listVoterAudienceProfiles();
  const scored = new Map<string, number>();
  for (const hook of hooks) {
    for (const p of all) {
      if (p.debatePrepHooks.includes(hook)) {
        scored.set(p.id, (scored.get(p.id) ?? 0) + 2);
      }
    }
  }
  if (scored.size === 0) return resolve(["marcia-truman", "susan-ellis"]);
  return resolve(
    [...scored.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([id]) => id),
  );
}

export function resolveAudiencesForTrapLane(laneId: string): VoterAudienceProfile[] {
  return resolve(TRAP_LANE_AUDIENCES[laneId] ?? ["marcia-truman", "carol-whitfield", "linda-sutton"]);
}

export function resolveAudiencesForLegislativeIntel(pageId: string): VoterAudienceProfile[] {
  return resolve(LEGISLATIVE_INTEL_AUDIENCES[pageId] ?? ["marcia-truman", "carol-whitfield"]);
}

export function resolveAudiencesForLegislativePracticeLine(
  pageId: string,
  lineIndex: number,
): VoterAudienceProfile[] {
  const pageLines = LEGISLATIVE_PRACTICE_LINE_AUDIENCES[pageId];
  const ids = pageLines?.[lineIndex] ?? LEGISLATIVE_INTEL_AUDIENCES[pageId] ?? ["marcia-truman"];
  return resolve(ids);
}

export function resolveAudiencesForLocation(profileIds: string[]): VoterAudienceProfile[] {
  return resolve(profileIds);
}

export function primaryAudienceLabel(profiles: VoterAudienceProfile[]): string {
  if (!profiles.length) return "Arkansas voters";
  if (profiles.length === 1) return profiles[0]!.displayName;
  return `${profiles[0]!.displayName} + ${profiles.length - 1} more`;
}
