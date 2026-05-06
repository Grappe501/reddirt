#!/usr/bin/env node
/**
 * REDDIRT-SELFBUILD-FORBIDDEN-PATH-GATES-1.0 — cross-check slice JSON against boundary seeds.
 * Prerequisites: reddirt_selfbuild_slice_schema.json + validate-selfbuild-slice.mjs + selfbuild JSON seeds.
 * Optional slice path (defaults to data/selfbuild/reddirt_selfbuild_slice_example.json).
 * Does not modify package.json.
 * Run: cd RedDirt && node scripts/validate-selfbuild-boundaries.mjs [path/to/slice.json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SLICE_SCHEMA = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_slice_schema.json");
const SLICE_VALIDATOR = path.join(ROOT, "scripts/validate-selfbuild-slice.mjs");
const FORBIDDEN_PATHS = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_forbidden_paths.json");
const FORBIDDEN_ACTIONS = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_forbidden_actions.json");
const BOUNDARY_PROFILES = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_boundary_profiles.json");
const DEFAULT_SLICE = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_slice_example.json");

/** Slice types that must not claim send/migration execution paths in allowedWrites. */
const DOC_LIKE_SLICE_TYPES = new Set([
  "documentation",
  "architecture",
  "selfbuild",
  "consolidation_review",
  "readiness",
]);

function readJson(p, label) {
  let raw;
  try {
    raw = fs.readFileSync(p, "utf8");
  } catch {
    throw new Error(`Cannot read ${label}: ${p}`);
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON: ${p}`);
  }
}

function norm(p) {
  return String(p).replace(/\\/g, "/").trim();
}

function normLower(p) {
  return norm(p).toLowerCase();
}

function isBareEnvWritePath(p) {
  const n = norm(p);
  if (/\.env\.example/i.test(n)) return false;
  if (/\/\.env$/i.test(n)) return true;
  if (/^\.env$/i.test(n)) return true;
  if (/\/\.env\?/i.test(n)) return true;
  return /(^|\/)RedDirt\/\.env$/i.test(n) || /(^|\/)\.env$/i.test(n);
}

function validateForbiddenPathsShape(data) {
  const keys = [
    "schemaVersion",
    "slice",
    "status",
    "globalForbiddenPathPatterns",
    "conditionalForbiddenPathPatterns",
    "protectedPublicSitePaths",
    "protectedSiblingAppPaths",
    "protectedSecretPatterns",
    "protectedSendExecutionPatterns",
    "protectedMigrationPatterns",
    "allowedDocumentationPaths",
  ];
  for (const k of keys) {
    if (!(k in data)) throw new Error(`forbidden_paths.json missing key: ${k}`);
  }
  if (data.schemaVersion !== "1.0") throw new Error("forbidden_paths schemaVersion must be 1.0");
  const arrays = [
    "globalForbiddenPathPatterns",
    "conditionalForbiddenPathPatterns",
    "protectedPublicSitePaths",
    "protectedSiblingAppPaths",
    "protectedSecretPatterns",
    "protectedSendExecutionPatterns",
    "protectedMigrationPatterns",
    "allowedDocumentationPaths",
  ];
  for (const a of arrays) {
    if (!Array.isArray(data[a])) throw new Error(`forbidden_paths ${a} must be an array`);
  }
}

function validateForbiddenActionsShape(data) {
  if (data.schemaVersion !== "1.0") throw new Error("forbidden_actions schemaVersion must be 1.0");
  if (!Array.isArray(data.globalForbiddenActionPhrases)) {
    throw new Error("forbidden_actions.globalForbiddenActionPhrases must be an array");
  }
}

function validateBoundaryProfilesShape(data) {
  if (data.schemaVersion !== "1.0") throw new Error("boundary_profiles schemaVersion must be 1.0");
  if (!Array.isArray(data.profiles)) throw new Error("boundary_profiles.profiles must be an array");
}

/**
 * @param {object} slice
 * @param {object} fp
 * @param {string} sliceLabel
 * @returns {string[]}
 */
function collectBoundaryViolations(slice, fp, sliceLabel) {
  const err = [];
  if (!slice || typeof slice !== "object") {
    err.push(`${sliceLabel}: invalid slice object`);
    return err;
  }
  const writes = Array.isArray(slice.allowedWrites) ? slice.allowedWrites : [];
  const paths = Array.isArray(slice.allowedPaths) ? slice.allowedPaths : [];
  const sliceType = String(slice.sliceType || "");

  const checkList = [...writes.map((p) => ({ p, kind: "allowedWrites" })), ...paths.map((p) => ({ p, kind: "allowedPaths" }))];

  for (const { p, kind } of checkList) {
    const nl = normLower(p);
    for (const pattern of fp.globalForbiddenPathPatterns) {
      const pl = normLower(pattern);
      if (pl && nl.includes(pl)) {
        err.push(`${sliceLabel}: ${kind} hits globalForbiddenPathPatterns "${pattern}": ${p}`);
      }
    }
  }

  for (const rule of fp.conditionalForbiddenPathPatterns || []) {
    const unless = Array.isArray(rule.unlessSliceTypes) ? rule.unlessSliceTypes : [];
    if (unless.includes(sliceType)) continue;
    const pats = Array.isArray(rule.patterns) ? rule.patterns : [];
    for (const { p, kind } of checkList) {
      const nl = normLower(p);
      for (const pattern of pats) {
        const pl = normLower(pattern);
        if (pl && nl.includes(pl)) {
          err.push(
            `${sliceLabel}: ${kind} hits conditional rule "${rule.id || "?"}" pattern "${pattern}" (sliceType ${sliceType}): ${p}`,
          );
        }
      }
    }
  }

  for (const w of writes) {
    const n = norm(w);
    if (isBareEnvWritePath(n)) {
      err.push(`${sliceLabel}: allowedWrites must not target bare .env files: ${w}`);
    }
    for (const pattern of fp.protectedSecretPatterns || []) {
      if (!pattern) continue;
      if (normLower(w).includes(normLower(pattern))) {
        err.push(`${sliceLabel}: allowedWrites hits protectedSecretPatterns "${pattern}": ${w}`);
      }
    }
    if (DOC_LIKE_SLICE_TYPES.has(sliceType)) {
      for (const pattern of fp.protectedSendExecutionPatterns || []) {
        const pl = normLower(pattern);
        if (pl && normLower(w).includes(pl)) {
          err.push(
            `${sliceLabel}: doc-like sliceType "${sliceType}" must not list send execution path pattern "${pattern}" in allowedWrites: ${w}`,
          );
        }
      }
      for (const pattern of fp.protectedMigrationPatterns || []) {
        const pl = normLower(pattern);
        if (pl && normLower(w).includes(pl)) {
          err.push(
            `${sliceLabel}: doc-like sliceType "${sliceType}" must not list migration pattern "${pattern}" in allowedWrites: ${w}`,
          );
        }
      }
    }
  }

  return err;
}

function checkPrerequisites(errors) {
  if (!fs.existsSync(SLICE_SCHEMA)) errors.push(`Missing prerequisite: ${path.relative(ROOT, SLICE_SCHEMA)}`);
  if (!fs.existsSync(SLICE_VALIDATOR)) errors.push(`Missing prerequisite: ${path.relative(ROOT, SLICE_VALIDATOR)}`);
  if (!fs.existsSync(FORBIDDEN_PATHS)) errors.push(`Missing: ${path.relative(ROOT, FORBIDDEN_PATHS)}`);
  if (!fs.existsSync(FORBIDDEN_ACTIONS)) errors.push(`Missing: ${path.relative(ROOT, FORBIDDEN_ACTIONS)}`);
  if (!fs.existsSync(BOUNDARY_PROFILES)) errors.push(`Missing: ${path.relative(ROOT, BOUNDARY_PROFILES)}`);
}

function main() {
  const errors = [];
  checkPrerequisites(errors);

  let fp;
  let fa;
  let bp;
  if (errors.length === 0) {
    try {
      fp = readJson(FORBIDDEN_PATHS, "forbidden_paths");
      validateForbiddenPathsShape(fp);
      fa = readJson(FORBIDDEN_ACTIONS, "forbidden_actions");
      validateForbiddenActionsShape(fa);
      bp = readJson(BOUNDARY_PROFILES, "boundary_profiles");
      validateBoundaryProfilesShape(bp);
      if (bp.defaultProfileId && !bp.profiles.some((x) => x.id === bp.defaultProfileId)) {
        errors.push(`boundary_profiles.defaultProfileId "${bp.defaultProfileId}" not found in profiles`);
      }
    } catch (e) {
      errors.push(e.message || String(e));
    }
  }

  const arg = process.argv[2];
  const slicePath = arg ? (path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg)) : DEFAULT_SLICE;
  const sliceLabel = path.relative(ROOT, slicePath);

  if (errors.length === 0) {
    if (!fs.existsSync(slicePath)) {
      errors.push(`Slice file not found: ${slicePath}`);
    } else {
      try {
        const slice = readJson(slicePath, "slice");
        errors.push(...collectBoundaryViolations(slice, fp, sliceLabel || slicePath));
      } catch (e) {
        errors.push(e.message || String(e));
      }
    }
  }

  const ok = errors.length === 0;
  console.log("");
  console.log("=== validate-selfbuild-boundaries ===");
  if (ok) {
    console.log("STATUS: PASS");
    console.log("");
    console.log(`  Slice:   ${sliceLabel}`);
    console.log(`  Seeds:   data/selfbuild/reddirt_selfbuild_forbidden_paths.json`);
    console.log(`           data/selfbuild/reddirt_selfbuild_forbidden_actions.json`);
    console.log(`           data/selfbuild/reddirt_selfbuild_boundary_profiles.json`);
    console.log("");
  } else {
    console.log("STATUS: FAIL");
    console.log("");
    for (const e of errors) console.log(`  - ${e}`);
    console.log("");
  }

  process.exit(ok ? 0 : 1);
}

main();
