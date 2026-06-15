/**
 * Build verification records for all community + festival events.
 */

import path from "node:path";

import { readJson, loadCommunityEvents, loadFestivalLeads } from "./inputs";
import {
  classifyEventVerification,
  type EventVerificationRecord,
  type EventVerificationStatus,
} from "./event-verification";

type FestivalLead = {
  id?: string;
  eventName: string;
  county: string;
  date?: string;
  reconcileStatus?: string;
};

type OverrideFile = {
  overrides: Record<string, { status: EventVerificationStatus; date?: string; notes?: string }>;
};

function festivalNameMatchesEvent(eventTitle: string, eventType: string, festivalName: string): boolean {
  const et = eventTitle.toLowerCase();
  const fn = festivalName.toLowerCase();
  if (eventType === "county_fair" && !fn.includes("fair") && !fn.includes("fest")) return false;
  if (et === fn) return true;
  const etCore = et.replace(/\s*\(.*\)$/, "").trim();
  if (fn.includes(etCore) || etCore.includes(fn)) return true;
  const significant = et.split(/\s+/).filter((w) => w.length > 4 && !["county", "verify", "local"].includes(w));
  return significant.filter((w) => fn.includes(w)).length >= 2;
}

export function buildEventVerificationMap(): {
  byEventId: Map<string, EventVerificationRecord>;
  records: EventVerificationRecord[];
  festivalDates: Map<string, string>;
} {
  const events = loadCommunityEvents();
  const festivalLeads = loadFestivalLeads() as FestivalLead[];
  const overrides =
    readJson<OverrideFile>(path.join(process.cwd(), "data/campaign-brain/event-verification-overrides.json"))
      ?.overrides ?? {};

  const festivalDates = new Map<string, string>();
  for (const f of festivalLeads) {
    if (!f.date) continue;
    const match = events.find(
      (e) => e.county === f.county && festivalNameMatchesEvent(e.title, e.type, f.eventName),
    );
    if (match) festivalDates.set(match.id, f.date);
  }

  const records: EventVerificationRecord[] = events.map((e) => {
    const override = overrides[e.id];
    const confirmedDate = festivalDates.get(e.id) ?? override?.date ?? null;
    return classifyEventVerification({
      eventId: e.id,
      rawVerificationStatus: e.verificationStatus,
      confirmedDate,
      overrideStatus: override?.status,
    });
  });

  // Festival-only leads not in community inventory
  for (let i = 0; i < festivalLeads.length; i++) {
    const f = festivalLeads[i];
    const id = f.id ?? `fest-lead-${i}`;
    if (records.some((r) => r.eventId === id)) continue;
    records.push(
      classifyEventVerification({
        eventId: id,
        rawVerificationStatus: f.reconcileStatus,
        reconcileStatus: f.reconcileStatus,
        confirmedDate: f.date ?? null,
        overrideStatus: overrides[id]?.status,
      }),
    );
  }

  const byEventId = new Map(records.map((r) => [r.eventId, r]));
  return { byEventId, records, festivalDates };
}

export function getVerificationForEvent(
  eventId: string,
  rawStatus?: string,
  map?: Map<string, EventVerificationRecord>,
): EventVerificationRecord {
  const existing = map?.get(eventId);
  if (existing) return existing;
  return classifyEventVerification({ eventId, rawVerificationStatus: rawStatus });
}
