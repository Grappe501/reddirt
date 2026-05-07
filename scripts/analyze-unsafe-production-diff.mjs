/**
 * REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0 — Phase 1
 * Offline analysis of raw Prisma production→schema diff SQL. No DB calls.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SLICE = "REDDIRT-PRODUCTION-ADDITIVE-SCHEMA-INSTALL-PLAN-1.0";
const DATA_SQL = path.join(ROOT, "data/sql/unsafe-production-to-current-schema-diff.sql");
const OUT_JSON = path.join(ROOT, "data/unsafe-production-schema-diff-analysis.json");
const OUT_MD = path.join(ROOT, "docs/unsafe-production-schema-diff-analysis.md");

const HIGH_VALUE = new Set(
  [
    "ar02_voters",
    "contacts",
    "counties",
    "event_requests",
    "message_audiences",
    "path_to_victory",
    "people",
    "person_profiles",
    "turf_people",
    "voters",
    "events",
    "message_events",
    "profiles",
  ].map((s) => s.toLowerCase())
);

function isVoterLike(name) {
  const l = name.toLowerCase();
  return l.startsWith("voter_") || l === "voters" || l.startsWith("ar02_voter");
}

/** @param {string} sql */
function splitSqlStatements(sql) {
  const out = [];
  let cur = "";
  let i = 0;
  let inSq = false;
  let inDq = false;
  let bcom = 0;
  while (i < sql.length) {
    const c = sql[i];
    const n = sql[i + 1];
    if (bcom > 0) {
      if (c === "/" && n === "*") {
        cur += "/*";
        i += 2;
        bcom++;
        continue;
      }
      if (c === "*" && n === "/") {
        cur += "*/";
        i += 2;
        bcom--;
        continue;
      }
      cur += c;
      i++;
      continue;
    }
    if (!inSq && !inDq) {
      if (c === "-" && n === "-") {
        while (i < sql.length && sql[i] !== "\n") {
          cur += sql[i];
          i++;
        }
        if (i < sql.length) {
          cur += sql[i];
          i++;
        }
        continue;
      }
      if (c === "/" && n === "*") {
        cur += "/*";
        i += 2;
        bcom++;
        continue;
      }
    }
    if (!inDq && c === "'") {
      if (inSq && n === "'") {
        cur += "''";
        i += 2;
        continue;
      }
      inSq = !inSq;
      cur += c;
      i++;
      continue;
    }
    if (inSq) {
      cur += c;
      i++;
      continue;
    }
    if (!inSq && c === '"') {
      if (inDq && n === '"') {
        cur += '""';
        i += 2;
        continue;
      }
      inDq = !inDq;
      cur += c;
      i++;
      continue;
    }
    if (!inSq && !inDq && c === ";") {
      const t = cur.trim();
      if (t) out.push(t);
      cur = "";
      i++;
      continue;
    }
    cur += c;
    i++;
  }
  const t = cur.trim();
  if (t) out.push(t);
  return out;
}

/** @param {string} stmt */
function extractQuotedIdentifiers(stmt) {
  const ids = [];
  let i = 0;
  let inSq = false;
  let inDq = false;
  let bcom = 0;
  while (i < stmt.length) {
    const c = stmt[i];
    const n = stmt[i + 1];
    if (bcom > 0) {
      if (c === "/" && n === "*") {
        i += 2;
        bcom++;
        continue;
      }
      if (c === "*" && n === "/") {
        i += 2;
        bcom--;
        continue;
      }
      i++;
      continue;
    }
    if (!inSq && !inDq) {
      if (c === "-" && n === "-") {
        while (i < stmt.length && stmt[i] !== "\n") i++;
        if (i < stmt.length) i++;
        continue;
      }
      if (c === "/" && n === "*") {
        i += 2;
        bcom++;
        continue;
      }
    }
    if (!inDq && c === "'") {
      if (inSq && n === "'") {
        i += 2;
        continue;
      }
      inSq = !inSq;
      i++;
      continue;
    }
    if (inSq) {
      i++;
      continue;
    }
    if (!inSq && c === '"') {
      if (inDq) {
        if (n === '"') {
          i += 2;
          continue;
        }
        inDq = false;
        i++;
        continue;
      }
      inDq = true;
      let buf = "";
      i++;
      while (i < stmt.length) {
        if (stmt[i] === '"' && stmt[i + 1] === '"') {
          buf += '"';
          i += 2;
          continue;
        }
        if (stmt[i] === '"') {
          i++;
          break;
        }
        buf += stmt[i];
        i++;
      }
      if (buf) ids.push(buf);
      continue;
    }
    i++;
  }
  return ids;
}

/** @param {string} stmt */
function firstAlterTableName(stmt) {
  const m = stmt.match(/^\s*ALTER\s+TABLE\s+(?:(?:"public")\.)?"([^"]+)"/i);
  return m ? m[1] : null;
}

/** @param {string} stmt */
/** Strip leading `-- ...` lines so Prisma-diff-prefixed DDL is classified. */
function stripLeadingLineComments(stmt) {
  return stmt.replace(/^(\s*--[^\n]*\n)+/g, "").trim();
}

function statementTouchesHighValue(stmt) {
  const refs = [];
  const ids = extractQuotedIdentifiers(stmt);
  for (const id of ids) {
    const low = id.toLowerCase();
    if (HIGH_VALUE.has(low) || isVoterLike(low)) refs.push(low);
  }
  if (/\bauth\./i.test(stmt) || /"auth"\./i.test(stmt)) refs.push("auth.schema");
  return [...new Set(refs)];
}

function main() {
  const tempPath = path.join(process.env.TEMP || os.tmpdir(), "reddirt-production-to-current-schema-diff.sql");
  let sourceDiffPath = "";
  let sourceFound = false;
  let sql = "";

  if (fs.existsSync(DATA_SQL)) {
    sourceDiffPath = path.relative(ROOT, DATA_SQL);
    sourceFound = true;
    sql = fs.readFileSync(DATA_SQL, "utf8");
  } else if (fs.existsSync(tempPath)) {
    fs.mkdirSync(path.dirname(DATA_SQL), { recursive: true });
    fs.copyFileSync(tempPath, DATA_SQL);
    sourceDiffPath = path.relative(ROOT, DATA_SQL);
    sourceFound = true;
    sql = fs.readFileSync(DATA_SQL, "utf8");
  } else {
    sourceDiffPath = path.relative(ROOT, DATA_SQL);
    sourceFound = false;
  }

  const statements = sourceFound ? splitSqlStatements(sql) : [];
  let createTypeCount = 0;
  let createTableCount = 0;
  let alterTableCount = 0;
  let createIndexCount = 0;
  let dropCount = 0;
  let truncateCount = 0;
  let deleteCount = 0;
  let authMutationCount = 0;
  let providerSchemaMutationCount = 0;
  let legacyPublicConstraintDropCount = 0;

  const highRiskFindings = [];
  const unsafeSamples = [];
  const highValueReferences = [];

  const pushSample = (kind, stmt, limit = 320) => {
    if (unsafeSamples.length >= 48) return;
    const oneLine = stmt.replace(/\s+/g, " ").trim();
    unsafeSamples.push({
      kind,
      preview: oneLine.length > limit ? `${oneLine.slice(0, limit)}…` : oneLine,
    });
  };

  statements.forEach((stmt, idx) => {
    const body = stripLeadingLineComments(stmt);
    const head = body.slice(0, 4000);
    if (/^\s*CREATE\s+TYPE/i.test(body)) createTypeCount++;
    if (/^\s*CREATE\s+TABLE/i.test(body)) createTableCount++;
    if (/^\s*ALTER\s+TABLE/i.test(body)) alterTableCount++;
    if (/^\s*CREATE\s+(UNIQUE\s+)?INDEX/i.test(body)) createIndexCount++;
    if (/\bTRUNCATE\b/i.test(body)) {
      truncateCount++;
      pushSample("truncate", stmt);
      highRiskFindings.push(`Statement ${idx}: TRUNCATE`);
    }
    if (/\bDELETE\s+FROM\b/i.test(body)) {
      deleteCount++;
      pushSample("delete", stmt);
      highRiskFindings.push(`Statement ${idx}: DELETE FROM`);
    }
    if (/\bDROP\b/i.test(body)) {
      dropCount++;
      if (!/ALTER\s+TABLE[\s\S]*ALTER\s+COLUMN[\s\S]*DROP\s+(NOT\s+NULL|DEFAULT)/i.test(body)) {
        pushSample("drop", stmt);
      }
    }

    if (/^\s*ALTER\s+TABLE\s+"auth"/i.test(body) || /ALTER\s+TABLE\s+auth\./i.test(body)) {
      authMutationCount++;
      pushSample("auth_alter", stmt);
      highRiskFindings.push(`Statement ${idx}: ALTER TABLE auth.*`);
    }
    if (
      /^\s*ALTER\s+TABLE\s+"storage"/i.test(body) ||
      /^\s*ALTER\s+TABLE\s+"realtime"/i.test(body) ||
      /^\s*ALTER\s+TABLE\s+"vault"/i.test(body)
    ) {
      providerSchemaMutationCount++;
      pushSample("provider_alter", stmt);
      highRiskFindings.push(`Statement ${idx}: ALTER TABLE provider-owned schema`);
    }

    const alterDrop = /ALTER\s+TABLE[\s\S]*\bDROP\s+(?!NOT\s+NULL\b|DEFAULT\b)/i.test(head);
    if (alterDrop) {
      pushSample("alter_table_drop", stmt);
      highRiskFindings.push(`Statement ${idx}: ALTER TABLE … DROP (non NOT NULL/DEFAULT)`);
    }

    const altName = firstAlterTableName(body);
    if (altName && alterDrop) {
      const low = altName.toLowerCase();
      if (HIGH_VALUE.has(low) || isVoterLike(low)) {
        if (/\bDROP\s+CONSTRAINT/i.test(stmt)) {
          legacyPublicConstraintDropCount++;
          highRiskFindings.push(`Statement ${idx}: legacy public table constraint drop: ${altName}`);
        }
      }
    }

    const hv = statementTouchesHighValue(stmt);
    for (const t of hv) {
      highValueReferences.push({
        table: t,
        statementIndex: idx,
        preview: stmt.replace(/\s+/g, " ").trim().slice(0, 220),
      });
    }
  });

  const reason =
    !sourceFound
      ? "Unsafe diff SQL file not found under data/sql or %TEMP%; operator must regenerate from verified read-only diff and copy into repo or temp path."
      : `Raw diff contains destructive or provider mutations (drops=${dropCount}, alters=${alterTableCount}, auth/provider alters=${authMutationCount + providerSchemaMutationCount}, legacy constraint drops=${legacyPublicConstraintDropCount}).`;

  const json = {
    schemaVersion: "1.0",
    slice: SLICE,
    generatedAt: new Date().toISOString(),
    mode: "unsafe_diff_analysis",
    sourceDiffPath,
    sourceFound,
    summary: {
      statementCount: statements.length,
      createTypeCount,
      createTableCount,
      alterTableCount,
      createIndexCount,
      dropCount,
      truncateCount,
      deleteCount,
      authMutationCount,
      providerSchemaMutationCount,
      legacyPublicConstraintDropCount,
    },
    highRiskFindings: [...new Set(highRiskFindings)].slice(0, 200),
    unsafeSamples,
    highValueReferences: highValueReferences.slice(0, 400),
    recommendation: {
      rawDiffSafeToExecute: false,
      reason,
      nextStep: "Build curated additive-only SQL candidate.",
    },
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(json, null, 2), "utf8");

  const md = `# Unsafe production schema diff analysis

## **The raw Prisma diff is not safe to execute.**

**Slice:** \`${SLICE}\`  
**Generated:** ${json.generatedAt}  
**Machine JSON:** [\`data/unsafe-production-schema-diff-analysis.json\`](../data/unsafe-production-schema-diff-analysis.json)

## Source

- **Found:** ${sourceFound ? "yes" : "no"}
- **Path used:** \`${sourceDiffPath || "(none)"}\`
- **Temp fallback checked:** \`${path.relative(ROOT, tempPath)}\`

## Summary counts

| Metric | Value |
|--------|------:|
| Statements | ${json.summary.statementCount} |
| CREATE TYPE | ${json.summary.createTypeCount} |
| CREATE TABLE | ${json.summary.createTableCount} |
| ALTER TABLE | ${json.summary.alterTableCount} |
| CREATE INDEX | ${json.summary.createIndexCount} |
| DROP (token hits) | ${json.summary.dropCount} |
| TRUNCATE | ${json.summary.truncateCount} |
| DELETE FROM | ${json.summary.deleteCount} |
| ALTER auth.* | ${json.summary.authMutationCount} |
| ALTER storage/realtime/vault | ${json.summary.providerSchemaMutationCount} |
| Legacy public DROP CONSTRAINT (heuristic) | ${json.summary.legacyPublicConstraintDropCount} |

## Recommendation

**Raw diff safe to execute:** **No** — ${json.recommendation.reason}

**Next step:** ${json.recommendation.nextStep}

## High-risk findings (deduped, capped)

${json.highRiskFindings.length ? json.highRiskFindings.map((x) => `- ${x}`).join("\n") : "- (none parsed beyond summary)"}

## Unsafe samples (capped)

See JSON \`unsafeSamples\` for machine-readable previews.

## Governance

This packet **does not** execute SQL against production, **does not** baseline production, and **does not** run Prisma migrate against production.
`;

  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_MD, md, "utf8");

  console.log(sourceFound ? "OK analyze-unsafe-production-diff.mjs (source found)" : "WARN analyze-unsafe-production-diff.mjs (source missing — blocked report)");
  console.log(" ", path.relative(ROOT, OUT_JSON));
  console.log(" ", path.relative(ROOT, OUT_MD));
}

main();
