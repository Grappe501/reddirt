/**
 * Evidence density snapshot — live queue metrics for ops + optional evening log.
 * Updates EVIDENCE_DENSITY.md Unknown + counties-from-approved only (no invented events).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { writeJsonAtomic } from "@/lib/campaign-media/evidence-store";
import {
  buildEvidencePublishQueue,
  EVIDENCE_DENSITY_SNAPSHOT_REL,
  type EvidencePublishQueue,
} from "@/lib/campaign-media/evidence-publish-queue";

export type EveningLogEntry = {
  date: string;
  publishedToday: string;
  createdNotPublished: string;
  note?: string;
};

export type EvidenceDensitySnapshot = {
  version: 1;
  updatedAt: string;
  purpose: string;
  queue: EvidencePublishQueue;
  eveningLog: EveningLogEntry[];
  densityDocUpdated: boolean;
  densityDocNote: string;
};

function abs(rel: string): string {
  return path.join(process.cwd(), rel);
}

function loadExistingEveningLog(): EveningLogEntry[] {
  const p = abs(EVIDENCE_DENSITY_SNAPSHOT_REL);
  if (!existsSync(p)) return [];
  try {
    const raw = JSON.parse(readFileSync(p, "utf8")) as Partial<EvidenceDensitySnapshot>;
    return Array.isArray(raw.eveningLog) ? raw.eveningLog.slice(0, 60) : [];
  } catch {
    return [];
  }
}

function updateDensityMarkdown(queue: EvidencePublishQueue): { ok: boolean; note: string } {
  const rel = "docs/website/EVIDENCE_DENSITY.md";
  const p = abs(rel);
  if (!existsSync(p)) {
    return { ok: false, note: "EVIDENCE_DENSITY.md missing — snapshot JSON only." };
  }
  let text = readFileSync(p, "utf8");
  const today = new Date().toISOString().slice(0, 10);
  const countyCount = queue.confirmedCounties.length;
  const countyList = queue.confirmedCounties.join(", ") || "(none approved yet)";
  const unknown = queue.totals.unknownCounty;

  text = text.replace(
    /\*\*Last updated:\*\*[^\n]*/,
    `**Last updated:** ${today} (live snapshot from Evidence Publish Queue)`,
  );

  text = text.replace(
    /\| Counties represented \| \*\*[^*]+\*\* \|[^\n]*/,
    `| Counties represented | **${countyCount}** | ${countyList} — from approved/public stills only |`,
  );

  text = text.replace(
    /\| \d+ Unknown-county registry photos \|[^\n]*/,
    `| ${unknown} Unknown-county live stills | No confirmed geography |`,
  );

  // Append evening log row if table empty placeholder exists — leave table for operator;
  // snapshot JSON holds structured evening entries.
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, text.endsWith("\n") ? text : `${text}\n`, "utf8");
  return {
    ok: true,
    note: `Updated ${rel}: counties=${countyCount}, unknown=${unknown}.`,
  };
}

export function loadEvidenceDensitySnapshot(): EvidenceDensitySnapshot | null {
  const p = abs(EVIDENCE_DENSITY_SNAPSHOT_REL);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as EvidenceDensitySnapshot;
  } catch {
    return null;
  }
}

export function refreshEvidenceDensitySnapshot(input?: {
  evening?: { publishedToday?: string; createdNotPublished?: string; note?: string };
  updateDensityDoc?: boolean;
}): EvidenceDensitySnapshot {
  const queue = buildEvidencePublishQueue();
  const eveningLog = loadExistingEveningLog();
  if (input?.evening) {
    eveningLog.unshift({
      date: new Date().toISOString().slice(0, 10),
      publishedToday: String(input.evening.publishedToday ?? "").trim() || "—",
      createdNotPublished: String(input.evening.createdNotPublished ?? "").trim() || "—",
      note: input.evening.note?.trim() || undefined,
    });
  }

  const doc =
    input?.updateDensityDoc === false
      ? { ok: false, note: "Density doc update skipped." }
      : updateDensityMarkdown(queue);

  const snapshot: EvidenceDensitySnapshot = {
    version: 1,
    updatedAt: new Date().toISOString(),
    purpose:
      "Live Evidence Publish Queue + density metrics. Unknown stays Unknown; Approve remains operator-gated.",
    queue,
    eveningLog: eveningLog.slice(0, 60),
    densityDocUpdated: doc.ok,
    densityDocNote: doc.note,
  };

  writeJsonAtomic(EVIDENCE_DENSITY_SNAPSHOT_REL, snapshot);
  return snapshot;
}
