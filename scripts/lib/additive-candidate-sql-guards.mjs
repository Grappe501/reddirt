/**
 * Shared additive candidate SQL parsing / safety scans (RedDirt lane).
 * No filesystem side effects; no DB.
 */

export const PRODUCTION_SUPABASE_PROJECT_REF = "giozeoqulfojhxpywjil";

/** Same algorithm as validate-additive-schema-install-candidate.mjs */
export function splitSqlStatements(sql) {
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

export function stripLeadingLineComments(stmt) {
  return stmt.replace(/^(\s*--[^\n]*\n)+/g, "").trim();
}

export function analyzeCandidateSql(raw) {
  const stmts = splitSqlStatements(raw).map(stripLeadingLineComments).filter((s) => s.length > 0);
  let createTypeCount = 0;
  let createTableCount = 0;
  let createIndexCount = 0;
  let alterTableCount = 0;
  let dropCount = 0;
  let truncateCount = 0;
  let deleteCount = 0;
  let insertCount = 0;
  let updateCount = 0;
  const destructiveHits = [];

  for (let idx = 0; idx < stmts.length; idx++) {
    const s = stmts[idx];
    const low = s.toLowerCase();
    if (/^\s*create\s+type\b/i.test(s)) createTypeCount++;
    if (/^\s*create\s+table\b/i.test(s)) createTableCount++;
    if (/^\s*create\s+(unique\s+)?index\b/i.test(s)) createIndexCount++;
    if (/^\s*alter\s+table\b/i.test(s)) alterTableCount++;

    const dropStmt =
      /\bdrop\b/.test(low) && !/alter\s+table[\s\S]*alter\s+column[\s\S]*drop\s+(not\s+null|default)\b/.test(low);
    if (dropStmt) {
      dropCount++;
      destructiveHits.push({ idx, kind: "drop", preview: s.slice(0, 120) });
    }
    if (/\btruncate\b/.test(low)) {
      truncateCount++;
      destructiveHits.push({ idx, kind: "truncate", preview: s.slice(0, 120) });
    }
    if (/\bdelete\s+from\b/.test(low)) {
      deleteCount++;
      destructiveHits.push({ idx, kind: "delete", preview: s.slice(0, 120) });
    }
    if (/\binsert\s+into\b/.test(low)) {
      insertCount++;
      destructiveHits.push({ idx, kind: "insert", preview: s.slice(0, 120) });
    }
    if (/\bupdate\s+/.test(low) && !/update\s+statistics/.test(low)) {
      updateCount++;
      destructiveHits.push({ idx, kind: "update", preview: s.slice(0, 120) });
    }
    if (/alter\s+table[\s\S]*\bdrop\b/.test(low) && !/alter\s+column[\s\S]*drop\s+(not\s+null|default)\b/.test(low)) {
      destructiveHits.push({ idx, kind: "alter_drop", preview: s.slice(0, 120) });
    }
    if (/"auth"\./i.test(s) || /alter\s+table\s+"auth"/i.test(s) || /create\s+table\s+"auth"/i.test(s)) {
      destructiveHits.push({ idx, kind: "auth_touch", preview: s.slice(0, 120) });
    }
    if (/\bstorage\./i.test(s) || /"storage"\./i.test(s)) {
      destructiveHits.push({ idx, kind: "storage_touch", preview: s.slice(0, 120) });
    }
    if (/\brealtime\./i.test(s) || /"realtime"\./i.test(s)) {
      destructiveHits.push({ idx, kind: "realtime_touch", preview: s.slice(0, 120) });
    }
    if (/\bvault\./i.test(s) || /"vault"\./i.test(s)) {
      destructiveHits.push({ idx, kind: "vault_touch", preview: s.slice(0, 120) });
    }
  }

  return {
    statementCount: stmts.length,
    createTypeCount,
    createTableCount,
    createIndexCount,
    alterTableCount,
    dropCount,
    truncateCount,
    deleteCount,
    insertCount,
    updateCount,
    destructiveHits,
    noDestructiveViolations: destructiveHits.length === 0,
    statements: stmts,
  };
}

export function extractSupabaseRef(url) {
  if (!url || typeof url !== "string") return null;
  const m = url.match(/db\.([a-z0-9]{15,25})\.supabase\.co/i);
  return m ? m[1].toLowerCase() : null;
}

const HIGH_VALUE_TABLES_LOWER = new Set([
  "ar02_voters",
  "contacts",
  "counties",
  "event_requests",
  "message_audiences",
  "path_to_victory",
  "people",
  "person_profiles",
]);

/** Returns names (lowercase) of high-value tables that candidate tries to CREATE. */
export function findForbiddenCreateTableHits(statements) {
  const hits = [];
  for (const s of statements) {
    const m = s.match(/^\s*create\s+table\s+(?:if\s+not\s+exists\s+)?(?:"public"\.)?"([^"]+)"\s*\(/i);
    if (m) {
      const name = m[1].toLowerCase();
      if (HIGH_VALUE_TABLES_LOWER.has(name)) hits.push(name);
      continue;
    }
    const m2 = s.match(/^\s*create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)\s*\(/i);
    if (m2) {
      const name = m2[1].toLowerCase();
      if (HIGH_VALUE_TABLES_LOWER.has(name)) hits.push(name);
    }
  }
  return hits;
}

export function evaluateCloneProofHardened(clone) {
  const gates = {
    ok: clone?.ok === true,
    productionLikePrecheckPassed: clone?.productionLikePrecheckPassed === true,
    productionLikeCloneProof: clone?.productionLikeCloneProof === true,
    beforePublicTableCountGte100:
      typeof clone?.before?.publicTableCount === "number" && clone.before.publicTableCount >= 100,
    afterPublicGteBefore:
      typeof clone?.before?.publicTableCount === "number" &&
      typeof clone?.after?.publicTableCount === "number" &&
      clone.after.publicTableCount >= clone.before.publicTableCount,
    beforeAr02VotersExists: clone?.before?.ar02VotersExists === true,
    beforeContactsExists: clone?.before?.contactsExists === true,
    beforeAuthUsersExists: clone?.before?.authUsersExists === true,
    afterAr02VotersExists: clone?.after?.ar02VotersExists === true,
    afterContactsExists: clone?.after?.contactsExists === true,
    afterAuthUsersExists: clone?.after?.authUsersExists === true,
    voterTablesStillPresent: clone?.highValueProtection?.voterTablesStillPresent === true,
    legacyTablesStillPresent: clone?.highValueProtection?.legacyTablesStillPresent === true,
    authTablesStillPresent: clone?.highValueProtection?.authTablesStillPresent === true,
    productionMutatedFalse: clone?.productionMutated === false,
    candidateSqlExecutedOnProductionFalse: clone?.candidateSqlExecutedOnProduction === false,
    candidateSqlExecutedOnCloneWhenPresent:
      clone?.candidateSqlExecutedOnClone === undefined ? true : clone.candidateSqlExecutedOnClone === true,
  };

  const passed = Object.values(gates).every(Boolean);
  const claimsPassButHardenedFails =
    Boolean(clone?.ok && clone?.recommendation?.cloneProofPassed) && !passed;

  return { gates, passed, claimsPassButHardenedFails };
}

export function liveSendApprovalHeuristic() {
  const violations = [];
  for (const [k, v] of Object.entries(process.env)) {
    if (!k || v == null || v === "") continue;
    const ku = k.toUpperCase();
    const vu = String(v).toUpperCase();
    if (
      (ku.includes("LIVE_SEND") && (vu === "TRUE" || vu === "1" || vu === "YES" || vu === "ON")) ||
      (ku.includes("BROADCAST") && ku.includes("APPROVE") && (vu === "TRUE" || vu === "YES" || vu === "1")) ||
      ku === "REDDIRT_LIVE_SEND_APPROVED" ||
      ku === "SENDGRID_LIVE_APPROVED"
    ) {
      violations.push(`suspicious env for live send governance: ${k}`);
    }
  }
  return violations;
}
