import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

/** Canonical Kelly / RedDirt production Supabase project ref (safe to expose; not a secret). */
export const HOSTED_DB_PROOF_REQUIRED_PRODUCTION_PROJECT_REF = "giozeoqulfojhxpywjil";

/** Expected `_prisma_migrations` row count after migration-history alignment (see migration preflight artifacts). */
export const HOSTED_DB_PROOF_EXPECTED_PRISMA_MIGRATIONS_COUNT = 71;

/** Legacy public tables that must exist on the shared production campaign DB (additive schema preserved). */
export const HOSTED_DB_PROOF_LEGACY_PUBLIC_TABLES = [
  "ar02_voters",
  "contacts",
  "counties",
  "event_requests",
  "message_audiences",
  "path_to_victory",
  "people",
  "person_profiles",
] as const;

/** New app tables that must exist after additive + Prisma migrations (aligned with migration-history preflight). */
export const HOSTED_DB_PROOF_NEW_APP_PUBLIC_TABLES = [
  "ContentItemOverride",
  "HomepageConfig",
  "InboundContentItem",
  "CampaignEvent",
  "AdminContentBlock",
  "OwnedMediaAsset",
  "SearchChunk",
  "WorkflowIntake",
  "EmailContactProfile",
  "EmailWorkflowItem",
] as const;

export type HostedDbUrlEnvReport = {
  present: boolean;
  supabaseProjectRefConfirmed?: boolean;
  parseHint?: string;
};

export type HostedDbEnvPresence = {
  DATABASE_URL: HostedDbUrlEnvReport;
  DIRECT_URL: HostedDbUrlEnvReport;
};

export type HostedDbReadOnlyDatabaseResult = {
  reachable: boolean;
  selectOneOk: boolean;
  safeCounts: Array<{ table: string; ok: boolean }>;
  provider: "postgresql" | "unknown";
  sanitizedError: string | null;
};

export type HostedDbTablePresenceRow = { table: string; ok: boolean };

export type HostedDbPrismaMigrationsProbe = {
  tablePresent: boolean;
  rowCount: number | null;
  expectedCount: number;
  countMatchesExpected: boolean;
};

/**
 * Read-only structural proof that the connected DB matches the RedDirt production contract
 * (ref on DATABASE_URL, legacy + app tables, auth.users, _prisma_migrations row count).
 * Never includes connection strings, passwords, or row samples from voter tables.
 */
export type HostedDbProductionSchemaContract = {
  requiredProductionProjectRef: string;
  /** Lowercase ref parsed from DATABASE_URL only (never password or full URI). */
  databaseUrlSupabaseProjectRef: string | null;
  /** Lowercase ref parsed from DIRECT_URL when set. */
  directUrlSupabaseProjectRef: string | null;
  databaseUrlRefMatchesProduction: boolean;
  /** null when DIRECT_URL is absent; false when set but ref mismatched. */
  directUrlRefMatchesProduction: boolean | null;
  legacyPublicTables: HostedDbTablePresenceRow[];
  newAppPublicTables: HostedDbTablePresenceRow[];
  authUsersTablePresent: boolean;
  prismaMigrations: HostedDbPrismaMigrationsProbe;
  /** True when DATABASE_URL ref + table probes + migration count all match the production contract. */
  contractSatisfied: boolean;
};

export type HostedDbProofPayload = {
  ok: boolean;
  mode: "hosted_db_readonly_proof";
  env: HostedDbEnvPresence;
  database: HostedDbReadOnlyDatabaseResult;
  productionSchemaContract: HostedDbProductionSchemaContract;
  proof: {
    readOnly: true;
    mutatedData: false;
    migrationsRun: false;
    /**
     * True when read-only probes confirm the canonical RedDirt production contract:
     * DATABASE_URL ref `giozeoqulfojhxpywjil`, required legacy + new public tables, `auth.users`,
     * `_prisma_migrations` row count 71, and DIRECT_URL ref match when DIRECT_URL is set.
     */
    productionCanonical: boolean;
  };
  warnings: string[];
  nextRecommendedStep: string;
};

function sanitizeDbError(message: string): string {
  let s = message.replace(/postgresql:\/\/[^\s"'<>]+/gi, "[redacted]").replace(/postgres:\/\/[^\s"'<>]+/gi, "[redacted]");
  s = s.replace(/password=\S+/gi, "password=[redacted]");
  if (s.length > 240) s = `${s.slice(0, 240)}…`;
  return s;
}

/**
 * Supabase project ref from a Postgres URL without logging secrets.
 * Supports pooler `postgres.<ref>` userinfo and host `db.<ref>.supabase.co`.
 */
export function extractSupabaseProjectRefFromDatabaseUrl(url: string): {
  ref: string | null;
  parseHint: string | undefined;
} {
  const u = url.trim();
  const authMatch = u.match(/^postgres(?:ql)?:\/\/([^/?#]*)@/i);
  if (authMatch) {
    const userinfo = authMatch[1];
    const colonIdx = userinfo.indexOf(":");
    const userPartRaw = colonIdx === -1 ? userinfo : userinfo.slice(0, colonIdx);
    let userPart = userPartRaw;
    try {
      userPart = decodeURIComponent(userPartRaw);
    } catch {
      /* keep raw */
    }
    const poolerUser = userPart.match(/^postgres\.([a-z0-9]{15,25})$/i);
    if (poolerUser) return { ref: poolerUser[1].toLowerCase(), parseHint: "username_postgres_dot_ref" };
  }
  const hostMatch = u.match(/db\.([a-z0-9]{15,25})\.supabase\.co/i);
  if (hostMatch) return { ref: hostMatch[1].toLowerCase(), parseHint: "host_db_dot_ref" };
  return { ref: null, parseHint: undefined };
}

function sqlIdentPublicTable(s: string): string {
  if (!/^[a-zA-Z0-9_]+$/.test(String(s))) throw new Error("invalid_identifier");
  return String(s);
}

function buildHostedDbUrlEnvReport(urlRaw: string | undefined): HostedDbUrlEnvReport {
  const trimmed = urlRaw?.trim();
  if (!trimmed) return { present: false };
  const { ref, parseHint } = extractSupabaseProjectRefFromDatabaseUrl(trimmed);
  const supabaseProjectRefConfirmed = ref === HOSTED_DB_PROOF_REQUIRED_PRODUCTION_PROJECT_REF;
  const report: HostedDbUrlEnvReport = { present: true, supabaseProjectRefConfirmed };
  if (parseHint) report.parseHint = parseHint;
  else if (!ref) report.parseHint = "ref_unparsed";
  return report;
}

export function getHostedDbEnvPresence(): HostedDbEnvPresence {
  return {
    DATABASE_URL: buildHostedDbUrlEnvReport(process.env.DATABASE_URL),
    DIRECT_URL: buildHostedDbUrlEnvReport(process.env.DIRECT_URL),
  };
}

async function tableExistsInPublic(table: string): Promise<boolean> {
  const safe = sqlIdentPublicTable(table);
  const rows = await prisma.$queryRawUnsafe<Array<{ e: boolean }>>(
    `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${safe}') AS e`,
  );
  const r = Array.isArray(rows) ? rows[0] : rows;
  return Boolean(r?.e);
}

async function authUsersMetadataPresent(): Promise<boolean> {
  const rows = await prisma.$queryRaw<Array<{ e: boolean }>>`
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') AS e`;
  const r = Array.isArray(rows) ? rows[0] : rows;
  return Boolean(r?.e);
}

async function probePrismaMigrations(): Promise<HostedDbPrismaMigrationsProbe> {
  const expectedCount = HOSTED_DB_PROOF_EXPECTED_PRISMA_MIGRATIONS_COUNT;
  const existsRows = await prisma.$queryRaw<Array<{ e: boolean }>>`
    SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_prisma_migrations') AS e`;
  const er = Array.isArray(existsRows) ? existsRows[0] : existsRows;
  const tablePresent = Boolean(er?.e);
  if (!tablePresent) {
    return { tablePresent: false, rowCount: null, expectedCount, countMatchesExpected: false };
  }
  const cntRows = await prisma.$queryRaw<Array<{ c: number | bigint }>>`
    SELECT COUNT(*)::bigint AS c FROM public._prisma_migrations`;
  const cr = Array.isArray(cntRows) ? cntRows[0] : cntRows;
  const raw = cr?.c;
  const rowCount = raw == null ? null : Number(raw);
  const countMatchesExpected = rowCount === expectedCount;
  return { tablePresent: true, rowCount, expectedCount, countMatchesExpected };
}

async function probeProductionSchemaContract(
  env: HostedDbEnvPresence,
  allowTableQueries: boolean,
): Promise<HostedDbProductionSchemaContract> {
  const requiredProductionProjectRef = HOSTED_DB_PROOF_REQUIRED_PRODUCTION_PROJECT_REF;
  const du = process.env.DATABASE_URL?.trim();
  const { ref: dbUrlRef } = du ? extractSupabaseProjectRefFromDatabaseUrl(du) : { ref: null as string | null };
  const directTrim = process.env.DIRECT_URL?.trim();
  const { ref: directRef } = directTrim ? extractSupabaseProjectRefFromDatabaseUrl(directTrim) : { ref: null as string | null };

  const databaseUrlRefMatchesProduction = dbUrlRef === requiredProductionProjectRef;
  const directUrlRefMatchesProduction: boolean | null = directTrim ? directRef === requiredProductionProjectRef : null;

  const emptyLegacy = HOSTED_DB_PROOF_LEGACY_PUBLIC_TABLES.map((table) => ({ table, ok: false }));
  const emptyNew = HOSTED_DB_PROOF_NEW_APP_PUBLIC_TABLES.map((table) => ({ table, ok: false }));

  const prismaMigrationsIdle: HostedDbPrismaMigrationsProbe = {
    tablePresent: false,
    rowCount: null,
    expectedCount: HOSTED_DB_PROOF_EXPECTED_PRISMA_MIGRATIONS_COUNT,
    countMatchesExpected: false,
  };

  if (!env.DATABASE_URL.present || !databaseUrlRefMatchesProduction || !allowTableQueries) {
    return {
      requiredProductionProjectRef,
      databaseUrlSupabaseProjectRef: dbUrlRef,
      directUrlSupabaseProjectRef: directRef,
      databaseUrlRefMatchesProduction,
      directUrlRefMatchesProduction,
      legacyPublicTables: emptyLegacy,
      newAppPublicTables: emptyNew,
      authUsersTablePresent: false,
      prismaMigrations: prismaMigrationsIdle,
      contractSatisfied: false,
    };
  }

  try {
    const legacyPublicTables: HostedDbTablePresenceRow[] = [];
    for (const table of HOSTED_DB_PROOF_LEGACY_PUBLIC_TABLES) {
      legacyPublicTables.push({ table, ok: await tableExistsInPublic(table) });
    }
    const newAppPublicTables: HostedDbTablePresenceRow[] = [];
    for (const table of HOSTED_DB_PROOF_NEW_APP_PUBLIC_TABLES) {
      newAppPublicTables.push({ table, ok: await tableExistsInPublic(table) });
    }
    const authUsersTablePresent = await authUsersMetadataPresent();
    const prismaMigrations = await probePrismaMigrations();

    const legacyOk = legacyPublicTables.every((x) => x.ok);
    const newOk = newAppPublicTables.every((x) => x.ok);
    const directUrlOk = directUrlRefMatchesProduction !== false;

    const contractSatisfied =
      databaseUrlRefMatchesProduction &&
      legacyOk &&
      newOk &&
      authUsersTablePresent &&
      prismaMigrations.tablePresent &&
      prismaMigrations.countMatchesExpected &&
      directUrlOk;

    return {
      requiredProductionProjectRef,
      databaseUrlSupabaseProjectRef: dbUrlRef,
      directUrlSupabaseProjectRef: directRef,
      databaseUrlRefMatchesProduction,
      directUrlRefMatchesProduction,
      legacyPublicTables,
      newAppPublicTables,
      authUsersTablePresent,
      prismaMigrations,
      contractSatisfied,
    };
  } catch {
    return {
      requiredProductionProjectRef,
      databaseUrlSupabaseProjectRef: dbUrlRef,
      directUrlSupabaseProjectRef: directRef,
      databaseUrlRefMatchesProduction,
      directUrlRefMatchesProduction,
      legacyPublicTables: emptyLegacy,
      newAppPublicTables: emptyNew,
      authUsersTablePresent: false,
      prismaMigrations: prismaMigrationsIdle,
      contractSatisfied: false,
    };
  }
}

/**
 * Read-only connectivity: SELECT 1 and optional fixed-table count (no writes, no secrets in return).
 */
export async function runHostedDbReadOnlyProof(): Promise<HostedDbReadOnlyDatabaseResult> {
  const env = getHostedDbEnvPresence();
  if (!env.DATABASE_URL.present) {
    return {
      reachable: false,
      selectOneOk: false,
      safeCounts: [],
      provider: "unknown",
      sanitizedError: "database_url_not_configured",
    };
  }

  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1 AS result`);
    const selectOneOk = true;

    const safeCounts: Array<{ table: string; ok: boolean }> = [];
    try {
      await prisma.$queryRaw(Prisma.sql`SELECT COUNT(*)::bigint AS c FROM "User"`);
      safeCounts.push({ table: "User", ok: true });
    } catch {
      safeCounts.push({ table: "User", ok: false });
    }

    return {
      reachable: true,
      selectOneOk,
      safeCounts,
      provider: "postgresql",
      sanitizedError: null,
    };
  } catch (e) {
    const raw = e instanceof Error ? e.message : "unknown_error";
    return {
      reachable: false,
      selectOneOk: false,
      safeCounts: [],
      provider: "postgresql",
      sanitizedError: sanitizeDbError(raw),
    };
  }
}

export async function getHostedDbProofSummary(): Promise<HostedDbProofPayload> {
  const env = getHostedDbEnvPresence();
  const database = await runHostedDbReadOnlyProof();
  const warnings: string[] = [];

  const allowTableQueries = env.DATABASE_URL.present && database.reachable && database.selectOneOk;
  let productionSchemaContract: HostedDbProductionSchemaContract;

  try {
    productionSchemaContract = await probeProductionSchemaContract(env, allowTableQueries);
  } catch (e) {
    const raw = e instanceof Error ? e.message : "unknown_error";
    warnings.push(`schema_contract_probe_error: ${sanitizeDbError(raw)}`);
    productionSchemaContract = await probeProductionSchemaContract(env, false);
  }

  if (!database.reachable || !database.selectOneOk) {
    if (database.sanitizedError) {
      warnings.push(`database_connectivity_failed: ${database.sanitizedError}`);
    }
    if (env.DATABASE_URL.supabaseProjectRefConfirmed === true) {
      warnings.push(
        "production_schema_contract: table presence and _prisma_migrations probes were skipped because the database was not reachable.",
      );
    }
  }

  if (!env.DIRECT_URL.present) {
    warnings.push(
      "DIRECT_URL is not set; Prisma migrate/introspection may fail when DATABASE_URL uses a transaction pooler — see deployment.md.",
    );
  } else if (env.DIRECT_URL.present && env.DIRECT_URL.supabaseProjectRefConfirmed === false) {
    warnings.push(
      "DIRECT_URL is set but its Supabase project ref does not match canonical production — verify Netlify env is not pointing at a clone or staging project.",
    );
  }

  if (env.DATABASE_URL.present && env.DATABASE_URL.supabaseProjectRefConfirmed === false) {
    warnings.push(
      `DATABASE_URL must resolve to Supabase project ref ${HOSTED_DB_PROOF_REQUIRED_PRODUCTION_PROJECT_REF} (pooler user postgres.<ref> or host db.<ref>.supabase.co) for hosted proof to pass.`,
    );
  }

  if (
    database.reachable &&
    database.selectOneOk &&
    !productionSchemaContract.contractSatisfied
  ) {
    if (!productionSchemaContract.databaseUrlRefMatchesProduction) {
      warnings.push("production_schema_contract: DATABASE_URL project ref does not match required production ref.");
    } else {
      const missingLegacy = productionSchemaContract.legacyPublicTables.filter((x) => !x.ok).map((x) => x.table);
      const missingNew = productionSchemaContract.newAppPublicTables.filter((x) => !x.ok).map((x) => x.table);
      if (missingLegacy.length) {
        warnings.push(`production_schema_contract: missing legacy public tables: ${missingLegacy.join(", ")}`);
      }
      if (missingNew.length) {
        warnings.push(`production_schema_contract: missing new app tables: ${missingNew.join(", ")}`);
      }
      if (!productionSchemaContract.authUsersTablePresent) {
        warnings.push("production_schema_contract: auth.users metadata table not found (auth schema).");
      }
      if (!productionSchemaContract.prismaMigrations.tablePresent) {
        warnings.push("production_schema_contract: public._prisma_migrations not found.");
      } else if (!productionSchemaContract.prismaMigrations.countMatchesExpected) {
        warnings.push(
          `production_schema_contract: _prisma_migrations row count is ${productionSchemaContract.prismaMigrations.rowCount ?? "null"}, expected ${HOSTED_DB_PROOF_EXPECTED_PRISMA_MIGRATIONS_COUNT}.`,
        );
      }
      if (productionSchemaContract.directUrlRefMatchesProduction === false) {
        warnings.push("production_schema_contract: DIRECT_URL project ref mismatched — fix Netlify env.");
      }
    }
  }

  const ok =
    env.DATABASE_URL.present &&
    env.DATABASE_URL.supabaseProjectRefConfirmed === true &&
    database.reachable &&
    database.selectOneOk &&
    productionSchemaContract.contractSatisfied;

  const productionCanonical = productionSchemaContract.contractSatisfied;

  const nextRecommendedStep = ok
    ? "Hosted proof passed: record redacted JSON in develop_notes per docs/email-hosted-db-proof.md; complete migrate/introspection discipline if DIRECT_URL was absent."
    : "Fix DATABASE_URL/DIRECT_URL to canonical production ref, ensure additive schema + 71 migration rows on target DB, then re-run GET /api/admin/production-readiness/hosted-db.";

  return {
    ok,
    mode: "hosted_db_readonly_proof",
    env,
    database,
    productionSchemaContract,
    proof: {
      readOnly: true,
      mutatedData: false,
      migrationsRun: false,
      productionCanonical,
    },
    warnings,
    nextRecommendedStep,
  };
}
