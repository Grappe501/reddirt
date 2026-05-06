"use client";

import Link from "next/link";
import { DAILY_OPERATOR_CONSOLE_PATH, ECC_BASE } from "@/components/admin/email-command-center/daily-operator-console-paths";
import type { EmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

export type EccOperatorSurfaceId =
  | "daily"
  | "message_studio"
  | "send_execution"
  | "analytics"
  | "automation"
  | "sendgrid"
  | "audiences"
  | "imports"
  | "email_queue";

export type EccStatusChipVariant =
  | "live"
  | "local_only"
  | "hosted_not_verified"
  | "no_send"
  | "requires_approval"
  | "future";

const CHIP: Record<
  EccStatusChipVariant,
  { label: string; className: string }
> = {
  live: {
    label: "Live",
    className: "border-emerald-400/55 bg-emerald-50/95 text-emerald-950",
  },
  local_only: {
    label: "Local-only",
    className: "border-sky-400/50 bg-sky-50/90 text-sky-950",
  },
  hosted_not_verified: {
    label: "Hosted not verified",
    className: "border-amber-400/55 bg-amber-50/90 text-amber-950",
  },
  no_send: {
    label: "No-send",
    className: "border-rose-400/45 bg-rose-50/90 text-rose-950",
  },
  requires_approval: {
    label: "Requires approval",
    className: "border-violet-400/45 bg-violet-50/90 text-violet-950",
  },
  future: {
    label: "Future",
    className: "border-kelly-text/25 bg-kelly-muted/25 text-kelly-slate",
  },
};

export function EccStatusChip({ variant, label }: { variant: EccStatusChipVariant; label?: string }) {
  const c = CHIP[variant];
  return (
    <span
      className={`inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${c.className}`}
    >
      {label ?? c.label}
    </span>
  );
}

export function buildEccDefaultStatusChips(snapshot: EmailCommandCenterSnapshot): EccStatusChipVariant[] {
  const og = snapshot.operatorGate;
  const g = snapshot.governance;
  const out: EccStatusChipVariant[] = [];

  if (!g.canSendFromEmailWorkflowItem) {
    out.push("no_send");
  }
  if (og.cockpitDbReachable && og.allEmailCommandCenterMigrationsApplied === true) {
    out.push("live");
  }
  if (og.databaseUrlHostKind === "loopback") {
    out.push("local_only");
  }
  if (og.databaseUrlHostKind === "loopback" || og.databaseUrlHostKind === "unset" || !og.localContactImportDbVerified) {
    out.push("hosted_not_verified");
  }
  return out;
}

export function eccNextActionsForSurface(surface: EccOperatorSurfaceId, snapshot: EmailCommandCenterSnapshot): string[] {
  const og = snapshot.operatorGate;
  const q = snapshot.queueHealth;
  const ms = snapshot.messageStudioSharedDrafts;
  const au = snapshot.audienceStudio;
  const sg = snapshot.sendgridEnv;
  const sgF = snapshot.sendGridFoundation;
  const se = snapshot.sendExecution;
  const ci = snapshot.contactImport;

  switch (surface) {
    case "daily":
      return [
        "Scan priorities below, then open the highest-severity work queue card first.",
        "When counts are quiet, use Gmail review or Message Studio — still no send from any ECC route.",
        `Database: ${og.cockpitDbReachable ? "reachable" : "unreachable"} · migrations ${og.allEmailCommandCenterMigrationsApplied === true ? "applied" : "check Readiness"}.`,
      ];
    case "message_studio":
      return [
        "Pick or create a local draft, then align Campaign Voice + Editorial Review before Send Packet Builder.",
        "Promote to a shared draft when another operator must review — still no send.",
        "Hand off to Send Execution Governance only after APPROVED_FOR_SEND_GOVERNANCE + packet JSON exist.",
      ];
    case "send_execution":
      return [
        "Read doctrine cards first; use #ops only when a second operator is present for test or final send.",
        "Preflight before every test; broadcast needs SYNCED contact sync + ASM + typed SEND APPROVED.",
        "Return to Daily when finished to confirm queue and policy cards did not regress.",
      ];
    case "analytics":
      return [
        "Use this page as a read-only health snapshot — it does not authorize sends.",
        "Start from #analytics-readiness-scores and drilldown anchors for queue, drafts, send execution, sync, suppression, policies, Gmail watch.",
        "If reconciliation pending is high, use #reconciliation batch tools (DB-only; no provider send from Analytics).",
        "Cross-check suppressions before any future broadcast on SendGrid Foundation.",
      ];
    case "automation":
      return [
        "Review tiers and triggers as a map only — automation activation is not shipped.",
        "Use **Revalidate snapshot (read-only)** for fresh policy rows; open **Policy detail** (`#automation-policy-details`) for watches / never-does / data sources — no workers or sends.",
        "When policies alert, fix upstream data (queue, imports, drafts) on the linked routes; Daily shows top 3 warn/alert deep-links here.",
      ];
    case "sendgrid":
      return [
        "Confirm webhook + verification key in SendGrid dashboard; events land in SendGridEvent (no send here).",
        "Record preview runs for ACTIVE audiences before approving Marketing Contacts upsert.",
        "Production Marketing upsert stays blocked until hosted import gate passes — see execute panel.",
      ];
    case "audiences":
      return [
        "Build previews from ACTIVE facts; pending AI suggestions are not broadcast-eligible alone.",
        "Save draft definitions, then open Message Studio with ?audienceDefinitionId=… when drafting.",
        "SendGrid sync columns are posture only — list sync execution stays governed on SendGrid Foundation.",
      ];
    case "imports":
      return [
        "Run npm run email:contact-import:gate on the target DATABASE_URL before production-size commits.",
        "Validate → approve → commit; commits write profiles + CONTACT_IMPORT facts only — no SendGrid.",
        "After commit, govern audiences and copy in Audience Studio + Message Studio.",
      ];
    case "email_queue":
      return [
        q.needsAttentionCount > 0
          ? `Triage ${q.needsAttentionCount} needs-attention item(s) first — metadata-only Gmail bridge stays manual.`
          : "Queue looks calm — use filters or create a manual item for field follow-ups.",
        "Open item detail for AI Email Intelligence (advisory) — no auto-send from AI output.",
        "Link to Profiles when suggestions need disposition before audience work.",
      ];
    default:
      return ["Open Readiness if anything looks off — still no send from ECC surfaces."];
  }
}

export function eccAutomaticBlockedReasons(surface: EccOperatorSurfaceId, snapshot: EmailCommandCenterSnapshot): string[] {
  const og = snapshot.operatorGate;
  const sg = snapshot.sendgridEnv;
  const sgF = snapshot.sendGridFoundation;
  const out: string[] = [];

  if (!og.cockpitDbReachable) {
    out.push("Hosted DB not verified for this request — Postgres unreachable (DATABASE_URL / network).");
  } else if (og.allEmailCommandCenterMigrationsApplied !== true) {
    out.push("Migrations incomplete — run npx prisma migrate deploy then npm run email:command-center:preflight.");
  }

  if (surface === "sendgrid" || surface === "analytics") {
    if (!sg.sendgridApiKeyPresent || !sg.sendgridFromEmailPresent) {
      out.push("SendGrid not fully configured — SENDGRID_API_KEY and/or SENDGRID_FROM_EMAIL missing (env names only).");
    }
    if (!sg.sendgridWebhookVerificationKeyPresent) {
      out.push("Webhook verification PEM not set — signed event intake may fail in production.");
    }
    if (!sgF.dbReachable) {
      out.push("SendGrid foundation tables not reachable — migrate before trusting counts.");
    }
  }

  return out;
}

export function EccNextActionStrip({
  lines,
  title = "Next actions",
  tone = "navy",
}: {
  lines: string[];
  title?: string;
  tone?: "navy" | "emerald" | "amber";
}) {
  const border =
    tone === "emerald"
      ? "border-emerald-300/55 bg-emerald-50/85 text-emerald-950"
      : tone === "amber"
        ? "border-amber-300/55 bg-amber-50/85 text-amber-950"
        : "border-kelly-navy/25 bg-kelly-navy/[0.05] text-kelly-navy";
  if (!lines.length) return null;
  return (
    <section className={`rounded-lg border px-3 py-2.5 font-body text-[11px] leading-snug shadow-sm ${border}`} role="region">
      <p className="font-heading text-[10px] font-bold uppercase tracking-wide opacity-85">{title}</p>
      <ol className="mt-2 list-inside list-decimal space-y-1">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ol>
    </section>
  );
}

export function EccBlockedBecausePanel({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return null;
  return (
    <div
      className="rounded-lg border border-amber-400/55 bg-amber-50/90 px-3 py-2 font-body text-[11px] text-amber-950"
      role="status"
    >
      <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-amber-900">Blocked because</p>
      <ul className="mt-1.5 list-inside list-disc space-y-0.5">
        {reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

export function EccEmptyState({
  why,
  next,
  safety,
  href,
  linkLabel,
}: {
  why: string;
  next: string;
  safety: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-lg border border-kelly-text/12 bg-kelly-fog/45 px-3 py-2.5 font-body text-[11px] text-kelly-navy" role="status">
      <p className="font-semibold text-kelly-navy">{why}</p>
      <p className="mt-1 text-[10px] text-kelly-text/85">{next}</p>
      <p className="mt-1 text-[10px] font-semibold text-kelly-forest/90">
        Safety: {safety}
      </p>
      <p className="mt-2">
        <Link href={href} className="text-[10px] font-bold text-kelly-forest underline">
          {linkLabel}
        </Link>
      </p>
    </div>
  );
}

export function EccBackToDailyConsoleLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href={DAILY_OPERATOR_CONSOLE_PATH}
      className={`inline-flex rounded-md border border-emerald-400/50 bg-emerald-50/95 px-2.5 py-1 text-[11px] font-bold text-emerald-950 shadow-sm transition hover:border-emerald-500/60 ${className}`}
    >
      ← Daily Operator Console
    </Link>
  );
}

export function EccOperatorPageChrome({
  snapshot,
  surface,
  extraStatusChips = [],
  extraNextLines = [],
  extraBlockedReasons = [],
  showDailyBackLink = true,
  nextStripTone = "navy",
}: {
  snapshot: EmailCommandCenterSnapshot;
  surface: EccOperatorSurfaceId;
  /** Additional chip variants (dedupe by variant). */
  extraStatusChips?: EccStatusChipVariant[];
  extraNextLines?: string[];
  extraBlockedReasons?: string[];
  showDailyBackLink?: boolean;
  nextStripTone?: "navy" | "emerald" | "amber";
}) {
  const og = snapshot.operatorGate;
  const ci = snapshot.contactImport;
  const ms = snapshot.messageStudioSharedDrafts;

  const baseChips = buildEccDefaultStatusChips(snapshot);
  const chipSet = new Set<EccStatusChipVariant>([...baseChips, ...extraStatusChips]);
  if (ci.pendingApprovalCount > 0) {
    chipSet.add("requires_approval");
  }
  if (ms.dbReachable && ms.needsReview > 0) {
    chipSet.add("requires_approval");
  }
  if (surface === "automation") {
    chipSet.add("future");
  }

  const nextLines = [...eccNextActionsForSurface(surface, snapshot), ...extraNextLines].slice(0, 5);
  const blocked = [...eccAutomaticBlockedReasons(surface, snapshot), ...extraBlockedReasons];

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {showDailyBackLink ? <EccBackToDailyConsoleLink /> : null}
        <Link
          href={ECC_BASE}
          className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-[11px] font-semibold text-kelly-slate"
        >
          ← Command Center cockpit
        </Link>
        <Link href={`${ECC_BASE}/readiness`} className="text-[11px] font-semibold text-kelly-forest hover:underline">
          Readiness
        </Link>
        <Link href={`${ECC_BASE}/map`} className="text-[11px] text-kelly-text/60 hover:underline">
          Route map
        </Link>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[...chipSet].map((v) => (
          <EccStatusChip key={v} variant={v} />
        ))}
      </div>

      <EccNextActionStrip lines={nextLines} tone={nextStripTone} />
      <EccBlockedBecausePanel reasons={blocked} />

      {og.databaseUrlHostKind === "loopback" ? (
        <p className="rounded border border-sky-200/70 bg-sky-50/80 px-2 py-1.5 font-body text-[10px] text-sky-950">
          <strong>Local-only database URL:</strong> Kelly-Grappe / production hosted verification is a separate operator step — run{" "}
          <code className="text-[9px]">{og.importGateCliHint}</code> on the hosted <code className="text-[9px]">DATABASE_URL</code> before
          treating imports or suppressions as production-canonical.
        </p>
      ) : null}
    </div>
  );
}
