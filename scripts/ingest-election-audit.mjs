/**
 * INGEST-OPS-3 / INGEST-OPS-3B — compare election JSON on disk vs `ElectionResultSource` (read-only).
 *
 *   npm run ingest:election-audit
 *   npm run ingest:election-audit:json
 *   npm run ingest:election-audit:doc
 *
 * Flags: --json | --write-doc
 * Env: ELECTION_AUDIT_DIR, DATABASE_URL, ELECTION_AUDIT_VERIFIED_AGAINST, ELECTION_AUDIT_OPERATOR, ELECTION_AUDIT_NOTES
 * No DB writes, no migrations, no automatic ingest.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Load `RedDirt/.env` into `process.env` if present (no dependency on @next/env for plain `node`). */
function loadDotEnv(repo) {
  const p = path.join(repo, ".env");
  if (!fs.existsSync(p)) return;
  const raw = fs.readFileSync(p, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq < 1) continue;
    const k = t.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(k)) continue;
    let v = t.slice(eq + 1).trim();
    if (v.length >= 2) {
      const a = v[0];
      const b = v[v.length - 1];
      if ((a === '"' && b === '"') || (a === "'" && b === "'")) v = v.slice(1, -1);
    }
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const DEFAULT_ELECTION_DIR = path.join(
  repoRoot,
  "..",
  "campaign information for ingestion",
  "electionResults",
);

const TABLE_START = "<!-- ELECTION_AUDIT_TABLE_AUTO:START -->";
const TABLE_END = "<!-- ELECTION_AUDIT_TABLE_AUTO:END -->";
const SUMMARY_START = "<!-- ELECTION_AUDIT_SUMMARY_AUTO:START -->";
const SUMMARY_END = "<!-- ELECTION_AUDIT_SUMMARY_AUTO:END -->";
const MARKER_START = "<!-- ELECTION_AUDIT_MARKER_AUTO:START -->";
const MARKER_END = "<!-- ELECTION_AUDIT_MARKER_AUTO:END -->";

function normKey(p) {
  return path.resolve(p).replace(/\//g, "\\").toLowerCase();
}

function parseYearType(base) {
  const m = /^(\d{4})/.exec(base);
  const year = m ? m[1] : "";
  const rest = base
    .replace(/\.json$/i, "")
    .replace(/^\d{4}_?/, "")
    .replace(/^\d{4}-/, "");
  const type =
    rest
      .replace(/_/g, " ")
      .replace(/-/g, " ")
      .trim() || "unknown";
  return { year, type: type || "unknown" };
}

function hasFlag(n) {
  return process.argv.includes(n);
}

function cell(s) {
  return String(s ?? "").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

async function tryLoadDbRows() {
  loadDotEnv(repoRoot);
  const { PrismaClient } = await import("@prisma/client");
  /** @type {import("@prisma/client").PrismaClient | null} */
  let prisma = null;
  try {
    prisma = new PrismaClient();
    const rows = await prisma.electionResultSource.findMany({
      orderBy: { electionDate: "asc" },
      select: {
        id: true,
        sourcePath: true,
        sourceName: true,
        electionName: true,
        electionDate: true,
        parserVariant: true,
        importedAt: true,
      },
    });
    return { rows, err: null };
  } catch (err) {
    return { rows: [], err: /** @type {Error} */ (err) };
  } finally {
    if (prisma) {
      try {
        await prisma.$disconnect();
      } catch {
        /* ignore */
      }
    }
  }
}

async function runAudit() {
  const dir = process.env.ELECTION_AUDIT_DIR
    ? path.resolve(process.env.ELECTION_AUDIT_DIR)
    : DEFAULT_ELECTION_DIR;

  if (!fs.existsSync(dir)) {
    return {
      error: new Error(
        `Election results folder not found: ${dir}\nSet ELECTION_AUDIT_DIR or create the canonical path.`,
      ),
      result: null,
    };
  }

  const filePaths = fs
    .readdirSync(dir)
    .filter((n) => n.toLowerCase().endsWith(".json"))
    .map((n) => path.join(dir, n));
  filePaths.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const { rows, err } = await tryLoadDbRows();
  const dbReachable = !err;
  const byPath = new Map();
  if (dbReachable) {
    for (const r of rows) {
      byPath.set(normKey(r.sourcePath), r);
    }
  }

  const files = [];
  let ingestedCount = 0;
  let missingCount = 0;

  for (const fp of filePaths) {
    const fileName = path.basename(fp);
    const filePath = path.resolve(fp);
    const { year, type: typeFromName } = parseYearType(fileName);
    if (!dbReachable) {
      files.push({
        fileName,
        filePath,
        expectedYear: year,
        typeFromName,
        existsInDb: "unknown",
        dbRecordId: null,
        ingestStatus: "unknown",
        notes: "Database unreachable — re-run with Postgres or use SQL in ELECTION_INGEST_AUDIT.md",
      });
    } else {
      const r = byPath.get(normKey(filePath));
      if (r) {
        ingestedCount += 1;
        files.push({
          fileName,
          filePath,
          expectedYear: year,
          typeFromName,
          existsInDb: true,
          dbRecordId: r.id,
          ingestStatus: "ingested",
          notes: "",
        });
      } else {
        missingCount += 1;
        files.push({
          fileName,
          filePath,
          expectedYear: year,
          typeFromName,
          existsInDb: false,
          dbRecordId: null,
          ingestStatus: "missing",
          notes: "No matching ElectionResultSource.sourcePath (normalized) for this file",
        });
      }
    }
  }

  let status = "BLOCKED";
  if (dbReachable) {
    status = missingCount === 0 ? "COMPLETE" : "PARTIAL";
  }

  const extraDbPaths = [];
  if (dbReachable) {
    for (const r of rows) {
      if (!filePaths.some((f) => normKey(f) === normKey(r.sourcePath))) {
        extraDbPaths.push(r.sourcePath);
      }
    }
  }

  const result = {
    totalFiles: filePaths.length,
    dbReachable,
    dbError: err ? String(err.message ?? err) : null,
    ingestedCount: dbReachable ? ingestedCount : null,
    missingCount: dbReachable ? missingCount : null,
    status,
    extraInDbOnly: extraDbPaths,
    files,
  };

  return { error: null, result };
}

function buildTableMarkdown(/** @type {NonNullable<Awaited<ReturnType<typeof runAudit>>["result"]>} */ a) {
  const lines = [
    "| file_name | file_path | expected_year | exists_in_db | db_record_id | ingest_status | notes |",
    "|-----------|-----------|---------------|--------------|--------------|---------------|-------|",
  ];
  for (const f of a.files) {
    const ex =
      f.existsInDb === "unknown" ? "unknown" : f.existsInDb ? "yes" : "no";
    lines.push(
      `| \`${cell(f.fileName)}\` | \`${cell(f.filePath)}\` | ${cell(f.expectedYear)} | ${ex} | ${f.dbRecordId ? `\`${cell(f.dbRecordId)}\`` : "—"} | **${cell(f.ingestStatus)}** | ${cell(f.notes)} |`,
    );
  }
  if (a.extraInDbOnly.length) {
    lines.push(
      "",
      "*Rows in `ElectionResultSource` whose `sourcePath` does not match any file in the scanned folder (informational):*",
    );
    for (const p of a.extraInDbOnly) {
      lines.push(`- \`${cell(p)}\``);
    }
  }
  return lines.join("\n");
}

function buildSummaryMarkdown(/** @type {NonNullable<Awaited<ReturnType<typeof runAudit>>["result"]>} */ a) {
  const next =
    a.status === "BLOCKED"
      ? "Start Postgres (`npm run dev:db`), set `DATABASE_URL`, then re-run `npm run ingest:election-audit:doc` or `ingest:election-audit:json`."
      : a.status === "PARTIAL"
        ? "Ingest **missing** files only: dry-run first, then one file per `ingest:election-results` (newest → oldest). See [`ELECTION_INGEST_OPERATOR_RUNBOOK.md`](./ELECTION_INGEST_OPERATOR_RUNBOOK.md)."
        : "All scanned JSONs have a matching `ElectionResultSource` row. Next: **INGEST-OPS-4** (brain/source manifest) when ready; do not expand GOTV/Comms/Intel past the gate without waiver.";

  return [
    `| Metric | Value |`,
    `|--------|--------|`,
    `| **Election Ingest Status** | **${a.status}** |`,
    `| **DB reachable** | ${a.dbReachable ? "yes" : "no"} |`,
    `| **Ingested (matched) count** | ${a.dbReachable ? String(a.ingestedCount) : "— (unknown until DB is reachable)"} |`,
    `| **Missing count** | ${a.dbReachable ? String(a.missingCount) : "— (unknown until DB is reachable)"} |`,
    `| **Total files scanned** | ${a.totalFiles} |`,
    `| **Next** | ${next} |`,
  ].join("\n");
}

function buildMarkerBlock(/** @type {NonNullable<Awaited<ReturnType<typeof runAudit>>["result"]>} */ a) {
  const ts = new Date().toISOString();
  const against =
    process.env.ELECTION_AUDIT_VERIFIED_AGAINST?.trim() ||
    "(set \`ELECTION_AUDIT_VERIFIED_AGAINST\` when running \`ingest:election-audit:doc\` — e.g. \`local Docker postgres reddirt\` or production name)";
  const op =
    process.env.ELECTION_AUDIT_OPERATOR?.trim() ||
    "_(set \`ELECTION_AUDIT_OPERATOR\` — initials or name)_";
  const notes = process.env.ELECTION_AUDIT_NOTES?.trim() || "—";

  return [
    "**Completion marker (auto — edit env vars to fill operator line before handoff if needed)**",
    "",
    "Election Ingest Status:",
    `- **${a.status}**`,
    "",
    "Last verified:",
    `- \`${ts}\` (script-generated ISO time)`,
    "",
    "Verified against:",
    `- ${against}`,
    "",
    "Operator:",
    `- ${op}`,
    "",
    "Notes:",
    `- ${cell(notes)}`,
  ].join("\n");
}

function replaceRegion(content, startTag, endTag, newInner) {
  if (!content.includes(startTag) || !content.includes(endTag)) {
    return null;
  }
  const re = new RegExp(
    `${startTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${endTag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
    "m",
  );
  if (!re.test(content)) return null;
  return content.replace(
    re,
    `${startTag}\n\n${newInner}\n\n${endTag}`,
  );
}

async function main() {
  const asJson = hasFlag("--json");
  const writeDoc = hasFlag("--write-doc");

  const { error, result } = await runAudit();
  if (error || !result) {
    // eslint-disable-next-line no-console
    console.error(error?.message ?? "Unknown error");
    process.exit(2);
  }

  if (asJson) {
    const out = {
      totalFiles: result.totalFiles,
      dbReachable: result.dbReachable,
      ingestedCount: result.ingestedCount,
      missingCount: result.missingCount,
      status: result.status,
      dbError: result.dbError,
      files: result.files.map((f) => ({
        fileName: f.fileName,
        filePath: f.filePath,
        existsInDb: f.existsInDb,
        dbRecordId: f.dbRecordId,
        ingestStatus: f.ingestStatus,
        notes: f.notes,
      })),
    };
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(out, null, 2));
  } else {
    // eslint-disable-next-line no-console
    console.log(
      `--- Election JSON inventory (${result.totalFiles} files) — status: ${result.status} ---`,
    );
    for (const f of result.files) {
      const { year, type: t } = parseYearType(f.fileName);
      // eslint-disable-next-line no-console
      console.log(`${f.fileName}\t${year}\t${t}\t${f.ingestStatus}`);
    }
    if (!result.dbReachable) {
      // eslint-disable-next-line no-console
      console.log(
        `\nDatabase unreachable. ${result.dbError}\n` +
          "Start Postgres (e.g. `npm run dev:db`) and re-run, or use SQL in `docs/ELECTION_INGEST_AUDIT.md`.",
      );
    } else {
      // eslint-disable-next-line no-console
      console.log(
        `\nDB reachable. Ingested: ${result.ingestedCount}, missing: ${result.missingCount}.`,
      );
    }
  }

  if (writeDoc) {
    const docPath = path.join(repoRoot, "docs", "ELECTION_INGEST_AUDIT.md");
    let text = fs.readFileSync(docPath, "utf8");
    const tableMd = buildTableMarkdown(result);
    const sumMd = buildSummaryMarkdown(result);
    const markMd = buildMarkerBlock(result);
    const withTable = replaceRegion(text, TABLE_START, TABLE_END, tableMd);
    const withSum = withTable
      ? replaceRegion(withTable, SUMMARY_START, SUMMARY_END, sumMd)
      : null;
    const withMarker = withSum
      ? replaceRegion(withSum, MARKER_START, MARKER_END, markMd)
      : null;
    if (!withTable || !withSum || !withMarker) {
      // eslint-disable-next-line no-console
      console.error(
        "Could not find auto-update markers in docs/ELECTION_INGEST_AUDIT.md. Expected: TABLE, SUMMARY, and MARKER regions.",
      );
      process.exit(1);
    }
    fs.writeFileSync(docPath, withMarker, "utf8");
    if (!asJson) {
      // eslint-disable-next-line no-console
      console.log(`\nWrote ${path.relative(process.cwd(), docPath)}`);
    }
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
