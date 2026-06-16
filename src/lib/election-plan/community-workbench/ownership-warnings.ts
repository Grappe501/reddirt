import type {
  CommunityWorkbenchCommitteeRow,
  CommunityWorkbenchEventRow,
  CommunityWorkbenchLeadershipRow,
} from "./types";

export type CommunityOwnershipWarning =
  | {
      kind: "no_community_lead";
      message: string;
    }
  | {
      kind: "event_no_lead";
      eventId: string;
      eventTitle: string;
      message: string;
    }
  | {
      kind: "committee_no_members";
      committeeId: string;
      committeeName: string;
      message: string;
    };

function parseCommitteeMembers(membersJson: string | null): string[] {
  if (!membersJson?.trim()) return [];
  try {
    const parsed = JSON.parse(membersJson) as unknown;
    if (Array.isArray(parsed)) {
      return parsed
        .map((m) => {
          if (typeof m === "string") return m.trim();
          if (m && typeof m === "object" && "name" in m && typeof (m as { name: unknown }).name === "string") {
            return (m as { name: string }).name.trim();
          }
          return "";
        })
        .filter(Boolean);
    }
  } catch {
    // fall through
  }
  return membersJson
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function collectOwnershipWarnings(input: {
  workbenchName: string;
  leadership: CommunityWorkbenchLeadershipRow[];
  events: CommunityWorkbenchEventRow[];
  committees: CommunityWorkbenchCommitteeRow[];
}): CommunityOwnershipWarning[] {
  const warnings: CommunityOwnershipWarning[] = [];

  const communityLead = input.leadership.find((l) => l.roleKey === "community_lead");
  if (!communityLead?.personName?.trim()) {
    warnings.push({
      kind: "no_community_lead",
      message: `${input.workbenchName} has no Community Lead assigned.`,
    });
  }

  for (const ev of input.events) {
    if (ev.status === "cancelled") continue;
    if (!ev.leadName?.trim()) {
      warnings.push({
        kind: "event_no_lead",
        eventId: ev.id,
        eventTitle: ev.title,
        message: `Event "${ev.title}" has no event lead.`,
      });
    }
  }

  for (const c of input.committees) {
    const members = parseCommitteeMembers(c.membersJson);
    if (members.length === 0) {
      warnings.push({
        kind: "committee_no_members",
        committeeId: c.id,
        committeeName: c.name,
        message: `Committee "${c.name}" has no members listed.`,
      });
    }
  }

  return warnings;
}

export function readinessBand(pct: number): "green" | "yellow" | "red" {
  if (pct >= 67) return "green";
  if (pct >= 34) return "yellow";
  return "red";
}

export function readinessBandLabel(band: "green" | "yellow" | "red"): string {
  if (band === "green") return "Green";
  if (band === "yellow") return "Yellow";
  return "Red";
}
