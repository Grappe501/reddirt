import Link from "next/link";
import type { ReactNode } from "react";
import type { EmailCommandCenterOperatorGate } from "@/lib/email-command-center/read-model";
import { hostedDbTargetClassificationLabel } from "@/lib/email-command-center/hosted-db-readiness-assistant";
import { HostedDbCopySnippets } from "@/components/admin/email-command-center/HostedDbCopySnippets";

const ECC = "/admin/workbench/email-command-center";

function parseLabel(s: "unset" | "invalid" | "ok") {
  if (s === "ok") return "OK";
  if (s === "invalid") return "Invalid URL";
  return "Unset";
}

function yesNo(v: boolean) {
  return v ? "Yes" : "No";
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <tr className="border-b border-kelly-text/10 align-top">
      <th className="py-1.5 pr-2 text-left font-heading text-[10px] font-bold uppercase tracking-wide text-kelly-muted">{k}</th>
      <td className="py-1.5 font-body text-[11px] text-kelly-navy">{v}</td>
    </tr>
  );
}

function LocalVsHostedExplainer({ gate }: { gate: EmailCommandCenterOperatorGate }) {
  switch (gate.hostedDbTargetClassification) {
    case "local_loopback":
      return (
        <>
          This process is pointed at loopback Postgres — typical <strong>local Docker Compose</strong>, not hosted Supabase.
        </>
      );
    case "remote_supabase":
      return (
        <>
          <code className="text-[10px]">DATABASE_URL</code> hostname looks <strong>Supabase-hosted</strong> — confirm the
          Supabase <strong>project</strong> matches Kelly-Grappe-App (dashboard → Settings → General → Reference ID).
        </>
      );
    case "remote_other_postgres":
      return (
        <>
          <code className="text-[10px]">DATABASE_URL</code> is a <strong>remote non-loopback</strong> host — verify provider and
          database outside this UI.
        </>
      );
    case "no_database_url":
      return (
        <>
          <code className="text-[10px]">DATABASE_URL</code> is <strong>unset</strong> — set env before hosted verification.
        </>
      );
    case "invalid_database_url":
      return (
        <>
          <code className="text-[10px]">DATABASE_URL</code> is <strong>present but not parseable</strong> — fix the connection
          string shape (see Supabase Connect URI format).
        </>
      );
    default:
      return null;
  }
}

export function HostedDbReadinessAssistantView({
  gate,
  variant,
}: {
  gate: EmailCommandCenterOperatorGate;
  variant: "embedded" | "page";
}) {
  const mig = gate.emailCommandCenterMigrations;
  const migApplied = mig.filter((r) => r.applied).length;
  const migTotal = mig.length;
  const migSummary =
    gate.allEmailCommandCenterMigrationsApplied === null
      ? "Unknown (DB unreachable or query failed)"
      : gate.allEmailCommandCenterMigrationsApplied
        ? `All tracked workspace updates applied (${migApplied}/${migTotal})`
        : `Incomplete — ${migApplied}/${migTotal} applied`;

  return (
    <div className="min-w-0 max-w-5xl space-y-4">
      {variant === "page" ? (
        <div className="flex flex-wrap items-center gap-2">
          <Link href={ECC} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
            ← Communication Command Center
          </Link>
          <Link href={`${ECC}/readiness`} className="text-xs font-bold text-kelly-forest hover:underline">
            Readiness checklist
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`${ECC}/readiness/hosted-db`} className="text-xs font-bold text-violet-800 underline">
            Open full-page hosted DB assistant
          </Link>
          <span className="text-[10px] text-kelly-subtle">· bookmark-friendly</span>
        </div>
      )}

      <header className="space-y-2">
        {variant === "page" ? (
          <h1 className="font-heading text-xl font-bold text-kelly-navy">Live database connection helper</h1>
        ) : (
          <h2 className="font-heading text-xl font-bold text-kelly-navy">Live database connection helper</h2>
        )}
        <p className="max-w-3xl font-body text-sm text-kelly-text/85">
          Safe staff view: <strong>names and posture only</strong> (no connection string values, no passwords). This page does not
          edit settings, apply database updates, or import data. Use the copy buttons for CLI snippets, then run checks from a
          shell where <strong>you</strong> set <code className="text-[10px]">DATABASE_URL</code> /{" "}
          <code className="text-[10px]">DIRECT_URL</code> for the Kelly-Grappe-App hosted Supabase target.
        </p>
      </header>

      <section
        id={variant === "embedded" ? "hosted-db-readiness-assistant" : undefined}
        className={`rounded-lg border border-violet-200/70 bg-white/95 p-3 shadow-sm ${variant === "embedded" ? "scroll-mt-24" : ""}`}
      >
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-violet-900/90">Live snapshot (this server process)</h2>
        <table className="mt-2 w-full border-collapse font-body">
          <tbody>
            <Row k="Current target classification" v={hostedDbTargetClassificationLabel(gate.hostedDbTargetClassification)} />
            <Row k="Local Docker vs hosted Supabase" v={<LocalVsHostedExplainer gate={gate} />} />
            <Row k="DATABASE_URL present" v={yesNo(gate.databaseUrlPresent)} />
            <Row k="DIRECT_URL present" v={yesNo(gate.directUrlPresent)} />
            <Row k="DATABASE_URL parse" v={parseLabel(gate.databaseUrlParseStatus)} />
            <Row k="DIRECT_URL parse" v={parseLabel(gate.directUrlParseStatus)} />
            <Row
              k="DATABASE_URL host (no secrets)"
              v={
                gate.databaseUrlParseStatus === "ok" && gate.databaseUrlHostname ? (
                  <code className="text-[10px]">{gate.databaseUrlHostname}</code>
                ) : (
                  "—"
                )
              }
            />
            {gate.supabaseProjectRefMasked ? (
              <Row
                k="Supabase project ref (masked)"
                v={
                  <span>
                    <code className="text-[10px]">{gate.supabaseProjectRefMasked}</code>{" "}
                    <span className="text-[10px] text-kelly-text/75">
                      (from <code className="text-[9px]">db.&lt;ref&gt;.supabase.co</code> only — pooler URIs may not expose ref
                      here; check dashboard Reference ID.)
                    </span>
                  </span>
                }
              />
            ) : null}
            <Row k="DB reachable (cockpit query)" v={gate.cockpitDbReachable ? "Yes" : "No"} />
            <Row k="Database update status" v={migSummary} />
            <Row
              k="Contact import gate"
              v={
                <span>
                  <span className="font-semibold">{gate.localContactImportDbVerified ? "Verified" : "Not verified"}</span>
                  {" — "}
                  {gate.contactImportStatusLabel}
                </span>
              }
            />
            <Row
              k="Route to act"
              v={
                <span className="flex flex-wrap gap-x-2 gap-y-1">
                  <Link href={`${ECC}/imports`} className="font-bold text-kelly-forest underline">
                    Imports
                  </Link>
                  <span className="text-kelly-text/40">·</span>
                  <Link href={`${ECC}/sendgrid`} className="font-bold text-kelly-forest underline">
                    SendGrid
                  </Link>
                  <span className="text-kelly-text/40">·</span>
                  <a href="https://supabase.com/dashboard" className="font-bold text-violet-800 underline" target="_blank" rel="noreferrer">
                    Supabase dashboard
                  </a>
                </span>
              }
            />
          </tbody>
        </table>
        {gate.migrationGateNote ? (
          <p className="mt-2 rounded border border-amber-200/60 bg-amber-50/80 px-2 py-1 font-body text-[10px] text-amber-950">
            {gate.migrationGateNote}
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border border-kelly-text/12 bg-kelly-page/35 p-3">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-navy">Staff checklist (no secret values)</h2>
        <ul className="mt-2 list-inside list-disc space-y-1.5 font-body text-[11px] text-kelly-navy/95">
          <li>
            In Supabase: <strong>Project Settings → Database</strong> → Connection string. Copy <strong>URI</strong> into your
            private env file or session — match the project <strong>Reference ID</strong> to Kelly-Grappe-App (wrong ref → wrong
            database).
          </li>
          <li>
            <code className="text-[10px]">NEXT_PUBLIC_SUPABASE_URL</code> is for site auth and browser clients — it does <strong>not</strong>{" "}
            replace <code className="text-[10px]">DATABASE_URL</code> for the app database driver. See <code className="text-[10px]">docs/deployment.md</code>.
          </li>
          <li>
            Session pooler vs direct: follow <code className="text-[10px]">docs/deployment.md</code> —{" "}
            <code className="text-[10px]">DIRECT_URL</code> must work for your team&apos;s documented deploy steps.
          </li>
          <li>Never paste full URIs into tickets, chat, or screenshots — rotate credentials if exposed.</li>
        </ul>
      </section>

      <HostedDbCopySnippets />

      <section className="rounded-lg border border-kelly-text/12 bg-white/95 p-3">
        <h2 className="font-heading text-xs font-bold uppercase tracking-wide text-kelly-muted">Gate chain (operator shell)</h2>
        <ol className="mt-2 list-inside list-decimal space-y-1 font-body text-[11px] text-kelly-navy/95">
          <li>
            <code className="text-[10px]">{gate.dbDiagnoseCliHint}</code> — safe classification + hints
          </li>
          <li>
            <code className="text-[10px]">{gate.preflightCliHint}</code> — broader preflight
          </li>
          <li>
            <code className="text-[10px]">{gate.importGateCliHint}</code> — includes deploy + preflight +{" "}
            <code className="text-[10px]">npm run check</code> — run only when <code className="text-[10px]">DATABASE_URL</code> points at
            the intended hosted database
          </li>
          <li>
            <code className="text-[10px]">npm run email:no-send-scan</code> — no-send sanity (heuristic)
          </li>
        </ol>
        <p className="mt-2 font-body text-[10px] text-kelly-text/75">
          Repo doc: <code className="text-[9px]">{gate.readinessDocRepoPath}</code> · Companion:{" "}
          <code className="text-[9px]">docs/email-hosted-db-readiness-assistant-1-0.md</code>
        </p>
      </section>
    </div>
  );
}
