import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  TravelLedgerAuditLogEntry,
  TravelLedgerInvoice,
  TravelLedgerItem,
  TravelLedgerSettings,
  TravelLedgerStorageMode,
  TravelLedgerWizardSession,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "travel-ledger");
const LEDGER_PATH = path.join(DATA_DIR, "ledger-items.json");
const SESSIONS_PATH = path.join(DATA_DIR, "wizard-sessions.json");
const AUDIT_LOG_PATH = path.join(DATA_DIR, "audit-log.json");
const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");

export const TRAVEL_LEDGER_STORAGE_MODE: TravelLedgerStorageMode = "json-fallback";

export async function getTravelLedgerStorageStatus() {
  return {
    mode: TRAVEL_LEDGER_STORAGE_MODE,
    label: "Storage mode: JSON fallback",
    directory: "data/travel-ledger",
    dbBacked: false,
  };
}

export async function loadLedgerItems(): Promise<TravelLedgerItem[]> {
  return readJson<TravelLedgerItem[]>(LEDGER_PATH, seedLedgerItems());
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
  mileageRate: 0.67,
  rateLabel: "2024 IRS standard mileage rate",
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
      id: "seed-prescott-2026-05-15",
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

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
