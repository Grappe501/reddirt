"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  loadDraftsFromStorage,
  type MessageStudioLocalDraft,
} from "@/components/admin/email-command-center/message-studio-local-drafts";
import { DailyLocalDraftSummary, type DailyLocalDraftConsoleStats } from "@/components/admin/email-command-center/DailyLocalDraftSummary";
import {
  DAILY_OPERATOR_CONSOLE_PATH,
  ECC_BASE,
  EMAIL_QUEUE_PATH,
  MESSAGE_STUDIO_PATH,
} from "@/components/admin/email-command-center/daily-operator-console-paths";
import { computeEditorialReadinessTier } from "@/lib/email-command-center/message-studio-editorial-review-model";
import type { EmailCommandCenterSnapshot } from "@/lib/email-command-center/read-model";

const card =
  "rounded-lg border border-kelly-text/12 bg-gradient-to-b from-white/95 to-kelly-page/90 px-3 py-2 shadow-sm";
const h3 = "font-heading text-[10px] font-bold uppercase tracking-wider text-kelly-text/50";

function PriorityCard({
  title,
  value,
  href,
  sub,
  degraded,
}: {
  title: string;
  value: number | string;
  href: string;
  sub?: string;
  degraded?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${card} block transition hover:border-kelly-forest/30 hover:shadow-md ${
        degraded ? "border-amber-200/70 bg-amber-50/40" : ""
      }`}
    >
      <p className={h3}>{title}</p>
      <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-kelly-navy">{value}</p>
      {sub ? <p className="mt-0.5 font-body text-[10px] text-kelly-text/65">{sub}</p> : null}
    </Link>
  );
}

function computeDraftStats(drafts: MessageStudioLocalDraft[]): DailyLocalDraftConsoleStats {
  let missingBasics = 0;
  let needsReviewTier = 0;
  let sendGovernanceReady = 0;
  let needsEditorialReview = 0;
  let last: MessageStudioLocalDraft | null = null;

  for (const d of drafts) {
    const tier = computeEditorialReadinessTier(d);
    if (tier === "missing_basics") missingBasics += 1;
    if (tier === "needs_review") needsReviewTier += 1;
    if (tier === "send_governance_ready") sendGovernanceReady += 1;
    if (
      d.approvalStatus === "needs_review" ||
      d.editorialReviewStatus === "editorial_needs_edits" ||
      tier === "needs_review"
    ) {
      needsEditorialReview += 1;
    }
    if (!last || d.updatedAt > last.updatedAt) last = d;
  }

  return {
    total: drafts.length,
    missingBasics,
    needsReviewTier,
    sendGovernanceReady,
    needsEditorialReview,
    lastUpdatedTitle: last?.title?.trim() || (drafts.length ? "Untitled" : "—"),
    lastUpdatedAt: last?.updatedAt ?? "—",
  };
}

function buildNextBestActions(snapshot: EmailCommandCenterSnapshot, draftStats: DailyLocalDraftConsoleStats | null): string[] {
  const out: string[] = [];
  const og = snapshot.operatorGate;
  const q = snapshot.queueHealth;
  const pg = snapshot.profileGraph;
  const ci = snapshot.contactImport;
  const sgF = snapshot.sendGridFoundation;

  if (!og.cockpitDbReachable) {
    out.push("Fix local or hosted database connectivity before imports or live analytics counts — open Readiness checklist.");
  }
  if (q.needsAttentionCount > 0) {
    out.push("Start with email queue triage — needs-attention items are waiting.");
  }
  if (pg.pendingProfileFactSuggestions > 0) {
    out.push("Review profile intelligence — pending fact suggestions need disposition.");
  }
  if (ci.pendingApprovalCount > 0) {
    out.push("Review contact import batches pending approval before commit.");
  }
  if (draftStats && draftStats.needsEditorialReview > 0) {
    out.push("Open Message Studio — local drafts need editorial review (this browser).");
  }
  if (draftStats && draftStats.sendGovernanceReady > 0) {
    out.push(
      "Review send packets / drafts ready for governance — assemble no-send packets in Message Studio Send Packet Builder, then verify Send Execution Governance.",
    );
  }
  if (og.cockpitDbReachable && sgF.suppressionCount > 0) {
    out.push("Check SendGrid suppressions / deliverability signals before any future broadcast send.");
  }
  if (out.length === 0) {
    out.push("No urgent counters surfaced — start with Gmail Review or prepare the next message in Message Studio.");
  }
  return out;
}

type Props = {
  snapshot: EmailCommandCenterSnapshot;
};

export function DailyOperatorConsoleView({ snapshot }: Props) {
  const [draftStats, setDraftStats] = useState<DailyLocalDraftConsoleStats | null>(null);
  const [draftPending, setDraftPending] = useState(true);

  useEffect(() => {
    try {
      const drafts = loadDraftsFromStorage();
      setDraftStats(computeDraftStats(drafts));
    } catch {
      setDraftStats({ total: 0, missingBasics: 0, needsReviewTier: 0, sendGovernanceReady: 0, needsEditorialReview: 0, lastUpdatedTitle: "", lastUpdatedAt: "—" });
    } finally {
      setDraftPending(false);
    }
  }, []);

  const og = snapshot.operatorGate;
  const q = snapshot.queueHealth;
  const g = snapshot.gmail;
  const pg = snapshot.profileGraph;
  const au = snapshot.audienceStudio;
  const ci = snapshot.contactImport;
  const sgF = snapshot.sendGridFoundation;
  const oa = snapshot.openAi;
  const dbOk = og.cockpitDbReachable;

  const nextActions = useMemo(() => buildNextBestActions(snapshot, draftStats), [snapshot, draftStats]);

  const localNeedsReview = draftStats ? draftStats.needsEditorialReview : "—";
  const localSendGov = draftStats ? draftStats.sendGovernanceReady : "—";

  return (
    <div className="min-w-0 max-w-6xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={ECC_BASE} className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 text-xs font-semibold text-kelly-slate">
          ← Email Command Center
        </Link>
        <Link href={`${ECC_BASE}/readiness`} className="text-xs font-bold text-kelly-forest hover:underline">
          Readiness
        </Link>
        <Link href={`${ECC_BASE}/map`} className="text-xs text-kelly-text/60 hover:underline">
          Route map
        </Link>
      </div>

      <header className="space-y-2 border-b border-kelly-text/10 pb-3">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">Daily Operator Console</h1>
        <p className="max-w-3xl font-body text-sm text-kelly-text/85">
          Start here to triage inbox work, review drafts, approve profile intelligence, prepare audiences, and check send gates.
        </p>
        <p className="max-w-3xl font-body text-xs text-kelly-text/78">
          <strong>No-send posture:</strong> no SendGrid broadcast, no Gmail send-from-queue, no automation activation from
          this surface — snapshot links and local Message Studio stats only.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-full border border-emerald-300/60 bg-emerald-50/90 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-950">
            Production workflow
          </span>
          <span className="rounded-full border border-kelly-navy/20 bg-kelly-fog/70 px-2 py-0.5 text-[9px] font-bold uppercase text-kelly-navy">
            No live sends
          </span>
          <span className="rounded-full border border-kelly-text/15 bg-white px-2 py-0.5 text-[9px] font-semibold text-kelly-slate">
            Queue-first
          </span>
          <span className="rounded-full border border-kelly-text/15 bg-white px-2 py-0.5 text-[9px] font-semibold text-kelly-slate">
            Review-first
          </span>
          <span className="rounded-full border border-violet-200/70 bg-violet-50/80 px-2 py-0.5 text-[9px] font-bold uppercase text-violet-950">
            Governed handoff
          </span>
        </div>
        <p className="font-body text-[10px] text-kelly-text/70">
          EMAIL-DAILY-OPERATOR-CONSOLE-1.0 — <strong>no demo mode</strong>, <strong>no migrations</strong>,{" "}
          <code className="rounded bg-kelly-page px-0.5 text-[9px]">EMAIL_WORKFLOW_CAN_SEND_FROM_ITEM</code> unchanged.
        </p>
      </header>

      {!dbOk ? (
        <div className="rounded-lg border border-rose-400/50 bg-rose-50/90 px-3 py-2 font-body text-[11px] text-rose-950" role="alert">
          <p className="font-bold">DB unavailable — open Readiness</p>
          <p className="mt-1">
            Cockpit could not reach Postgres for this request. Queue and intelligence counts below may be zero or stale.
            Fix <code className="text-[10px]">DATABASE_URL</code>, then run{" "}
            <code className="text-[10px]">{og.dbDiagnoseCliHint}</code> and{" "}
            <Link href={`${ECC_BASE}/readiness`} className="font-bold underline">
              Readiness checklist
            </Link>
            .
          </p>
        </div>
      ) : null}

      <section className={`${card} border-kelly-navy/20`}>
        <h2 className={h3}>Next best actions (rule-based)</h2>
        <ol className="mt-2 list-inside list-decimal space-y-1 font-body text-[11px] text-kelly-navy/95">
          {nextActions.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className={h3}>Today&apos;s priorities</h2>
        <p className="font-body text-[10px] text-kelly-text/65">
          From <code className="text-[9px]">getEmailCommandCenterSnapshot</code> plus this browser&apos;s Message Studio drafts (local only).
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <PriorityCard
            title="Needs attention (queue)"
            value={q.needsAttentionCount}
            href={EMAIL_QUEUE_PATH}
            sub="NEW, ENRICHED, IN_REVIEW, ESCALATED"
            degraded={!dbOk}
          />
          <PriorityCard
            title="Unassigned (queue)"
            value={q.unassignedCount}
            href={`${EMAIL_QUEUE_PATH}?assignee=unassigned`}
            degraded={!dbOk}
          />
          <PriorityCard
            title="Escalated (queue)"
            value={q.escalatedCount}
            href={`${EMAIL_QUEUE_PATH}?status=ESCALATED`}
            degraded={!dbOk}
          />
          <PriorityCard
            title="Ready to respond"
            value={q.readyToRespondCount}
            href={`${EMAIL_QUEUE_PATH}?status=READY_TO_RESPOND`}
            degraded={!dbOk}
          />
          <PriorityCard
            title="Pending profile suggestions"
            value={pg.pendingProfileFactSuggestions}
            href={pg.profilesReviewPath}
            degraded={!dbOk}
          />
          <PriorityCard
            title="Pending audience hints"
            value={pg.pendingAudienceHints}
            href={pg.profilesReviewPath}
            degraded={!dbOk}
          />
          <PriorityCard
            title="Open import batches"
            value={ci.openImportBatchCount}
            href={ci.path}
            sub="Non-terminal batches"
            degraded={!dbOk}
          />
          <PriorityCard
            title="Imports pending approval"
            value={ci.pendingApprovalCount}
            href={ci.path}
            degraded={!dbOk}
          />
          <PriorityCard
            title="Draft audience definitions"
            value={au.draftAudienceDefinitions}
            href={au.path}
            degraded={!dbOk || !au.dbSliceReachable}
          />
          <PriorityCard
            title="SendGrid events (ingested)"
            value={sgF.recentSendGridEventsCount}
            href={sgF.path}
            degraded={!dbOk || !sgF.dbReachable}
          />
          <PriorityCard
            title="SendGrid suppressions"
            value={sgF.suppressionCount}
            href={sgF.path}
            degraded={!dbOk || !sgF.dbReachable}
          />
          <PriorityCard
            title="Queue items with AI analysis"
            value={oa.emailAiQueueItemsAnalyzedCount}
            href={EMAIL_QUEUE_PATH}
            sub="Open item → AI panel"
            degraded={!dbOk}
          />
          <PriorityCard
            title="Local drafts — needs editorial pass"
            value={localNeedsReview}
            href={`${MESSAGE_STUDIO_PATH}#editorial-review-desk`}
            sub="This browser only — hydrates after load"
            degraded={false}
          />
          <PriorityCard
            title="Local drafts — send-governance-ready"
            value={localSendGov}
            href={`${MESSAGE_STUDIO_PATH}#send-packet-builder`}
            sub="Editorial tier — open Send Packet Builder (still no send)"
            degraded={false}
          />
        </div>
      </section>

      <DailyLocalDraftSummary stats={draftStats} pending={draftPending} />

      <section className="space-y-4">
        <h2 className={h3}>Operator work queue</h2>

        <div className={`${card} space-y-2`}>
          <h3 className="font-heading text-xs font-bold text-kelly-navy">1. Inbox and queue</h3>
          <ul className="list-inside list-disc space-y-1 font-body text-[11px] text-kelly-text/90">
            <li>
              <Link href={g.monitorPath} className="font-bold text-kelly-forest underline">
                Gmail Monitor
              </Link>
            </li>
            <li>
              <Link href={g.gmailReviewPath} className="font-bold text-kelly-forest underline">
                Gmail Review → queue
              </Link>
            </li>
            <li>
              <Link href={EMAIL_QUEUE_PATH} className="font-bold text-kelly-forest underline">
                Email Queue
              </Link>
            </li>
            <li>
              <Link href={`${EMAIL_QUEUE_PATH}?assignee=unassigned`} className="font-bold underline">
                Unassigned filter
              </Link>
            </li>
            <li>
              <Link href={`${EMAIL_QUEUE_PATH}?status=ESCALATED`} className="font-bold underline">
                Escalated filter
              </Link>
            </li>
          </ul>
        </div>

        <div className={`${card} space-y-2`}>
          <h3 className="font-heading text-xs font-bold text-kelly-navy">2. Intelligence review</h3>
          <ul className="list-inside list-disc space-y-1 font-body text-[11px] text-kelly-text/90">
            <li>
              <Link href={EMAIL_QUEUE_PATH} className="font-bold text-kelly-forest underline">
                Email Queue
              </Link>{" "}
              — open items needing analysis; run AI from item detail when configured.
            </li>
            <li>
              <Link href={pg.profilesReviewPath} className="font-bold text-kelly-forest underline">
                Profile &amp; hint review
              </Link>{" "}
              — approve or reject suggestions (governed facts).
            </li>
            <li>
              <Link href={au.path} className="font-bold text-kelly-forest underline">
                Audience Studio
              </Link>
            </li>
          </ul>
        </div>

        <div className={`${card} space-y-2`}>
          <h3 className="font-heading text-xs font-bold text-kelly-navy">3. Contact import</h3>
          <ul className="list-inside list-disc space-y-1 font-body text-[11px] text-kelly-text/90">
            <li>
              <Link href={ci.path} className="font-bold text-kelly-forest underline">
                Contact Imports
              </Link>
            </li>
            <li>Review pending batches — do not treat imports as marketing consent.</li>
          </ul>
        </div>

        <div className={`${card} space-y-2`}>
          <h3 className="font-heading text-xs font-bold text-kelly-navy">4. Drafting and review</h3>
          <ul className="list-inside list-disc space-y-1 font-body text-[11px] text-kelly-text/90">
            <li>
              <Link href={MESSAGE_STUDIO_PATH} className="font-bold text-kelly-forest underline">
                Message Studio
              </Link>{" "}
              — local drafts, Campaign Voice, production templates.
            </li>
            <li>
              <Link href={`${MESSAGE_STUDIO_PATH}#editorial-review-desk`} className="font-bold underline">
                Editorial Review Desk
              </Link>{" "}
              (anchor on Message Studio page)
            </li>
            <li>
              <Link href={`${MESSAGE_STUDIO_PATH}#send-packet-builder`} className="font-bold underline">
                Review send packets / drafts ready for governance
              </Link>{" "}
              — Send Packet Builder (no-send export; drafts at editorial tier{" "}
              <code className="text-[9px]">send_governance_ready</code> highlighted in stats above).
            </li>
            <li>
              <Link href={`${ECC_BASE}/send-execution`} className="font-bold text-kelly-forest underline">
                Send Execution Governance
              </Link>
            </li>
          </ul>
        </div>

        <div className={`${card} space-y-2`}>
          <h3 className="font-heading text-xs font-bold text-kelly-navy">5. Readiness and analytics</h3>
          <ul className="list-inside list-disc space-y-1 font-body text-[11px] text-kelly-text/90">
            <li>
              <Link href={`${ECC_BASE}/analytics`} className="font-bold text-kelly-forest underline">
                Analytics &amp; Deliverability
              </Link>
            </li>
            <li>
              <Link href={`${ECC_BASE}/automation`} className="font-bold text-kelly-forest underline">
                Automation Studio
              </Link>
            </li>
            <li>
              <Link href={`${ECC_BASE}/readiness`} className="font-bold text-kelly-forest underline">
                Readiness Checklist
              </Link>
            </li>
            <li>
              <Link href={`${ECC_BASE}/map`} className="font-bold text-kelly-forest underline">
                Route Map
              </Link>
            </li>
            <li>
              <Link href={DAILY_OPERATOR_CONSOLE_PATH} className="font-semibold text-kelly-text/80 underline">
                Refresh this console
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
