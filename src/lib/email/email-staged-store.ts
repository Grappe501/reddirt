import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { EmailCampaignDraft, EmailSendLogRow, EmailSuppressionRow } from "@/lib/email/email-campaign-types";

const DATA_DIR = "data/email";
const DRAFTS_FILE = "email-campaign-drafts.staged.json";
const LOG_FILE = "email-send-log.staged.json";
const SUPPRESSIONS_FILE = "email-suppressions.staged.json";

async function ensureDir(repoRoot = process.cwd()) {
  await mkdir(path.join(repoRoot, DATA_DIR), { recursive: true });
}

async function readRows<T>(fileName: string, repoRoot = process.cwd()): Promise<T[]> {
  const file = path.join(repoRoot, DATA_DIR, fileName);
  if (!existsSync(file)) return [];
  try {
    const parsed = JSON.parse(await readFile(file, "utf8")) as { rows?: T[] } | T[];
    return Array.isArray(parsed) ? parsed : parsed.rows ?? [];
  } catch {
    return [];
  }
}

async function writeRows<T>(fileName: string, rows: T[], repoRoot = process.cwd()) {
  await ensureDir(repoRoot);
  await writeFile(path.join(repoRoot, DATA_DIR, fileName), JSON.stringify({ rows }, null, 2), "utf8");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export async function loadEmailDrafts(repoRoot?: string): Promise<EmailCampaignDraft[]> {
  return readRows<EmailCampaignDraft>(DRAFTS_FILE, repoRoot);
}

export async function saveEmailDrafts(rows: EmailCampaignDraft[], repoRoot?: string) {
  await writeRows(DRAFTS_FILE, rows, repoRoot);
}

export async function loadEmailSendLog(repoRoot?: string): Promise<EmailSendLogRow[]> {
  return readRows<EmailSendLogRow>(LOG_FILE, repoRoot);
}

export async function appendEmailSendLog(row: EmailSendLogRow, repoRoot?: string) {
  const rows = await loadEmailSendLog(repoRoot);
  rows.unshift(row);
  await writeRows(LOG_FILE, rows.slice(0, 500), repoRoot);
}

export async function loadEmailSuppressions(repoRoot?: string): Promise<EmailSuppressionRow[]> {
  return readRows<EmailSuppressionRow>(SUPPRESSIONS_FILE, repoRoot);
}

export async function saveEmailSuppressions(rows: EmailSuppressionRow[], repoRoot?: string) {
  await writeRows(SUPPRESSIONS_FILE, rows, repoRoot);
}

export async function ensureEmailStagedFiles(repoRoot?: string) {
  await ensureDir(repoRoot);
  if (!existsSync(path.join(repoRoot ?? process.cwd(), DATA_DIR, DRAFTS_FILE))) await saveEmailDrafts([], repoRoot);
  if (!existsSync(path.join(repoRoot ?? process.cwd(), DATA_DIR, LOG_FILE))) await writeRows(LOG_FILE, [], repoRoot);
  if (!existsSync(path.join(repoRoot ?? process.cwd(), DATA_DIR, SUPPRESSIONS_FILE))) await saveEmailSuppressions([], repoRoot);
}
