import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { findCityAliasMatches } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/city-county-alias-memory";
import { extractTitleCity } from "@/lib/travel-ledger/ai/trip-resolution-autopilot/title-city-extractor";
import { calculateCityRoute } from "./mileage";
import type {
  TravelLedgerAuditLogEntry,
  TravelLedgerInvoice,
  TravelLedgerItem,
  TravelLedgerSettings,
  TravelLedgerStorageMode,
  TravelLedgerWizardSession,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "travel-ledger");
const CALENDAR_ITEMS_PATH = path.join(process.cwd(), "data", "calendar-command-center", "calendar-items.normalized.json");
const LEDGER_PATH = path.join(DATA_DIR, "ledger-items.json");
const SESSIONS_PATH = path.join(DATA_DIR, "wizard-sessions.json");
const AUDIT_LOG_PATH = path.join(DATA_DIR, "audit-log.json");
const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");
const SEED_LEDGER_ITEM_ID = "seed-prescott-2026-05-15";

type NormalizedCalendarItem = {
  id?: string;
  title?: string;
  start?: string;
  county?: string;
  location?: string;
  eventType?: string;
  calendarStatus?: string;
  publishStatus?: string;
  notes?: string;
  overnightCity?: string;
  drillDown?: {
    anchorClassification?: string;
    travelRequirement?: string;
    spreadsheetTab?: string;
  };
};

export const TRAVEL_LEDGER_STORAGE_MODE: TravelLedgerStorageMode = "json-fallback";

const TITLE_PATTERN_CITY_MEMORY: Array<{ patterns: RegExp[]; city: string; note: string }> = [
  { patterns: [/\bhospital\b/i, /\buams\b/i, /\bchildren'?s\b/i], city: "Little Rock", note: "hospital / medical pattern" },
  { patterns: [/\bcapitol\b/i, /\bstate capitol\b/i], city: "Little Rock", note: "capitol pattern" },
  { patterns: [/\bdass\b/i, /\bdemocratic association of secretaries of state\b/i], city: "Little Rock", note: "DASS/statewide pattern" },
  { patterns: [/\bairbnb\b/i, /\bstay\s+magnolia\b/i], city: "Magnolia", note: "overnight stay pattern" },
  { patterns: [/\bstate convention\b/i], city: "Little Rock", note: "state convention default pattern" },
];

export async function getTravelLedgerStorageStatus() {
  return {
    mode: TRAVEL_LEDGER_STORAGE_MODE,
    label: "Storage mode: JSON fallback",
    directory: "data/travel-ledger",
    dbBacked: false,
  };
}

export async function loadLedgerItems(): Promise<TravelLedgerItem[]> {
  const settings = await loadTravelLedgerSettings();
  const savedItems = normalizeMileageRate(
    await readJson<TravelLedgerItem[]>(LEDGER_PATH, seedLedgerItems()),
    settings.mileageRate,
  );
  const calendarItems = normalizeMileageRate(await loadCalendarLedgerItems(), settings.mileageRate);
  if (!calendarItems.length) return savedItems;

  const savedWithoutPlaceholder = savedItems.filter((item) => item.id !== SEED_LEDGER_ITEM_ID);
  const calendarById = new Map(calendarItems.map((item) => [item.id, item]));
  const mergedSaved = savedWithoutPlaceholder.map((saved) => {
    const inferred = calendarById.get(saved.id);
    if (!inferred) return saved;
    calendarById.delete(saved.id);

    // Human override wins: once an operator has edited/classified/routed a row, do not replace it from calendar memory.
    if (
      saved.hasManualChanges ||
      saved.travelCities.length > 0 ||
      saved.classification !== "unknown" ||
      saved.reviewStatus !== "needs_review"
    ) {
      return saved;
    }

    return {
      ...inferred,
      reviewerInitials: saved.reviewerInitials,
      reviewerNote: saved.reviewerNote,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  });

  return [...mergedSaved, ...calendarById.values()].sort((a, b) => a.date.localeCompare(b.date));
}

function normalizeMileageRate(items: TravelLedgerItem[], mileageRate: number): TravelLedgerItem[] {
  return items.map((item) => ({
    ...item,
    mileageRate,
    reimbursementAmount: roundMoney(item.totalReimbursableMiles * mileageRate),
  }));
}

export async function saveLedgerItems(items: TravelLedgerItem[]): Promise<void> {
  await writeJson(LEDGER_PATH, items);
}

export async function loadWizardSessions(): Promise<TravelLedgerWizardSession[]> {
  return readJson<TravelLedgerWizardSession[]>(SESSIONS_PATH, []);
}

export async function saveWizardSessions(sessions: TravelLedgerWizardSession[]): Promise<void> {
  await writeJson(SESSIONS_PATH, sessions);
}

export async function getWizardSession(sessionId: string): Promise<TravelLedgerWizardSession | undefined> {
  return (await loadWizardSessions()).find((session) => session.id === sessionId);
}

export async function saveWizardSession(session: TravelLedgerWizardSession): Promise<void> {
  const sessions = await loadWizardSessions();
  await saveWizardSessions([session, ...sessions.filter((existing) => existing.id !== session.id)]);
}

export async function loadAuditLog(): Promise<TravelLedgerAuditLogEntry[]> {
  return readJson<TravelLedgerAuditLogEntry[]>(AUDIT_LOG_PATH, []);
}

export async function appendAuditLog(entry: TravelLedgerAuditLogEntry): Promise<void> {
  const log = await loadAuditLog();
  await writeJson(AUDIT_LOG_PATH, [entry, ...log].slice(0, 500));
}

export async function loadTravelLedgerSettings(): Promise<TravelLedgerSettings> {
  return readJson<TravelLedgerSettings>(SETTINGS_PATH, defaultSettings);
}

export async function saveTravelLedgerSettings(settings: TravelLedgerSettings): Promise<void> {
  await writeJson(SETTINGS_PATH, settings);
}

export async function buildInvoices(): Promise<TravelLedgerInvoice[]> {
  const items = await loadLedgerItems();
  const approved = items.filter((item) => item.approvalStatus === "approved" || item.approvalStatus === "approved_with_changes");
  const grouped = approved.reduce<Record<string, TravelLedgerItem[]>>((acc, item) => {
    acc[item.month] = [...(acc[item.month] ?? []), item];
    return acc;
  }, {});

  return Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, monthItems], index) => {
      const totalApprovedMiles = roundOne(monthItems.reduce((total, item) => total + item.totalReimbursableMiles, 0));
      const totalAmountDue = roundMoney(monthItems.reduce((total, item) => total + item.reimbursementAmount, 0));
      return {
        id: `invoice-${month}`,
        month,
        invoiceNumber: `KGSOS-TRAVEL-${String(index + 1).padStart(3, "0")}`,
        status: "ready",
        totalTrips: monthItems.length,
        totalApprovedMiles,
        totalAmountDue,
        generatedAt: new Date().toISOString(),
      };
    });
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`Travel ledger JSON read failed for ${path.basename(filePath)}:`, error);
    }
    await writeJson(filePath, fallback);
    return fallback;
  }
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

const defaultSettings: TravelLedgerSettings = {
  mileageRate: 0.7,
  rateLabel: "Campaign reimbursement mileage rate",
  effectiveDate: "2026-01-01",
  payeeName: "Kelly Grappe",
  billToName: "Kelly Grappe for Secretary of State",
  paymentTerms: "Campaign reimbursement review",
  memo: "Official invoice shows total miles only. Internal calculation remains in audit views.",
};

function seedLedgerItems(): TravelLedgerItem[] {
  const now = new Date().toISOString();
  return [
    {
      id: SEED_LEDGER_ITEM_ID,
      date: "2026-05-15",
      month: "2026-05",
      sourceType: "manual_entry",
      sourceTitles: ["Prescott county campaign meeting"],
      travelCities: [],
      routeText: "",
      baseRoundTripMiles: 0,
      driveAroundPct: 0.14,
      driveAroundMiles: 0,
      totalReimbursableMiles: 0,
      mileageRate: defaultSettings.mileageRate,
      reimbursementAmount: 0,
      businessPurpose: "Campaign travel pending city confirmation.",
      classification: "unknown",
      reviewStatus: "needs_review",
      approvalStatus: "not_approved",
      hasManualChanges: false,
      auditIssues: ["Needs campaign trip confirmation", "Needs city"],
      createdAt: now,
      updatedAt: now,
    },
  ];
}

async function loadCalendarLedgerItems(): Promise<TravelLedgerItem[]> {
  const calendarItems = await readJsonIfExists<NormalizedCalendarItem[]>(CALENDAR_ITEMS_PATH, []);
  const now = new Date().toISOString();
  const eligibleItems = calendarItems.filter(hasCalendarLedgerMinimum);
  return Promise.all(
    eligibleItems.map(async (item) => {
      const date = String(item.start).slice(0, 10);
      const travelRequirement = item.drillDown?.travelRequirement?.trim();
      const title = item.title?.trim() || "Calendar item";
      const location = item.location?.trim();
      const county = item.county?.trim();
      const inferredCity = inferCalendarTravelCity(item);
      const sourceDetails = [
        travelRequirement,
        county ? `${county} County` : undefined,
        item.eventType ? `type: ${item.eventType}` : undefined,
        item.calendarStatus ? `status: ${item.calendarStatus}` : undefined,
      ].filter(isPresentString);
      const baseItem: TravelLedgerItem = {
        id: `calendar-${item.id}`,
        date,
        month: date.slice(0, 7),
        sourceType: "calendar_import",
        sourceTitles: [title, ...sourceDetails],
        travelCities: inferredCity ? [{ city: inferredCity.city, state: "AR" }] : [],
        routeText: "",
        baseRoundTripMiles: 0,
        driveAroundPct: 0.14,
        driveAroundMiles: 0,
        totalReimbursableMiles: 0,
        mileageRate: defaultSettings.mileageRate,
        reimbursementAmount: 0,
        businessPurpose: location || item.notes || "Calendar import pending reimbursement review.",
        classification: "unknown",
        reviewStatus: inferredCity ? "needs_review" : "needs_location",
        approvalStatus: "not_approved",
        hasManualChanges: false,
        auditIssues: [
          "Imported from RedDirt calendar",
          inferredCity
            ? `City inferred from ${inferredCity.source}: ${inferredCity.city}`
            : "Ask human: city could not be inferred from title, memory, location, description, or place hints",
          "Needs campaign trip confirmation",
          ...(inferredCity ? [] : ["Needs city"]),
        ],
        createdAt: now,
        updatedAt: now,
      };

      if (!inferredCity) return baseItem;

      const route = await calculateCityRoute({
        itemId: baseItem.id,
        date: baseItem.date,
        cities: baseItem.travelCities,
        mileageRate: baseItem.mileageRate,
      });

      return {
        ...baseItem,
        travelCities: route.travelCities,
        routeText: route.routeText,
        baseRoundTripMiles: route.baseRoundTripMiles,
        driveAroundPct: route.driveAroundPct,
        driveAroundMiles: route.driveAroundMiles,
        totalReimbursableMiles: route.totalReimbursableMiles,
        reimbursementAmount: route.reimbursementAmount,
      } satisfies TravelLedgerItem;
    }),
  );
}

function inferCalendarTravelCity(item: NormalizedCalendarItem): { city: string; source: string } | null {
  const title = item.title ?? "";
  const titleDirect = extractTitleCity(title);
  if (titleDirect.city && titleDirect.source !== "none") {
    return { city: titleDirect.city, source: titleDirect.source };
  }

  const memoryInput = [title, item.overnightCity, item.drillDown?.anchorClassification, item.drillDown?.travelRequirement]
    .filter(isPresentString)
    .join(" ");
  const memoryMatch = matchPatternCityMemory(memoryInput);
  if (memoryMatch) return memoryMatch;

  const locationMatch = matchKnownCity(item.location ?? "");
  if (locationMatch) return { city: locationMatch, source: "calendar location field" };

  const descriptionMatch = matchKnownCity([item.notes, item.drillDown?.travelRequirement].filter(isPresentString).join(" "));
  if (descriptionMatch) return { city: descriptionMatch, source: "event description" };

  const placeHintMatch = matchKnownCity([item.location, item.notes, item.overnightCity].filter(isPresentString).join(" "));
  if (placeHintMatch) return { city: placeHintMatch, source: "Google Maps/place search hint" };

  return null;
}

function matchKnownCity(text: string): string | null {
  return findCityAliasMatches(text).filter((match) => match.entry.city !== "Rose Bud")[0]?.entry.city ?? null;
}

function matchPatternCityMemory(text: string): { city: string; source: string } | null {
  for (const entry of TITLE_PATTERN_CITY_MEMORY) {
    if (entry.patterns.some((pattern) => pattern.test(text))) {
      return { city: entry.city, source: `event title pattern/memory match (${entry.note})` };
    }
  }
  return null;
}

function hasCalendarLedgerMinimum(
  item: NormalizedCalendarItem,
): item is NormalizedCalendarItem & { id: string; start: string; title: string } {
  return Boolean(item.id && item.start && item.title);
}

function isPresentString(value: string | undefined): value is string {
  return Boolean(value);
}

async function readJsonIfExists<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`Travel ledger calendar JSON read failed for ${path.basename(filePath)}:`, error);
    }
    return fallback;
  }
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
