import "server-only";

import fs from "fs";
import path from "path";
import { parse as parseYaml } from "yaml";

import { FALLBACK_KICKOFF_MANIFEST } from "./fallback-manifest";
import {
  formatManifestZodError,
  meetingManifestSchema,
  type MeetingManifest,
} from "./schemas/meeting-manifest";

export type ManifestLoadResult = {
  manifest: MeetingManifest;
  source: "yaml" | "json" | "fallback";
  warnings: string[];
};

const MANIFEST_DIR = path.join(process.cwd(), "data/cpos/manifests");

function readManifestFile(meetingId: string, ext: "yaml" | "json"): string | null {
  const filePath = path.join(MANIFEST_DIR, `${meetingId}.${ext}`);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}

function validateManifest(raw: unknown, meetingId: string): MeetingManifest {
  const parsed = meetingManifestSchema.parse(raw);
  if (parsed.id !== meetingId) {
    throw new Error(`Manifest id "${parsed.id}" does not match requested "${meetingId}"`);
  }
  return parsed;
}

/**
 * Load and validate a meeting manifest. Falls back to embedded minimal manifest on failure.
 */
export function loadMeetingManifest(meetingId: string): ManifestLoadResult {
  const warnings: string[] = [];

  try {
    const jsonRaw = readManifestFile(meetingId, "json");
    if (jsonRaw) {
      const raw = JSON.parse(jsonRaw) as unknown;
      return { manifest: validateManifest(raw, meetingId), source: "json", warnings };
    }

    const yamlRaw = readManifestFile(meetingId, "yaml");
    if (yamlRaw) {
      const raw = parseYaml(yamlRaw) as unknown;
      return { manifest: validateManifest(raw, meetingId), source: "yaml", warnings };
    }

    warnings.push(`No manifest file for ${meetingId}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    warnings.push(`Manifest load failed: ${msg}`);
    if (err && typeof err === "object" && "issues" in err) {
      warnings.push(formatManifestZodError(err as import("zod").ZodError));
    }
  }

  if (meetingId === "kickoff-2026") {
    return { manifest: FALLBACK_KICKOFF_MANIFEST, source: "fallback", warnings };
  }

  return { manifest: FALLBACK_KICKOFF_MANIFEST, source: "fallback", warnings };
}

export function loadMeetingManifestBySlug(slug: string): ManifestLoadResult | null {
  const yamlDir = MANIFEST_DIR;
  if (!fs.existsSync(yamlDir)) return null;

  const files = fs.readdirSync(yamlDir).filter((f) => f.endsWith(".yaml") || f.endsWith(".json"));
  for (const file of files) {
    const id = file.replace(/\.(yaml|json)$/, "");
    const result = loadMeetingManifest(id);
    if (result.manifest.slug === slug) return result;
  }
  return null;
}

export const KICKOFF_MEETING_ID = "kickoff-2026";
