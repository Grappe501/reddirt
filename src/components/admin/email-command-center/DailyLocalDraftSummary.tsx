"use client";

import Link from "next/link";
import { MESSAGE_STUDIO_PATH } from "@/components/admin/email-command-center/daily-operator-console-paths";

export type DailyLocalDraftConsoleStats = {
  total: number;
  missingBasics: number;
  needsReviewTier: number;
  sendGovernanceReady: number;
  /** Drafts that need an editorial pass (approval, editorial status, or readiness tier). */
  needsEditorialReview: number;
  lastUpdatedTitle: string;
  lastUpdatedAt: string;
};

type Props = {
  stats: DailyLocalDraftConsoleStats | null;
  /** True before browser read completes */
  pending: boolean;
};

export function DailyLocalDraftSummary({ stats, pending }: Props) {
  return (
    <section className="rounded-lg border border-indigo-200/70 bg-indigo-50/50 p-3 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-heading text-[10px] font-bold uppercase tracking-wide text-indigo-950/80">
            Message Studio — this browser only
          </h2>
          <p className="mt-1 max-w-xl font-body text-[10px] text-indigo-950/90">
            EMAIL-DAILY-OPERATOR-CONSOLE-1.0 + <strong>EMAIL-SEND-PACKET-BUILDER-1.0</strong> — reads{" "}
            <code className="rounded bg-white/90 px-0.5 text-[9px]">localStorage</code> only. Nothing is uploaded or sent.
            Drafts at readiness tier <code className="text-[9px]">send_governance_ready</code> are candidates for a no-send
            send packet export before Send Execution Governance.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-1">
          <Link
            href={`${MESSAGE_STUDIO_PATH}#editorial-review-desk`}
            className="rounded border border-indigo-400/50 bg-indigo-100/90 px-2 py-1 text-[10px] font-bold text-indigo-950"
          >
            Open Message Studio
          </Link>
          <Link
            href={`${MESSAGE_STUDIO_PATH}#send-packet-builder`}
            className="rounded border border-indigo-500/40 bg-white/95 px-2 py-1 text-[10px] font-bold text-indigo-950"
          >
            Send Packet Builder
          </Link>
        </div>
      </div>
      {pending ? (
        <p className="mt-2 font-body text-[10px] text-indigo-900/80">Reading this browser…</p>
      ) : stats && stats.total === 0 ? (
        <p className="mt-2 font-body text-[10px] text-indigo-900/85">No local drafts yet — open Message Studio to create one.</p>
      ) : stats ? (
        <dl className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded border border-indigo-100 bg-white/90 px-2 py-1.5">
            <dt className="font-heading text-[9px] font-bold uppercase text-indigo-900/60">Total drafts</dt>
            <dd className="font-heading text-xl font-bold tabular-nums text-indigo-950">{stats.total}</dd>
          </div>
          <div className="rounded border border-indigo-100 bg-white/90 px-2 py-1.5">
            <dt className="font-heading text-[9px] font-bold uppercase text-indigo-900/60">Missing basics</dt>
            <dd className="font-heading text-xl font-bold tabular-nums text-indigo-950">{stats.missingBasics}</dd>
          </div>
          <div className="rounded border border-indigo-100 bg-white/90 px-2 py-1.5">
            <dt className="font-heading text-[9px] font-bold uppercase text-indigo-900/60">Needs review (tier)</dt>
            <dd className="font-heading text-xl font-bold tabular-nums text-indigo-950">{stats.needsReviewTier}</dd>
          </div>
          <div className="rounded border border-indigo-100 bg-white/90 px-2 py-1.5">
            <dt className="font-heading text-[9px] font-bold uppercase text-indigo-900/60">Needs editorial pass</dt>
            <dd className="font-heading text-xl font-bold tabular-nums text-amber-900">{stats.needsEditorialReview}</dd>
          </div>
          <div className="rounded border border-indigo-100 bg-white/90 px-2 py-1.5">
            <dt className="font-heading text-[9px] font-bold uppercase text-indigo-900/60">Ready for send-governance</dt>
            <dd className="font-heading text-xl font-bold tabular-nums text-emerald-900">{stats.sendGovernanceReady}</dd>
          </div>
          <div className="rounded border border-indigo-100 bg-white/90 px-2 py-1.5 sm:col-span-2 lg:col-span-1">
            <dt className="font-heading text-[9px] font-bold uppercase text-indigo-900/60">Last updated</dt>
            <dd className="mt-0.5 font-body text-[10px] font-semibold text-indigo-950">
              {stats.lastUpdatedTitle || "Untitled"}
            </dd>
            <dd className="font-mono text-[9px] text-indigo-900/75">{stats.lastUpdatedAt}</dd>
          </div>
        </dl>
      ) : null}
    </section>
  );
}
