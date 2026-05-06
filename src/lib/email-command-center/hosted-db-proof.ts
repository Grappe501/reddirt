import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type HostedDbEnvPresence = {
  DATABASE_URL: { present: boolean };
  DIRECT_URL: { present: boolean };
};

export type HostedDbReadOnlyDatabaseResult = {
  reachable: boolean;
  selectOneOk: boolean;
  safeCounts: Array<{ table: string; ok: boolean }>;
  provider: "postgresql" | "unknown";
  sanitizedError: string | null;
};

export type HostedDbProofPayload = {
  ok: boolean;
  mode: "hosted_db_readonly_proof";
  env: HostedDbEnvPresence;
  database: HostedDbReadOnlyDatabaseResult;
  proof: {
    readOnly: true;
    mutatedData: false;
    migrationsRun: false;
    /** True only after live deployed route success is documented by an operator in the same steered packet — always false from automated code paths. */
    productionCanonical: false;
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

export function getHostedDbEnvPresence(): HostedDbEnvPresence {
  return {
    DATABASE_URL: { present: Boolean(process.env.DATABASE_URL?.trim()) },
    DIRECT_URL: { present: Boolean(process.env.DIRECT_URL?.trim()) },
  };
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

  if (!env.DIRECT_URL.present) {
    warnings.push(
      "DIRECT_URL is not set; Prisma migrate/introspection may fail when DATABASE_URL uses a transaction pooler — see deployment.md.",
    );
  }

  const ok = env.DATABASE_URL.present && database.reachable && database.selectOneOk;

  const nextRecommendedStep = ok
    ? "After Netlify deploy, run the PowerShell probe in docs/email-hosted-db-proof.md and paste redacted JSON into develop_notes."
    : "Fix DATABASE_URL connectivity or pooler/DIRECT_URL configuration before claiming hosted proof.";

  return {
    ok,
    mode: "hosted_db_readonly_proof",
    env,
    database,
    proof: {
      readOnly: true,
      mutatedData: false,
      migrationsRun: false,
      productionCanonical: false,
    },
    warnings,
    nextRecommendedStep,
  };
}
