/**
 * Editor notifications (file-backed queue). Advisory only.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { NOTIFICATIONS_FILE, WORKSPACE_REL } from "./workspace-store";

export type TranscriptNotificationType =
  | "NEW_TRANSCRIPT"
  | "CAPTION_FAILURE"
  | "AI_TRANSCRIPT_READY"
  | "REVIEW_COMPLETE"
  | "PUBLISHING_READY"
  | "SYNC_COMPLETE";

export type TranscriptNotification = {
  id: string;
  type: TranscriptNotificationType;
  youtubeVideoId?: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type NotificationsFile = { version: number; items: TranscriptNotification[] };

function abs(repoRoot: string): string {
  return path.join(repoRoot, WORKSPACE_REL, NOTIFICATIONS_FILE);
}

export function loadNotifications(repoRoot: string = process.cwd()): TranscriptNotification[] {
  const p = abs(repoRoot);
  if (!existsSync(p)) return [];
  const file = JSON.parse(readFileSync(p, "utf8")) as NotificationsFile;
  return file.items ?? [];
}

export function appendNotification(
  input: Omit<TranscriptNotification, "id" | "createdAt" | "read">,
  repoRoot: string = process.cwd(),
): TranscriptNotification {
  const p = abs(repoRoot);
  mkdirSync(path.dirname(p), { recursive: true });
  const items = loadNotifications(repoRoot);
  const note: TranscriptNotification = {
    ...input,
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
    read: false,
  };
  const next: NotificationsFile = { version: 1, items: [note, ...items].slice(0, 200) };
  writeFileSync(p, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return note;
}

export function markNotificationRead(id: string, repoRoot: string = process.cwd()): void {
  const p = abs(repoRoot);
  const items = loadNotifications(repoRoot).map((n) => (n.id === id ? { ...n, read: true } : n));
  writeFileSync(p, `${JSON.stringify({ version: 1, items }, null, 2)}\n`, "utf8");
}
