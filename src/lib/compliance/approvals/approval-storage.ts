import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ComplianceApprovalChain, ComplianceApprovalEvent, ComplianceApprovalRole, ComplianceApprovalStage } from "./approval-types";

const APPROVAL_DIR = path.join(process.cwd(), "data", "compliance", "approvals");
const APPROVAL_EVENTS_PATH = path.join(APPROVAL_DIR, "approval-events.json");

export async function loadApprovalEvents(): Promise<ComplianceApprovalEvent[]> {
  return readJson<ComplianceApprovalEvent[]>(APPROVAL_EVENTS_PATH, []);
}

export async function appendApprovalEvent(input: Omit<ComplianceApprovalEvent, "id" | "createdAt">): Promise<ComplianceApprovalEvent> {
  const events = await loadApprovalEvents();
  const event: ComplianceApprovalEvent = {
    ...input,
    id: `approval-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    actorInitials: input.actorInitials.trim().toUpperCase() || "UNK",
    createdAt: new Date().toISOString(),
  };
  await writeJson(APPROVAL_EVENTS_PATH, [event, ...events].slice(0, 2000));
  return event;
}

export async function buildApprovalChain(recordId: string, requiredRoles: ComplianceApprovalRole[] = ["staff", "treasurer", "compliance_officer"]): Promise<ComplianceApprovalChain> {
  const events = (await loadApprovalEvents()).filter((event) => event.recordId === recordId);
  const completedRoles = [...new Set(events.filter((event) => event.stage === "approved" || event.stage === "filing_certified").map((event) => event.role))];
  return {
    recordId,
    currentStage: resolveCurrentStage(events),
    requiredRoles,
    completedRoles,
    events,
    humanReviewRequired: true,
  };
}

function resolveCurrentStage(events: ComplianceApprovalEvent[]): ComplianceApprovalStage {
  const order: ComplianceApprovalStage[] = ["entered", "reviewed", "approved", "reconciled", "filing_certified"];
  return order.reduce((current, stage) => (events.some((event) => event.stage === stage) ? stage : current), "entered" as ComplianceApprovalStage);
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(filePath, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath: string, value: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
