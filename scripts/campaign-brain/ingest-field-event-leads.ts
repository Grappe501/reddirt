/**
 * Ingest field event leads → festival-leads.verified.json + activation queue.
 *
 * Usage:
 *   npm run campaign-brain:ingest:field-events
 *   npm run campaign-brain:ingest:field-events -- --dry-run
 *
 * Source: data/campaign-brain/field-event-leads.raw.txt (paste batches)
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import {
  dedupeKey,
  mergeLeads,
  normalizeName,
  parseCampaignCalendarLines,
  parseCountyFairLines,
  parseEncyclopediaMonthLists,
  parseFestivalIndexBlocks,
  parseFestivalIndexAlt,
  parseLittleRockAnnualEvents,
  parseVendorFairBlocks,
  slugId,
  type IngestLead,
} from "./lib/field-event-ingest-parsers";

const ROOT = process.cwd();
const CAL = path.join(ROOT, "data/calendar-command-center");
const BRAIN_DATA = path.join(ROOT, "data/campaign-brain");
const RAW = path.join(BRAIN_DATA, "field-event-leads.raw.txt");
const FESTIVAL_LEADS = path.join(CAL, "festival-leads.verified.json");
const QUEUE = path.join(BRAIN_DATA, "festival-activation-queue.json");
const REPORT = path.join(ROOT, "docs/campaign-brain/people-power/mobilize/festival-activation-queue.md");

type FestivalLead = {
  id: string;
  date: string | null;
  dateEnd?: string | null;
  eventName: string;
  city?: string;
  county: string;
  venue?: string;
  source: string;
  vendorTypes?: string;
  category?: string;
  reconcileStatus: string;
  spreadsheetNotes?: string;
};

function loadExisting(): FestivalLead[] {
  if (!existsSync(FESTIVAL_LEADS)) return [];
  return JSON.parse(readFileSync(FESTIVAL_LEADS, "utf8")) as FestivalLead[];
}

function existingKey(lead: FestivalLead): string {
  return `${normalizeName(lead.eventName)}|${(lead.city ?? "").toLowerCase()}|${lead.date ?? ""}`;
}

function dedupeFestivalLeads(leads: FestivalLead[]): FestivalLead[] {
  const map = new Map<string, FestivalLead>();
  for (const lead of leads) {
    const key = `${normalizeName(lead.eventName)}|${(lead.city ?? "").toLowerCase()}|${lead.date ?? ""}`;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, lead);
      continue;
    }
    const score = (l: FestivalLead) =>
      (l.venue ? 1 : 0) + (l.county ? 1 : 0) + (l.reconcileStatus === "field_ingest_web_date" ? 2 : 0);
    map.set(key, score(lead) >= score(prev) ? lead : prev);
  }
  return [...map.values()].sort((a, b) => (a.date ?? "9999-12-31").localeCompare(b.date ?? "9999-12-31"));
}

function toFestivalLead(lead: IngestLead): FestivalLead {
  const status = lead.startDate ? "field_ingest_pending" : "date_missing";
  return {
    id: slugId(lead.eventName, lead.startDate, lead.city),
    date: lead.startDate,
    dateEnd: lead.endDate,
    eventName: lead.eventName,
    city: lead.city,
    county: lead.county,
    venue: lead.venue,
    source: lead.source,
    vendorTypes: lead.vendorTypes,
    category: lead.category,
    reconcileStatus: status,
    spreadsheetNotes: lead.startDate
      ? `Field ingest ${new Date().toISOString().slice(0, 10)} — verify date and Mobilize link`
      : "Date missing — research official schedule before Mobilize publish",
  };
}

function parseAll(raw: string): IngestLead[] {
  return mergeLeads(
    parseVendorFairBlocks(raw),
    parseCountyFairLines(raw),
    parseCampaignCalendarLines(raw),
    parseFestivalIndexBlocks(raw),
    parseFestivalIndexAlt(raw),
    parseEncyclopediaMonthLists(raw),
    parseLittleRockAnnualEvents(raw),
  );
}

/** Verified 2026 dates from official sources — applied to date_missing rows on each ingest run */
const KNOWN_2026: Array<{
  test: (name: string) => boolean;
  start: string;
  end?: string;
  sourceNote: string;
}> = [
  {
    test: (n) => /arkansas comic con/i.test(n),
    start: "2026-09-18",
    end: "2026-09-20",
    sourceNote: "https://www.arkansascomiccon.com/faq",
  },
  {
    test: (n) => /big dam bridge 100/i.test(n),
    start: "2026-09-26",
    sourceNote: "https://www.thebigdambridge100.com/event-info/registration-information",
  },
  {
    test: (n) => /six bridges book festival/i.test(n),
    start: "2026-09-27",
    end: "2026-10-04",
    sourceNote: "https://sixbridgesbookfestival.org/",
  },
  {
    test: (n) => /arkansas cornbread festival/i.test(n),
    start: "2026-11-07",
    sourceNote: "https://www.littlerocksoiree.com/arkansas-cornbread-festival-returns-to-soma/",
  },
  {
    test: (n) => /^juneteenth$/i.test(n) || /juneteenth in little rock/i.test(n),
    start: "2026-06-19",
    sourceNote: "Juneteenth federal observance",
  },
  {
    test: (n) => /little rock marathon/i.test(n),
    start: "2026-03-01",
    sourceNote: "https://www.littlerock.com/events/annual-festivals-events/little-rock-marathon/",
  },
  {
    test: (n) => /johnson county peach festival/i.test(n),
    start: "2026-07-16",
    end: "2026-07-18",
    sourceNote: "Arkansas county fair schedule 2026",
  },
  {
    test: (n) => /bean fest/i.test(n) && /outhouse|mountain view/i.test(n),
    start: "2026-10-23",
    end: "2026-10-24",
    sourceNote: "Mountain View Bean Fest Artisans Market listing",
  },
];

function resolveKnownDates(leads: FestivalLead[]): { resolved: number; leads: FestivalLead[] } {
  let resolved = 0;
  const out = leads.map((lead) => {
    let eventName = lead.eventName.replace(/Little Rock MarathonLittle Rock Marathon/i, "Little Rock Marathon");
    if (lead.date) return eventName === lead.eventName ? lead : { ...lead, eventName };

    for (const known of KNOWN_2026) {
      if (!known.test(eventName)) continue;
      resolved++;
      return {
        ...lead,
        eventName,
        date: known.start,
        dateEnd: known.end ?? lead.dateEnd,
        reconcileStatus: "field_ingest_web_date",
        spreadsheetNotes: `Date from ${known.sourceNote} — field verify before Mobilize`,
        source: lead.source.includes("web") ? lead.source : `${lead.source}; ${known.sourceNote}`,
      };
    }
    return eventName === lead.eventName ? lead : { ...lead, eventName };
  });
  return { resolved, leads: out };
}

function writeQueue(all: FestivalLead[]) {
  const withDates = all.filter((e) => e.date);
  const missing = all.filter((e) => !e.date);
  writeFileSync(
    QUEUE,
    JSON.stringify(
      {
        version: 1,
        generatedAt: new Date().toISOString(),
        total: all.length,
        withDates: withDates.length,
        dateMissing: missing.length,
        events: all.map((e) => ({
          id: e.id,
          eventName: e.eventName,
          date: e.date,
          dateEnd: e.dateEnd ?? null,
          city: e.city ?? "",
          county: e.county,
          mobilizeUrl: "",
          reconcileStatus: e.reconcileStatus,
        })),
      },
      null,
      2,
    ),
    "utf8",
  );
}

function writeReport(added: number, skipped: number, total: number, missingDates: number) {
  mkdirSync(path.dirname(REPORT), { recursive: true });
  const queue = JSON.parse(readFileSync(QUEUE, "utf8")) as {
    events: Array<{ eventName: string; date: string | null; county: string; city: string }>;
  };

  const upcoming = queue.events
    .filter((e) => e.date)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""))
    .slice(0, 40);

  writeFileSync(
    REPORT,
    `# Festival Activation Queue

> People Power · Brain event → Mobilize → volunteers → Substack story

Updated: ${new Date().toISOString().slice(0, 10)}

| Metric | Count |
| ------ | ----: |
| Total festival leads | **${total}** |
| New this ingest | ${added} |
| Skipped (duplicate) | ${skipped} |
| With dates | ${total - missingDates} |
| Date missing | ${missingDates} |

---

## Next 40 dated events

| Date | Event | City | County |
| ---- | ----- | ---- | ------ |
${upcoming.map((e) => `| ${e.date} | ${e.eventName} | ${e.city} | ${e.county} |`).join("\n")}

---

## Workflow

1. Verify date in Calendar Truth workbench
2. Create Mobilize event → log [\`mobilize-events.json\`](../../../data/campaign-brain/mobilize-events.json)
3. Assign county strike team → publish Substack story after

Data: [\`festival-activation-queue.json\`](../../../data/campaign-brain/festival-activation-queue.json)
`,
    "utf8",
  );
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  if (!existsSync(RAW)) {
    console.error(`Missing ${RAW} — paste event batches and re-run.`);
    process.exit(1);
  }

  const raw = readFileSync(RAW, "utf8");
  const parsed = parseAll(raw);
  const existing = loadExisting();
  const existingKeys = new Set(existing.map(existingKey));

  let added = 0;
  let skipped = 0;
  const merged = [...existing];

  for (const lead of parsed) {
    const fl = toFestivalLead(lead);
    const key = existingKey(fl);
    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }
    // Also skip if same normalized name+city with any date already present
    const nearDup = merged.find(
      (e) =>
        normalizeName(e.eventName) === normalizeName(fl.eventName) &&
        (e.city ?? "").toLowerCase() === (fl.city ?? "").toLowerCase() &&
        e.date &&
        fl.date &&
        e.date === fl.date,
    );
    if (nearDup) {
      skipped++;
      continue;
    }
    merged.push(fl);
    existingKeys.add(key);
    added++;
  }

  merged.sort((a, b) => (a.date ?? "9999-12-31").localeCompare(b.date ?? "9999-12-31"));

  const { resolved: datesResolved, leads: withDates } = resolveKnownDates(merged);
  const finalLeads = dedupeFestivalLeads(withDates);
  const missingDates = finalLeads.filter((e) => !e.date).length;

  if (!dryRun) {
    writeFileSync(FESTIVAL_LEADS, JSON.stringify(finalLeads, null, 2), "utf8");
    writeQueue(finalLeads);
    writeReport(added, skipped, finalLeads.length, missingDates);
  }

  // eslint-disable-next-line no-console
  console.log(
    `Field event ingest: parsed ${parsed.length} · added ${added} · skipped ${skipped} · total ${finalLeads.length} (${missingDates} missing dates, ${datesResolved} web-resolved)${dryRun ? " [dry-run]" : ""}`,
  );
}

main();
