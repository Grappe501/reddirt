import Link from "next/link";
import { Suspense } from "react";
import { WorkflowIntakeStatus } from "@prisma/client";

import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const AEAC_SOURCES = [
  "election_advisory_concern",
  "election_advisory_participate",
  "election_advisory_updates",
] as const;

const statusLabel: Record<WorkflowIntakeStatus, string> = {
  PENDING: "Pending",
  IN_REVIEW: "In review",
  AWAITING_INFO: "Awaiting info",
  READY_FOR_CALENDAR: "Ready for calendar",
  CONVERTED: "Converted",
  DECLINED: "Declined",
  ARCHIVED: "Archived",
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function statusDisplay(status: WorkflowIntakeStatus | string | undefined | null): string {
  if (status == null) return "—";
  if (status in statusLabel) return statusLabel[status as WorkflowIntakeStatus];
  return "—";
}

function safeDate(d: Date | string | null | undefined): string {
  if (d == null) return "—";
  const t = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(t.getTime())) return "—";
  return t.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" });
}

function sourceLabel(source: string | null): string {
  if (source === "election_advisory_concern") return "Concern";
  if (source === "election_advisory_participate") return "Participate";
  if (source === "election_advisory_updates") return "Updates";
  return source ?? "—";
}

function TriageLoading() {
  return (
    <div
      className="rounded-lg border border-kelly-text/15 bg-kelly-fog/50 p-6 shadow-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="font-body text-sm text-kelly-slate">Loading…</p>
      <p className="mt-1 font-body text-xs text-kelly-subtle">
        Fetching Arkansas Election Advisory Commission submissions.
      </p>
    </div>
  );
}

function TriageLoadError() {
  return (
    <div className="rounded-lg border border-red-200/80 bg-red-50/95 px-4 py-3 text-sm text-red-900" role="alert">
      <p className="font-medium">We couldn&apos;t load Commission submissions right now.</p>
      <p className="mt-1.5 text-red-900/90">Try refreshing.</p>
    </div>
  );
}

type AeacRow = {
  id: string;
  createdAt: Date;
  title: string | null;
  source: string | null;
  status: WorkflowIntakeStatus;
  metadata: unknown;
  submission: {
    id: string;
    content: string | null;
    user: { name: string | null; email: string; phone: string | null } | null;
  } | null;
};

async function AeacTriageTable() {
  let rows: AeacRow[];
  try {
    rows = await prisma.workflowIntake.findMany({
      where: { source: { in: [...AEAC_SOURCES] } },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        submission: {
          select: {
            id: true,
            content: true,
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
    });
  } catch (e) {
    console.error("[election-advisory workbench]", e);
    return <TriageLoadError />;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-kelly-text/10 bg-kelly-fog/40 px-4 py-5">
        <p className="font-body text-sm leading-relaxed text-kelly-slate">
          <span className="font-semibold text-kelly-ink">No Commission submissions yet.</span> Concerns,
          participation interest, and update signups from{" "}
          <code className="text-xs">/election-advisory</code> will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-kelly-text/10 bg-white">
      <table className="min-w-full text-left font-body text-sm">
        <thead className="bg-kelly-fog/60 text-xs uppercase tracking-wide text-kelly-muted">
          <tr>
            <th className="px-3 py-2">When</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Title</th>
            <th className="px-3 py-2">Person</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Topics / role</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const meta = isRecord(row.metadata) ? row.metadata : {};
            const topics = Array.isArray(meta.topics) ? meta.topics.filter((t) => typeof t === "string").join(", ") : "";
            const role = typeof meta.role === "string" ? meta.role : "";
            const person = row.submission?.user;
            return (
              <tr key={row.id} className="border-t border-kelly-text/10 align-top">
                <td className="px-3 py-2 whitespace-nowrap">{safeDate(row.createdAt)}</td>
                <td className="px-3 py-2">{sourceLabel(row.source)}</td>
                <td className="px-3 py-2">{row.title ?? "—"}</td>
                <td className="px-3 py-2">
                  {person?.name ?? "—"}
                  <br />
                  <span className="text-kelly-muted">{person?.email ?? ""}</span>
                </td>
                <td className="px-3 py-2">{statusDisplay(row.status)}</td>
                <td className="px-3 py-2 text-kelly-slate">
                  {role || topics || "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminElectionAdvisoryTriagePage() {
  return (
    <div className="min-w-0 p-4 md:p-6">
      <div className="mb-8 max-w-3xl">
        <Link href="/admin/workbench" className="text-sm font-semibold text-kelly-slate hover:underline">
          ← Campaign workbench
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold text-kelly-text">
          Arkansas Election Advisory Commission — intake
        </h1>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">
          Concerns, committee/expertise interest, and email update signups from the unlinked public section at{" "}
          <Link className="font-semibold text-kelly-navy underline" href="/election-advisory">
            /election-advisory
          </Link>
          . Rows are <code className="text-xs">WorkflowIntake</code> with AEAC form sources.
        </p>
      </div>
      <Suspense fallback={<TriageLoading />}>
        <AeacTriageTable />
      </Suspense>
    </div>
  );
}
