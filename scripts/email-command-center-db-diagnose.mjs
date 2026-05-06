#!/usr/bin/env node
/**
 * EMAIL-DB-RECONCILE-CONTACT-IMPORT-GATE-1.0 + SUPABASE-CANONICAL-DB-AND-ENV-GATE-1.0 — safe DB diagnostics for Email Command Center.
 * Never prints passwords, full URLs, tokens, or API keys.
 * Reports Supabase **SSR/Auth** public env (`NEXT_PUBLIC_*`) separately from Prisma **`DATABASE_URL` / `DIRECT_URL`** (names + presence only for the former).
 *
 * Usage (from RedDirt/):
 *   node scripts/email-command-center-db-diagnose.mjs
 */

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { lookup } from "node:dns/promises";
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import {
  EMAIL_COMMAND_CENTER_MIGRATION_DIRS,
  queryEmailCommandCenterMigrationsApplied,
} from "./lib/email-command-center-migrations.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REDDIRT_ROOT = join(__dirname, "..");
process.chdir(REDDIRT_ROOT);

function envPresent(key) {
  const v = process.env[key];
  return Boolean(typeof v === "string" && v.trim().length > 0);
}

function maskUrlPresence(key) {
  const u = process.env[key];
  if (!u || typeof u !== "string") return "absent";
  const t = u.trim();
  if (!t) return "absent";
  return `present (length ${t.length})`;
}

/** Redact accidental URL-like strings from provider output. */
function redactProviderText(s) {
  if (!s || typeof s !== "string") return "";
  return s
    .replace(/postgresql:\/\/[^\s"'<>]+/gi, "[redacted]")
    .replace(/postgres:\/\/[^\s"'<>]+/gi, "[redacted]")
    .replace(/mysql:\/\/[^\s"'<>]+/gi, "[redacted]")
    .replace(/postgres\.[a-z0-9._-]{8,}/gi, "postgres.[redacted-ref]")
    .replace(/tenant\/user\s+postgres[^\s]*/gi, "tenant/user [redacted]")
    .slice(0, 6000);
}

function describeUsernameShape(user) {
  if (!user) return "missing";
  const u = decodeURIComponent(user);
  if (/^postgres\.[a-z0-9]{20,}$/i.test(u)) return "postgres.<project-ref-style>";
  if (u.includes(".")) return "dotted_username";
  return `simple_username (length ${u.length})`;
}

function classifyPooler(host, port, searchParams) {
  const h = (host || "").toLowerCase();
  const p = String(port || "");
  const pgbouncer = searchParams.get("pgbouncer") === "true";
  if (pgbouncer || p === "6543") return "likely_transaction_pooler_or_pgbouncer_transaction";
  if (h.includes("pooler.supabase.com") || h.includes("pooler")) {
    if (p === "5432" || p === "") return "likely_session_pooler_or_supabase_pooler_5432";
    return "pooler_hostname_nonstandard_port";
  }
  if (h.includes("neon.tech") && h.includes("pooler")) return "likely_neon_pooler";
  if (p === "5432" || p === "5433") return "likely_direct_or_custom_mapped_port";
  return "unknown_or_direct_style";
}

/** Loopback / dev compose — not Canonical Supabase DB hosted proof. */
function appearsLocalDocker(parsed) {
  if (!parsed.ok) return false;
  const h = (parsed.host || "").toLowerCase();
  if (h === "127.0.0.1" || h === "localhost" || h === "::1") return true;
  return false;
}

/** Hosted Supabase project (pooler or db.*) — operator must confirm correct project. */
function appearsSupabaseHosted(parsed) {
  if (!parsed.ok) return false;
  const h = (parsed.host || "").toLowerCase();
  return h.includes("supabase.co") || h.includes("supabase.com");
}

function categorizeAuthFailure(redactedMsg) {
  const m = (redactedMsg || "").toLowerCase();
  if (m.includes("tenant") && m.includes("user")) return "possible_wrong_pooler_username_or_project_ref (Supabase pooler often needs postgres.<projectRef>)";
  if (m.includes("p1000") || m.includes("password authentication failed") || m.includes("authentication failed"))
    return "possible_wrong_password_or_user";
  if (m.includes("does not exist") && m.includes("database")) return "possible_wrong_database_name";
  if (m.includes("pgbouncer") || m.includes("prepared") || m.includes("prepared statement"))
    return "possible_transaction_pooler_without_directurl_for_migrations";
  if (m.includes("econnrefused") || m.includes("timeout") || m.includes("enotfound")) return "possible_network_dns_or_firewall";
  return "see_redacted_message_above";
}

function hasSslModeQuery(searchParams) {
  return Boolean(searchParams.get("sslmode"));
}

function parseDatabaseUrl(label) {
  const raw = process.env[label];
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return { ok: false, error: "missing" };
  }
  const t = raw.trim();
  try {
    const u = new URL(t);
    const protocol = u.protocol.replace(/:$/, "") || "(none)";
    const host = u.hostname || "";
    const port = u.port || (protocol === "postgresql" || protocol === "postgres" ? "5432" : "");
    const database = (u.pathname || "").replace(/^\//, "") || "(none)";
    const user = u.username ? decodeURIComponent(u.username) : "";
    const poolerKind = classifyPooler(host, port, u.searchParams);
    return {
      ok: true,
      protocol,
      host,
      port: port || "(default)",
      database,
      userShape: describeUsernameShape(user),
      sslModeQueryPresent: hasSslModeQuery(u.searchParams),
      poolerKind,
    };
  } catch {
    return { ok: false, error: "parse_failed" };
  }
}

async function main() {
  console.log("Email Command Center — DB diagnose (no secrets)\n");
  console.log(`Working directory: ${REDDIRT_ROOT}\n`);

  const supabasePublicUrl = envPresent("NEXT_PUBLIC_SUPABASE_URL");
  const supabasePublishableKey = envPresent("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const supabaseSsrReady = supabasePublicUrl && supabasePublishableKey;

  console.log("--- Env groups (names only; no values) ---");
  console.log("  [A] Supabase SSR / Auth (NOT Prisma — used by @supabase/ssr + middleware session refresh)");
  console.log(`      NEXT_PUBLIC_SUPABASE_URL: ${supabasePublicUrl ? "present" : "absent"}`);
  console.log(`      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${supabasePublishableKey ? "present" : "absent"}`);
  console.log(`      SSR Auth client usable (both [A] vars): ${supabaseSsrReady ? "yes" : "no"}`);
  console.log("  [B] Prisma Postgres (runtime + migrations)");
  const dbUrl = envPresent("DATABASE_URL");
  const directUrl = envPresent("DIRECT_URL");
  console.log(`      DATABASE_URL: ${dbUrl ? maskUrlPresence("DATABASE_URL") : "absent"}`);
  console.log(`      DIRECT_URL: ${directUrl ? maskUrlPresence("DIRECT_URL") : "absent"}`);
  console.log(
    "  prisma/schema.prisma: `url = env(\"DATABASE_URL\")` + `directUrl = env(\"DIRECT_URL\")` — local Docker: set DIRECT_URL same as DATABASE_URL; hosted Canonical Supabase DB: session/runtime in DATABASE_URL, direct or session in DIRECT_URL per Connect UI."
  );
  console.log("  Note: [A] and [B] are independent — setting Supabase public keys does not migrate or verify the Prisma database.");

  const parsed = parseDatabaseUrl("DATABASE_URL");
  const parsedDirect = parseDatabaseUrl("DIRECT_URL");

  console.log("\n--- Target classification (heuristic, no hostname secrets) ---");
  if (parsed.ok) {
    console.log(`  DATABASE_URL appears local Docker / loopback: ${appearsLocalDocker(parsed) ? "yes" : "no"}`);
    console.log(`  DATABASE_URL appears hosted Supabase (hostname pattern): ${appearsSupabaseHosted(parsed) ? "yes" : "no"}`);
    console.log(`  DATABASE_URL pooler hint: ${parsed.poolerKind}`);
  } else {
    console.log("  (skipped — DATABASE_URL parse failed)");
  }
  if (parsedDirect.ok) {
    console.log(`  DIRECT_URL appears local Docker / loopback: ${appearsLocalDocker(parsedDirect) ? "yes" : "no"}`);
    console.log(`  DIRECT_URL appears hosted Supabase (hostname pattern): ${appearsSupabaseHosted(parsedDirect) ? "yes" : "no"}`);
    console.log(`  DIRECT_URL pooler hint: ${parsedDirect.poolerKind}`);
    if (dbUrl && directUrl && process.env.DATABASE_URL?.trim() === process.env.DIRECT_URL?.trim()) {
      console.log("  Note: DATABASE_URL and DIRECT_URL are identical strings (typical for local single-URI Postgres).");
    }
  } else if (directUrl) {
    console.log("  DIRECT_URL: present but URL parse failed — check quoting and encoding.");
  } else {
    console.log("  DIRECT_URL: absent — `npx prisma generate` / migrate will fail until set (copy DATABASE_URL for local).");
  }

  console.log("\n--- DATABASE_URL parse ---");
  if (!parsed.ok) {
    console.log(`  URL parse: failed (${parsed.error})`);
  } else {
    console.log("  URL parse: ok");
    console.log(`  Protocol: ${parsed.protocol}`);
    console.log(`  Host: ${parsed.host || "(empty)"}`);
    console.log(`  Port: ${parsed.port}`);
    console.log(`  Database name: ${parsed.database}`);
    console.log(`  Username shape: ${parsed.userShape}`);
    console.log(`  sslmode (query): ${parsed.sslModeQueryPresent ? "present" : "absent"}`);
    console.log(`  Pooler hint: ${parsed.poolerKind}`);
  }

  console.log("\n--- DIRECT_URL parse ---");
  if (!directUrl) {
    console.log("  skipped (DIRECT_URL not set)");
  } else if (!parsedDirect.ok) {
    console.log(`  URL parse: failed (${parsedDirect.error})`);
  } else {
    console.log("  URL parse: ok");
    console.log(`  Host: ${parsedDirect.host || "(empty)"}`);
    console.log(`  Port: ${parsedDirect.port}`);
    console.log(`  Database name: ${parsedDirect.database}`);
    console.log(`  Username shape: ${parsedDirect.userShape}`);
    console.log(`  Pooler hint: ${parsedDirect.poolerKind}`);
  }

  let dnsOk = null;
  let dnsDetail = "skipped";
  if (parsed.ok && parsed.host) {
    try {
      await lookup(parsed.host);
      dnsOk = true;
      dnsDetail = "lookup_ok";
    } catch (e) {
      dnsOk = false;
      dnsDetail = e instanceof Error ? e.code || e.message.slice(0, 120) : "lookup_failed";
    }
  } else {
    dnsOk = false;
    dnsDetail = "no_host_to_resolve";
  }

  console.log("\n--- DNS ---");
  console.log(`  Host DNS: ${dnsOk === true ? "success" : dnsOk === false ? "failure" : "unknown"} (${dnsDetail})`);

  let dbConnect = false;
  let prismaQuery = false;
  let prismaErr = "";
  let migrateStatusOk = false;
  let migrateStatusSummary = "skipped (DATABASE_URL missing or unreachable)";
  let eccMigrations = [];

  if (!dbUrl || !parsed.ok) {
    console.log("\n--- PostgreSQL / Prisma ---");
    console.log("  DB connection: skipped");
    console.log("  Prisma query: skipped");
  } else {
    const prisma = new PrismaClient();
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbConnect = true;
      prismaQuery = true;
    } catch (e) {
      prismaErr =
        e instanceof Error
          ? redactProviderText(e.message).slice(0, 280)
          : "connection_error";
    } finally {
      await prisma.$disconnect().catch(() => {});
    }

    console.log("\n--- PostgreSQL / Prisma ---");
    console.log(`  DB connection (TCP + auth): ${dbConnect ? "success" : "failure"}`);
    if (!dbConnect && prismaErr) {
      console.log(`  Error (redacted excerpt): ${prismaErr}`);
    }
    console.log(`  Prisma query (SELECT 1): ${prismaQuery ? "success" : "failure"}`);

    if (dbConnect) {
      const prisma2 = new PrismaClient();
      try {
        eccMigrations = await queryEmailCommandCenterMigrationsApplied(prisma2);
      } catch (e) {
        eccMigrations = [];
        console.log(
          `  Email Command Center migration query: failed (${e instanceof Error ? redactProviderText(e.message).slice(0, 160) : "error"})`
        );
      } finally {
        await prisma2.$disconnect().catch(() => {});
      }

      let rawOut = "";
      let rawErr = "";
      try {
        rawOut = execSync("npx prisma migrate status", {
          cwd: REDDIRT_ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
        migrateStatusOk = true;
        migrateStatusSummary = "completed (see stdout below)";
      } catch (e) {
        migrateStatusOk = false;
        rawOut = typeof e.stdout === "string" ? e.stdout : e.stdout?.toString?.() ?? "";
        rawErr = typeof e.stderr === "string" ? e.stderr : e.stderr?.toString?.() ?? "";
        migrateStatusSummary = "failed or pending migrations (non-zero exit)";
      }
      console.log("\n--- prisma migrate status ---");
      console.log(`  Exit interpretation: ${migrateStatusOk ? "clean" : "needs attention"}`);
      const combined = redactProviderText(`${rawOut}\n${rawErr}`).trim();
      if (combined) {
        console.log("  Output (redacted):\n");
        console.log(combined.split("\n").slice(0, 40).join("\n"));
        if (combined.split("\n").length > 40) console.log("  … (truncated)");
      } else {
        console.log("  (no stdout/stderr captured)");
      }
    } else {
      console.log("\n--- prisma migrate status ---");
      console.log("  skipped (DB not reachable)");
    }
  }

  console.log("\n--- Email Command Center migrations (_prisma_migrations) ---");
  if (!dbConnect) {
    for (const name of EMAIL_COMMAND_CENTER_MIGRATION_DIRS) {
      console.log(`  ${name}: not verified (DB unreachable — not a schema failure)`);
    }
  } else if (eccMigrations.length) {
    for (const row of eccMigrations) {
      console.log(`  ${row.name}: ${row.applied ? "applied" : "not applied / incomplete"}`);
    }
  } else {
    for (const name of EMAIL_COMMAND_CENTER_MIGRATION_DIRS) {
      console.log(`  ${name}: not verified (query failed or empty)`);
    }
  }

  const allEccApplied =
    dbConnect && eccMigrations.length === EMAIL_COMMAND_CENTER_MIGRATION_DIRS.length && eccMigrations.every((r) => r.applied);

  const gatePrereqsOnThisDb = dbConnect && migrateStatusOk && allEccApplied;
  let dbTargetHint = "n/a";
  if (parsed.ok) {
    if (appearsLocalDocker(parsed)) dbTargetHint = "local Docker / loopback";
    else if (appearsSupabaseHosted(parsed)) dbTargetHint = "hosted Supabase (hostname pattern)";
    else dbTargetHint = "other / unknown host pattern";
  }

  console.log("\n--- Contact import gate (`npm run email:contact-import:gate`) ---");
  console.log("  Status: **not executed** inside diagnose (that script runs `migrate deploy` + preflight + `npm run check`).");
  console.log(
    `  Preconditions on current DATABASE_URL only (DB up + migrate status clean + ECC checklist): ${!dbConnect ? "not evaluated (DB unreachable)" : gatePrereqsOnThisDb ? "satisfied — still run full gate separately" : "not satisfied — fix migrations / ECC above first"}`
  );
  console.log("  Operator: from RedDirt/: npm run email:contact-import:gate");
  console.log("  Do not treat local success as canonical Supabase verification — point DATABASE_URL at the hosted project and re-run.");

  console.log("\n--- Summary ---");
  console.log("  Architecture: Supabase SSR/Auth (`NEXT_PUBLIC_SUPABASE_*`) and Prisma (`DATABASE_URL` / `DIRECT_URL`) are **separate** env groups — never substitute publishable key for a DB URL.");
  console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabasePublicUrl ? "yes" : "no"}`);
  console.log(`  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${supabasePublishableKey ? "yes" : "no"}`);
  console.log(`  Supabase SSR env complete (both public vars): ${supabaseSsrReady ? "yes" : "no"}`);
  console.log(`  DATABASE_URL present: ${dbUrl ? "yes" : "no"}`);
  console.log(`  DIRECT_URL present: ${directUrl ? "yes" : "no"}`);
  console.log(`  Prisma DB env pair complete (both [B] vars): ${dbUrl && directUrl ? "yes" : "no"}`);
  console.log(`  DATABASE_URL target (heuristic): ${dbTargetHint}`);
  if (parsed.ok && appearsSupabaseHosted(parsed) && !supabaseSsrReady) {
    console.log(
      "  Note: DATABASE_URL hostname looks like hosted Supabase Postgres, but Supabase SSR public vars are incomplete — Prisma still works; middleware `@supabase/ssr` refresh stays inactive until both NEXT_PUBLIC_* are set."
    );
  }
  if (supabaseSsrReady && parsed.ok && appearsLocalDocker(parsed)) {
    console.log(
      "  Note: Supabase SSR public vars are set while DATABASE_URL looks like local Docker — common in dev; confirm production intent so Auth project and Prisma Postgres stay aligned with Steve."
    );
  }
  console.log(`  URL parse: ${parsed.ok ? "ok" : "failed"}`);
  console.log(`  Host DNS: ${dnsOk === true ? "ok" : dnsOk === false ? "failed" : "n/a"}`);
  console.log(`  DB connection: ${dbConnect ? "ok" : "fail"}`);
  console.log(`  Prisma query: ${prismaQuery ? "ok" : "fail"}`);
  console.log(`  prisma migrate status: ${dbConnect ? (migrateStatusOk ? "clean" : "needs attention") : "not run"}`);
  console.log(`  ECC migrations all applied: ${!dbConnect ? "not verified" : allEccApplied ? "yes" : "no or partial"}`);
  console.log(
    `  contact-import gate (full command): not run here — prerequisites on this DB: ${!dbConnect ? "n/a" : gatePrereqsOnThisDb ? "look ready" : "not ready"}`
  );

  if (!dbUrl) {
    console.log("\nLikely issue: DATABASE_URL not set in this shell (local .env not loaded, or CI missing var).");
    console.log("Human fix: export DATABASE_URL for this terminal, or run from Netlify/provider dashboard env.");
  } else if (!parsed.ok) {
    console.log("\nLikely issue: DATABASE_URL is not a valid URL (typo, stray quotes, or malformed string).");
    console.log("Human fix: repair the connection string shape; URL-encode special characters in the password.");
  } else if (dnsOk === false) {
    console.log("\nLikely issue: hostname does not resolve (wrong host, offline DNS, or typo in tenant/project ref).");
    console.log(
      "Human fix: copy the host from your provider dashboard (Supabase/Neon/etc.); do not hand-type project refs."
    );
  } else if (!dbConnect) {
    console.log("\nLikely issue: DNS ok but TCP/auth failed — wrong port, wrong password, firewall, or pooler mode mismatch.");
    const hint = prismaErr ? categorizeAuthFailure(prismaErr) : "n/a";
    console.log(`  Failure category hint: ${hint}`);
    console.log(
      "Human fix: local Docker often maps 5433→5432 — align DATABASE_URL port with `docker compose ps`. For hosted Supabase (Canonical / Live RedDirt DB): open **Project Settings → Database → Connection string** on the **intended** Supabase project only; use **Session pooler** for `DATABASE_URL` when Prisma docs recommend; if `migrate deploy` fails on pooler, set `DIRECT_URL` to **Direct connection** or **Session** string as documented. **URL-encode** special characters in passwords. Session pooler username must be `postgres.<projectRef>`, not bare `postgres`."
    );
  } else if (!allEccApplied || !migrateStatusOk) {
    console.log("\nLikely issue: migrations not fully applied to this database.");
    console.log("Human fix: from RedDirt/, run `npx prisma migrate deploy` against this DATABASE_URL.");
  } else {
    console.log("\nDB path looks healthy for this environment — still run `npm run email:command-center:preflight` for Gmail env + column checks.");
  }

  console.log("\n--- Canonical Supabase DB gate (operator checklist) ---");
  console.log("  **Canonical Supabase DB** / **Live RedDirt Supabase DB** is the intended hosted Postgres for real contact imports (confirm project name with Steve).");
  console.log("  Local Docker passing diagnose/preflight does **not** verify the hosted canonical database.");
  console.log("  Steps: (1) Supabase Dashboard → the **correct** Supabase project (verify `DATABASE_URL` / `DIRECT_URL` host + ref) → Settings → Database → copy **Connection string** / pooler + direct as needed.");
  console.log("  (2) Set `DATABASE_URL` + `DIRECT_URL` privately in Netlify / local shell (never commit).");
  console.log("  (3) From RedDirt/: `npm run email:db:diagnose` then `npx prisma migrate status` then `npx prisma migrate deploy` then `npm run email:command-center:preflight` then `npm run email:contact-import:gate`.");
  console.log("  (4) Only when all succeed against **that** URL is real import staging considered safe.");

  process.exit(0);
}

main().catch((e) => {
  console.error("diagnose fatal:", e instanceof Error ? e.message.slice(0, 200) : e);
  process.exit(1);
});
