#!/usr/bin/env node
/**
 * REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0 — validate slice JSON against reddirt_selfbuild_slice_schema.json.
 * Optional file path: defaults to data/selfbuild/reddirt_selfbuild_slice_example.json.
 * Does not modify package.json.
 * Run: cd RedDirt && node scripts/validate-selfbuild-slice.mjs [path/to/slice.json]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const SCHEMA_PATH = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_slice_schema.json");
const DEFAULT_SLICE_PATH = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_slice_example.json");
const RETURN_FORMAT_PATH = path.join(ROOT, "data/selfbuild/reddirt_selfbuild_required_return_format.json");

/** sliceType values that must echo every globalForbiddenActions phrase inside mustNotDo (substring match). */
/** High-risk slice types: mustNotDo must mention every globalForbiddenActions string (substring). */
const SLICE_TYPES_FORBID_COVERAGE = new Set([
  "production_proof",
  "database_migration",
  "automation_dryrun",
  "ai_intelligence",
]);

function readJson(p, label) {
  let raw;
  try {
    raw = fs.readFileSync(p, "utf8");
  } catch (e) {
    throw new Error(`Cannot read ${label}: ${p}`);
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Invalid JSON in ${label}: ${p}`);
  }
}

function requireKeys(obj, keys, label) {
  const missing = keys.filter((k) => !(k in obj));
  if (missing.length) throw new Error(`${label} missing keys: ${missing.join(", ")}`);
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isStringArray(v) {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function validateSchemaShape(schema) {
  const top = [
    "schemaVersion",
    "schemaName",
    "requiredSliceFields",
    "requiredPathFields",
    "requiredGovernanceFields",
    "requiredProofFields",
    "requiredProgressFields",
    "requiredReportFields",
    "allowedReadinessStates",
    "allowedRiskLevels",
    "allowedSliceTypes",
    "globalForbiddenActions",
    "globalSafetyRules",
    "validationRules",
  ];
  requireKeys(schema, top, "Schema file");

  if (schema.schemaVersion !== "1.0") throw new Error(`Unexpected schemaVersion`);
  if (schema.schemaName !== "reddirt_selfbuild_slice_schema") {
    throw new Error(`Unexpected schemaName: ${schema.schemaName}`);
  }

  const requiredEnums = {
    allowedSliceTypes: schema.allowedSliceTypes,
    allowedReadinessStates: schema.allowedReadinessStates,
    allowedRiskLevels: schema.allowedRiskLevels,
  };
  for (const [k, arr] of Object.entries(requiredEnums)) {
    if (!Array.isArray(arr) || arr.some((x) => typeof x !== "string")) {
      throw new Error(`Schema ${k} must be an array of strings`);
    }
  }

  const expectedTypes = [
    "architecture",
    "documentation",
    "readiness",
    "diagnostic",
    "ui",
    "api",
    "database_readonly",
    "database_migration",
    "ai_intelligence",
    "automation_dryrun",
    "production_proof",
    "selfbuild",
    "consolidation_review",
  ];
  const got = [...schema.allowedSliceTypes].sort().join("|");
  const exp = [...expectedTypes].sort().join("|");
  if (got !== exp) throw new Error("allowedSliceTypes does not match canonical REDDIRT-SELFBUILD-SLICE-SCHEMA-1.0 set");

  if (!Array.isArray(schema.globalForbiddenActions) || schema.globalForbiddenActions.length < 8) {
    throw new Error("globalForbiddenActions must be a non-trivial string array");
  }
  const mustHave = "unapproved sos-public coupling";
  if (!schema.globalForbiddenActions.some((s) => s === mustHave)) {
    throw new Error(`globalForbiddenActions must include exact entry: "${mustHave}"`);
  }

  if (!Array.isArray(schema.validationRules) || schema.validationRules.length === 0) {
    throw new Error("validationRules must be a non-empty array");
  }

  if (!Array.isArray(schema.allowedV2LayerKeys) || schema.allowedV2LayerKeys.length !== 12) {
    throw new Error("allowedV2LayerKeys must list twelve V2 registry keys");
  }
}

function validateReturnFormatFile(schema) {
  const data = readJson(RETURN_FORMAT_PATH, "return format");
  requireKeys(
    data,
    [
      "schemaVersion",
      "schemaName",
      "requiredReportFields",
      "sections",
      "standardReturnFormat",
      "architectureReturnFormat",
    ],
    "return format",
  );
  if (data.schemaVersion !== "1.0") throw new Error("return format schemaVersion must be 1.0");
  const a = [...data.requiredReportFields].sort().join("|");
  const b = [...schema.requiredReportFields].sort().join("|");
  if (a !== b) throw new Error("requiredReportFields mismatch between slice schema and return format JSON");
}

/**
 * @param {object} slice
 * @param {object} schema
 * @param {string} label
 * @returns {string[]}
 */
function collectSliceErrors(slice, schema, label) {
  const err = [];

  const keys = schema.requiredSliceFields;
  const missingTop = keys.filter((k) => !(k in slice));
  if (missingTop.length) {
    err.push(`${label}: missing required fields: ${missingTop.join(", ")}`);
    return err;
  }

  if (!isNonEmptyString(slice.sliceId)) err.push(`${label}: sliceId must be a non-empty string`);
  if (!isNonEmptyString(slice.title)) err.push(`${label}: title must be a non-empty string`);
  if (!isNonEmptyString(slice.mission)) err.push(`${label}: mission must be a non-empty string`);
  if (!isNonEmptyString(slice.whyNow)) err.push(`${label}: whyNow must be a non-empty string`);

  if (!schema.allowedSliceTypes.includes(slice.sliceType)) {
    err.push(`${label}: sliceType "${slice.sliceType}" is not in allowedSliceTypes`);
  }

  if (!Array.isArray(slice.v2Layers)) {
    err.push(`${label}: v2Layers must be an array`);
  } else {
    if (slice.v2Layers.length === 0) {
      err.push(`${label}: v2Layers must be non-empty (at least one registry layer key)`);
    }
    for (const layer of slice.v2Layers) {
      if (!schema.allowedV2LayerKeys.includes(layer)) {
        err.push(`${label}: unknown v2Layer "${layer}"`);
      }
    }
  }

  const pathArrays = ["allowedPaths", "forbiddenPaths", "allowedReads", "allowedWrites"];
  for (const f of pathArrays) {
    if (!isStringArray(slice[f])) err.push(`${label}: ${f} must be an array of strings`);
  }

  const mustExistNonEmptyArrays = ["allowedPaths", "forbiddenPaths", "proofRequired", "checksRequired", "mustNotDo"];
  for (const f of mustExistNonEmptyArrays) {
    if (!Array.isArray(slice[f]) || slice[f].length === 0) {
      err.push(`${label}: ${f} must be a non-empty array of strings`);
    }
  }

  const otherStringArrays = [
    "requiredInputs",
    "expectedOutputs",
    "progressEffects",
    "governanceRules",
    "humanApprovalGates",
    "rollbackNotes",
    "finalReturnFormat",
  ];
  for (const f of otherStringArrays) {
    if (!isStringArray(slice[f])) err.push(`${label}: ${f} must be an array of strings`);
  }

  if (!Array.isArray(slice.finalReturnFormat) || slice.finalReturnFormat.length === 0) {
    err.push(`${label}: finalReturnFormat must be a non-empty array`);
  }

  if (SLICE_TYPES_FORBID_COVERAGE.has(slice.sliceType) && Array.isArray(slice.mustNotDo) && slice.mustNotDo.length) {
    const hay = slice.mustNotDo.map((s) => String(s).toLowerCase()).join(" | ");
    for (const action of schema.globalForbiddenActions) {
      const needle = String(action).toLowerCase();
      if (!hay.includes(needle)) {
        err.push(
          `${label}: mustNotDo must mention global forbidden action "${action}" (required for sliceType ${slice.sliceType})`,
        );
      }
    }
  }

  return err;
}

function printSummary(ok, schemaErrors, sliceLabel, sliceErrors) {
  console.log("");
  console.log("=== validate-selfbuild-slice ===");
  if (schemaErrors.length) {
    console.log("STATUS: FAIL");
    console.log("");
    console.log("[schema / return-format]");
    for (const e of schemaErrors) console.log(`  - ${e}`);
    console.log("");
    return;
  }
  if (sliceErrors.length) {
    console.log("STATUS: FAIL");
    console.log("");
    console.log(`[slice: ${sliceLabel}]`);
    for (const e of sliceErrors) console.log(`  - ${e}`);
    console.log("");
    return;
  }
  console.log("STATUS: PASS");
  console.log("");
  console.log(`  Slice file: ${sliceLabel}`);
  console.log("  Schema:     data/selfbuild/reddirt_selfbuild_slice_schema.json");
  console.log("  Return JSON aligned with schema requiredReportFields.");
  console.log("");
}

function main() {
  const schemaErrors = [];
  let schema;
  try {
    schema = readJson(SCHEMA_PATH, "schema");
    validateSchemaShape(schema);
    validateReturnFormatFile(schema);
  } catch (e) {
    schemaErrors.push(e.message || String(e));
  }

  const arg = process.argv[2];
  const slicePath = arg
    ? path.isAbsolute(arg)
      ? arg
      : path.join(process.cwd(), arg)
    : DEFAULT_SLICE_PATH;

  let sliceErrors = [];
  let sliceLabel = path.relative(ROOT, slicePath);

  if (schemaErrors.length === 0) {
    if (!fs.existsSync(slicePath)) {
      sliceErrors = [`Slice file not found: ${slicePath}`];
    } else {
      try {
        const slice = readJson(slicePath, "slice");
        sliceErrors = collectSliceErrors(slice, schema, sliceLabel || slicePath);
      } catch (e) {
        sliceErrors = [e.message || String(e)];
      }
    }
  }

  const ok = schemaErrors.length === 0 && sliceErrors.length === 0;
  printSummary(ok, schemaErrors, sliceLabel, sliceErrors);

  process.exit(ok ? 0 : 1);
}

main();
