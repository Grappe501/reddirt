/**
 * Phase 1 Evidence Workbench desks + legacy tab aliases.
 * Prefer Unknown. One job per desk.
 */

export const EVIDENCE_DESK_TABS = [
  { id: "ingest", label: "Intake" },
  { id: "identify", label: "Identify" },
  { id: "county", label: "County" },
  { id: "edit", label: "Edit" },
  { id: "publish", label: "Publish" },
  { id: "calendar", label: "Calendar" },
] as const;

export type EvidenceDeskTabId = (typeof EVIDENCE_DESK_TABS)[number]["id"];

/** Old Round A–C tab ids → Phase 1 desks. */
const LEGACY_TAB_TO_DESK: Record<string, EvidenceDeskTabId> = {
  ingest: "ingest",
  identify: "identify",
  county: "county",
  edit: "edit",
  publish: "publish",
  calendar: "calendar",
  queue: "county",
  ship: "publish",
  placement: "publish",
  photos: "identify",
  speeches: "identify",
};

export function resolveEvidenceDeskTab(
  rawTab: string | undefined,
  filter?: string | undefined,
): EvidenceDeskTabId {
  const tab = String(rawTab ?? "").trim();
  const f = String(filter ?? "").trim();

  if (tab === "photos" && (f === "needsPromote" || f === "homepage" || f === "approved")) {
    return "edit";
  }
  if (tab === "speeches" && (f === "cuts" || f === "edit" || f === "proEdit")) {
    return "edit";
  }
  if (tab === "placement" || tab === "ship") return "publish";
  if (tab === "queue") return "county";

  if ((EVIDENCE_DESK_TABS as readonly { id: string }[]).some((t) => t.id === tab)) {
    return tab as EvidenceDeskTabId;
  }

  return LEGACY_TAB_TO_DESK[tab] ?? "identify";
}

/** Canonical href helpers for deep links after Phase 1. */
export function evidenceDeskHref(input: {
  tab: EvidenceDeskTabId;
  id?: string;
  filter?: string;
  intent?: string;
}): string {
  const sp = new URLSearchParams();
  sp.set("tab", input.tab);
  if (input.id) sp.set("id", input.id);
  if (input.filter) sp.set("filter", input.filter);
  if (input.intent) sp.set("intent", input.intent);
  return `/admin/evidence-workbench?${sp.toString()}`;
}
