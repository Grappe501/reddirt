import { randomUUID } from "node:crypto";
import {
  appendAuditLog,
  getWizardSession,
  loadLedgerItems,
  loadTravelLedgerSettings,
  loadWizardSessions,
  saveLedgerItems,
  saveWizardSession,
} from "./storage";
import { calculateCityRoute } from "./mileage";
import type { TravelCity, TravelLedgerItem, TravelLedgerWizardSession } from "./types";

export async function createTravelLedgerWizardSession(input: {
  reviewerInitials: string;
  reviewerName?: string;
  startDate: string;
  endDate: string;
}): Promise<TravelLedgerWizardSession> {
  const now = new Date().toISOString();
  const items = (await loadLedgerItems()).filter((item) => item.date >= input.startDate && item.date <= input.endDate);
  const itemIds = items.map((item) => item.id);
  const session: TravelLedgerWizardSession = {
    id: randomUUID(),
    title: `${input.startDate} to ${input.endDate}`,
    reviewerInitials: normalizeInitials(input.reviewerInitials),
    reviewerName: input.reviewerName?.trim() || undefined,
    startDate: input.startDate,
    endDate: input.endDate,
    status: "in_progress",
    itemIds,
    completedItemIds: [],
    skippedItemIds: [],
    needsMoreInfoItemIds: [],
    currentItemId: itemIds[0],
    createdAt: now,
    updatedAt: now,
  };
  await saveWizardSession(session);
  await appendAuditLog({
    id: randomUUID(),
    itemId: session.id,
    action: "wizard_session_created",
    after: session,
    note: `Wizard session created for ${input.startDate} to ${input.endDate}.`,
    actor: session.reviewerInitials,
    actorInitials: session.reviewerInitials,
    createdAt: now,
  });
  return session;
}

export async function getNextWizardItem(session: TravelLedgerWizardSession, currentItemId?: string): Promise<string | undefined> {
  const cleared = new Set([...session.completedItemIds, ...session.skippedItemIds, ...session.needsMoreInfoItemIds, currentItemId].filter(Boolean));
  return session.itemIds.find((itemId) => !cleared.has(itemId));
}

export async function getTravelLedgerDashboard() {
  const [items, sessions, settings] = await Promise.all([loadLedgerItems(), loadWizardSessions(), loadTravelLedgerSettings()]);
  const approvedItems = items.filter((item) => item.approvalStatus === "approved" || item.approvalStatus === "approved_with_changes");
  return {
    items,
    sessions,
    settings,
    itemsNeedingReview: items.filter((item) => item.reviewStatus === "needs_review" || item.reviewStatus === "needs_location").length,
    readyToApprove: items.filter((item) => item.reviewStatus === "ready_for_approval" && item.approvalStatus === "not_approved").length,
    missingCities: items.filter((item) => !item.travelCities.length && item.classification !== "virtual" && item.classification !== "personal").length,
    approvedMiles: roundOne(approvedItems.reduce((total, item) => total + item.totalReimbursableMiles, 0)),
    approvedAmount: roundMoney(approvedItems.reduce((total, item) => total + item.reimbursementAmount, 0)),
  };
}

export async function addManualTravelLedgerItem(input: {
  date: string;
  title: string;
  isCampaignTravel: boolean;
  cities: TravelCity[];
  businessPurpose: string;
  reviewerInitials: string;
  notes?: string;
}): Promise<TravelLedgerItem> {
  const now = new Date().toISOString();
  const settings = await loadTravelLedgerSettings();
  const item: TravelLedgerItem = {
    id: randomUUID(),
    date: input.date,
    month: input.date.slice(0, 7),
    sourceType: "manual_entry",
    sourceTitles: [input.title.trim() || "Manual missed trip"],
    travelCities: [],
    routeText: "",
    baseRoundTripMiles: 0,
    driveAroundPct: 0.14,
    driveAroundMiles: 0,
    totalReimbursableMiles: 0,
    mileageRate: settings.mileageRate,
    reimbursementAmount: 0,
    businessPurpose: input.businessPurpose.trim(),
    classification: input.isCampaignTravel ? "campaign_travel" : "personal",
    reviewStatus: input.isCampaignTravel ? "needs_location" : "denied",
    approvalStatus: "not_approved",
    reviewerInitials: normalizeInitials(input.reviewerInitials),
    reviewerNote: input.notes?.trim(),
    hasManualChanges: true,
    auditIssues: input.isCampaignTravel ? ["Manual entry needs city/mileage confirmation"] : ["Manual entry excluded as non-campaign travel"],
    createdAt: now,
    updatedAt: now,
  };
  const calculated = input.isCampaignTravel && input.cities.length ? await applyRoute(item, input.cities) : item;
  const items = await loadLedgerItems();
  await saveLedgerItems([calculated, ...items]);
  await appendAuditLog({
    id: randomUUID(),
    itemId: calculated.id,
    action: "manual_trip_created",
    after: calculated,
    note: "Manual missed trip created from admin travel ledger.",
    actor: calculated.reviewerInitials || "admin",
    actorInitials: calculated.reviewerInitials,
    createdAt: now,
  });
  return calculated;
}

export async function updateTravelLedgerItem(
  itemId: string,
  updater: (item: TravelLedgerItem, session?: TravelLedgerWizardSession) => Promise<TravelLedgerItem> | TravelLedgerItem,
  options: { sessionId?: string; action?: "wizard_item_saved" | "approved" | "denied" | "needs_more_info" | "manual_trip_modified"; note?: string } = {},
): Promise<TravelLedgerItem | undefined> {
  const items = await loadLedgerItems();
  const index = items.findIndex((item) => item.id === itemId);
  if (index < 0) return undefined;
  const before = items[index];
  const session = options.sessionId ? await getWizardSession(options.sessionId) : undefined;
  const after = await updater(before, session);
  items[index] = { ...after, updatedAt: new Date().toISOString() };
  await saveLedgerItems(items);
  await appendAuditLog({
    id: randomUUID(),
    itemId,
    action: options.action ?? "wizard_item_saved",
    before,
    after: items[index],
    note: options.note,
    actor: session?.reviewerInitials || items[index].reviewerInitials || "admin",
    actorInitials: session?.reviewerInitials || items[index].reviewerInitials,
    createdAt: new Date().toISOString(),
  });
  return items[index];
}

export async function applyRoute(item: TravelLedgerItem, cities: TravelCity[], driveAroundMilesOverride?: number): Promise<TravelLedgerItem> {
  const route = await calculateCityRoute({
    itemId: item.id,
    date: item.date,
    cities,
    mileageRate: item.mileageRate,
    driveAroundMilesOverride,
  });
  return {
    ...item,
    travelCities: route.travelCities,
    routeText: route.routeText,
    baseRoundTripMiles: route.baseRoundTripMiles,
    driveAroundPct: route.driveAroundPct,
    driveAroundMiles: route.driveAroundMiles,
    driveAroundMilesOverride,
    totalReimbursableMiles: route.totalReimbursableMiles,
    reimbursementAmount: route.reimbursementAmount,
    reviewStatus: "ready_for_approval",
    approvalStatus: "not_approved",
    auditIssues: [],
    hasManualChanges: true,
  };
}

export async function markWizardItem(sessionId: string, itemId: string, bucket: "completedItemIds" | "skippedItemIds" | "needsMoreInfoItemIds") {
  const session = await getWizardSession(sessionId);
  if (!session) return undefined;
  const nextSession: TravelLedgerWizardSession = {
    ...session,
    completedItemIds: session.completedItemIds.filter((id) => id !== itemId),
    skippedItemIds: session.skippedItemIds.filter((id) => id !== itemId),
    needsMoreInfoItemIds: session.needsMoreInfoItemIds.filter((id) => id !== itemId),
    updatedAt: new Date().toISOString(),
  };
  nextSession[bucket] = [...nextSession[bucket], itemId];
  nextSession.currentItemId = await getNextWizardItem(nextSession, itemId);
  nextSession.status = nextSession.currentItemId ? "in_progress" : "completed";
  await saveWizardSession(nextSession);
  return nextSession;
}

export function parseCitiesFromForm(formData: FormData): TravelCity[] {
  return [1, 2, 3]
    .map((index) => ({
      city: String(formData.get(`city${index}`) ?? "").trim(),
      state: String(formData.get(`state${index}`) ?? "AR").trim().toUpperCase(),
    }))
    .filter((city) => city.city);
}

export function numericFormField(formData: FormData, name: string): number | undefined {
  const raw = String(formData.get(name) ?? "").trim();
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function normalizeInitials(value: string): string {
  const initials = value.trim().toUpperCase();
  if (/^[A-Z]{2,4}$/.test(initials)) return initials;
  throw new Error("Reviewer initials must be 2-4 uppercase letters.");
}

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
