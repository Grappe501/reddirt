import type { CommunityWorkbenchKind } from "@prisma/client";

import type { FieldEntryLocationSummary } from "@/lib/election-plan/field-entry/types";
import type { CoalitionWorkbenchProfile } from "./load-coalition-workbench-profile";
import type { SmosWorkbenchProfile } from "./load-smos-workbench-profile";
import type { CchWorkbenchProfile } from "./load-cch-workbench-profile";
import type { VoteCushionView } from "./vote-cushion";

export type CommunityWorkbenchRegistryEntry = {
  slug: string;
  name: string;
  kind: CommunityWorkbenchKind;
  countySlug: string | null;
  citySlug: string | null;
  kpiTemplate: string;
  tagline: string | null;
  population: number | null;
};

export type CommunityWorkbenchLeadershipRow = {
  roleKey: string;
  roleLabel: string;
  personName: string | null;
  contact: string | null;
  notes: string | null;
  operatorInitials: string | null;
};

export type CommunityWorkbenchMissionRow = {
  id: string;
  title: string;
  status: string;
  priority: number;
  operatorInitials: string | null;
};

export type CommunityWorkbenchCommitteeRow = {
  id: string;
  name: string;
  goals: string | null;
  membersJson: string | null;
  notes: string | null;
  operatorInitials: string | null;
};

export type CommunityWorkbenchEventRow = {
  id: string;
  title: string;
  eventDate: string | null;
  location: string | null;
  expectedAttendance: number | null;
  actualAttendance: number | null;
  leadName: string | null;
  status: string;
  committeeId: string | null;
  committeeName: string | null;
  runOfShow: Array<{ time: string; label: string; owner?: string }>;
  assignments: Array<{ role: string; assignee: string; notes?: string }>;
  documents: Array<{ label: string; url?: string }>;
  aarBody: string | null;
  operatorInitials: string | null;
  updatedAt: string;
};

export type CommunityWorkbenchIntelRow = {
  id: string;
  sectionKey: string;
  title: string;
  body: string;
  operatorInitials: string | null;
};

export type CommunityWorkbenchRelationshipRow = {
  id: string;
  personName: string;
  roleLabel: string | null;
  strength: number;
  lastContact: string | null;
  nextFollowUp: string | null;
  knowsWho: string | null;
  notes: string | null;
  operatorInitials: string | null;
};

export type CommunityWorkbenchNoteRow = {
  id: string;
  noteType: string;
  title: string;
  body: string;
  operatorInitials: string | null;
  createdAt: string;
};

export type CommunityReadinessDimension = {
  key: string;
  label: string;
  pct: number;
};

export type CommunityWorkbenchView = {
  id: string;
  slug: string;
  name: string;
  kind: CommunityWorkbenchKind;
  countySlug: string | null;
  citySlug: string | null;
  countyName: string | null;
  tagline: string | null;
  population: number | null;
  kpiTemplate: string;
  /** Record-backed counts only — Principle 1 */
  recordCounts: Array<{
    key: string;
    label: string;
    count: number;
    drillAnchor: string;
    drillLabel: string;
  }>;
  /** Strategic plan targets — not live counts; Principle 1 separation */
  planningGoals: Array<{
    key: string;
    label: string;
    target: number;
    source: string;
    unit?: string;
  }>;
  /** @deprecated — use recordCounts */
  kpiMetrics: Array<{ key: string; label: string; target?: number; current?: number }>;
  leadership: CommunityWorkbenchLeadershipRow[];
  missions: CommunityWorkbenchMissionRow[];
  committees: CommunityWorkbenchCommitteeRow[];
  events: CommunityWorkbenchEventRow[];
  intel: CommunityWorkbenchIntelRow[];
  relationships: CommunityWorkbenchRelationshipRow[];
  notes: CommunityWorkbenchNoteRow[];
  fieldEntry: FieldEntryLocationSummary;
  readiness: {
    dimensions: CommunityReadinessDimension[];
    overallPct: number;
  };
  /** Snapshot context when workbench maps to a priority city */
  voteTarget?: number;
  voteGain?: number;
  voteCushion?: VoteCushionView;
  /** Coalition workbench cultural framework (slots — local leaders fill content) */
  coalitionProfile?: CoalitionWorkbenchProfile;
  /** Social Media OS workbench framework */
  smosProfile?: SmosWorkbenchProfile;
  /** Campaign Communications Hub workbench framework */
  cchProfile?: CchWorkbenchProfile;
};

export type CommunityWorkbenchSearchHit = {
  slug: string;
  name: string;
  kind: CommunityWorkbenchKind;
  countySlug: string | null;
  tagline: string | null;
  href: string;
  score: number;
};

export type CommunityWorkbenchDeepSearchHit = {
  slug: string;
  name: string;
  kind: CommunityWorkbenchKind;
  href: string;
  score: number;
  matchKind: "workbench" | "leadership" | "committee" | "event" | "relationship" | "notebook";
  matchLabel: string;
  excerpt: string;
};

export type CommunityWorkbenchHubSummary = {
  slug: string;
  name: string;
  kind: CommunityWorkbenchKind;
  countySlug: string | null;
  tagline: string | null;
  communityLead: string | null;
  hasOwner: boolean;
  hasUpcomingEvent: boolean;
  readinessPct: number;
  readinessBand: "green" | "yellow" | "red";
  warningCount: number;
};
