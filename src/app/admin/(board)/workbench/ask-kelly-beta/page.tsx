import Link from "next/link";
import { Suspense } from "react";
import type { WorkflowIntake } from "@prisma/client";
import { WorkflowIntakeStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { ASK_KELLY_CATEGORY_LABELS } from "@/content/ask-kelly-beta-public-copy";
import type { AskKellyBetaCategory } from "@/lib/forms/ask-kelly-beta-types";
import { askKellyBetaCategoryValues } from "@/lib/forms/schemas";

export const dynamic = "force-dynamic";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const statusLabel: Record<WorkflowIntakeStatus, string> = {
  PENDING: "Pending",
  IN_REVIEW: "In review",
  AWAITING_INFO: "Awaiting info",
  READY_FOR_CALENDAR: "Ready for calendar",
  CONVERTED: "Converted",
  DECLINED: "Declined",
  ARCHIVED: "Archived",
};

function categoryLabel(raw: unknown): string {
  if (typeof raw !== "string") return "—";
  const s = raw.trim();
  if (!s) return "—";
  if ((askKellyBetaCategoryValues as readonly string[]).includes(s)) {
    return ASK_KELLY_CATEGORY_LABELS[s as AskKellyBetaCategory];
  }
  return s;
}

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

function titleCell(raw: string | null | undefined): string {
  if (raw == null) return "Ask Kelly beta feedback";
  const t = String(raw).trim();
  return t.length > 0 ? t : "Ask Kelly beta feedback";
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
      <p className="mt-1 font-body text-xs text-kelly-text/50">Fetching Ask Kelly beta feedback from the database.</p>
    </div>
  );
}

function TriageLoadError() {
  return (
    <div className="rounded-lg border border-red-200/80 bg-red-50/95 px-4 py-3 text-sm text-red-900" role="alert">
      <p className="font-medium">We couldn&apos;t load beta feedback right now. Nothing was changed.</p>
      <p className="mt-1.5 text-red-900/90">Try refreshing.</p>
    </div>
  );
}

async function AskKellyTriageTable() {
  let rows: WorkflowIntake[];
  try {
    rows = await prisma.workflowIntake.findMany({
      where: { source: "ask_kelly_beta" },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  } catch (e) {
    console.error("[ask-kelly-beta page]", e);
    return <TriageLoadError />;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-kelly-text/10 bg-kelly-fog/40 px-4 py-5">
        <p className="font-body text-sm leading-relaxed text-kelly-slate">
          <span className="font-semibold text-kelly-ink">No feedback yet.</span> When beta testers submit feedback, it will appear
          here.
        </p>
        <p className="mt-2 font-body text-xs text-kelly-text/60">Nothing is wrong—this list starts empty until the first submission.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-kelly-text/10 bg-kelly-page">
      <table className="w-full min-w-[600px] border-collapse text-left font-body text-sm">
        <thead>
          <tr className="border-b border-kelly-text/10 bg-kelly-fog/60">
            <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Title</th>
            <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Category</th>
            <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Status</th>
            <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Submitted</th>
            <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Page</th>
            <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-text/50">Owner / authority</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const meta = isRecord(r.metadata) ? r.metadata : {};
            const pagePath = typeof meta.pagePath === "string" && meta.pagePath.trim() ? meta.pagePath.trim() : "—";
            return (
              <tr key={r.id} className="border-b border-kelly-text/5">
                <td className="p-2.5 font-semibold text-kelly-text">{titleCell(r.title)}</td>
                <td className="p-2.5 text-kelly-slate">{categoryLabel(meta.category)}</td>
                <td className="p-2.5 text-kelly-slate">{statusDisplay(r.status)}</td>
                <td className="p-2.5 whitespace-nowrap text-kelly-slate text-xs">{safeDate(r.createdAt)}</td>
                <td className="p-2.5 break-all text-xs text-kelly-slate">{pagePath}</td>
                <td className="p-2.5 text-xs text-kelly-slate">
                  Owner: <span className="font-semibold text-kelly-text">Kelly</span>
                  <br />
                  Final authority: <span className="font-semibold text-kelly-text">Kelly</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminAskKellyBetaTriagePage() {
  return (
    <div className="min-w-0 p-4 md:p-6">
      <div className="mb-8 max-w-3xl">
        <Link href="/admin/workbench" className="text-sm font-semibold text-kelly-slate hover:underline">
          ← Campaign workbench
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold text-kelly-text">Ask Kelly — beta feedback (candidate-owned)</h1>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">
          Invite-only beta submissions about the public site, volunteering, and message/content. Staff can
          surface and sort; <strong>owner</strong> and <strong>final say</strong> for these notes: <strong>Kelly</strong>—this queue is <strong>not</strong> a
          &quot;staff approves the candidate&quot; step. <strong>Nothing</strong> here is wired to change site copy; use{" "}
          <Link className="font-semibold text-kelly-navy underline" href="/admin/pages">
            Page copy
          </Link>{" "}
          for hero text with two-step save. See{" "}
          <Link className="font-semibold text-kelly-navy underline" href="/admin/content">
            Content overview
          </Link>
          . No voter file, donor, or treasury fields on this list.
        </p>
      </div>

      <Suspense fallback={<TriageLoading />}>
        <AskKellyTriageTable />
      </Suspense>

      <div className="mt-10 max-w-3xl rounded-lg border border-kelly-forest/15 bg-kelly-fog/50 px-4 py-3 text-sm text-kelly-text/90">
        <p className="font-semibold text-kelly-navy/95">If you’re looking for something else</p>
        <ul className="mt-2 list-inside list-disc space-y-1 pl-0.5 text-kelly-text/85">
          <li>
            <span className="font-medium">Page copy (hero editor)</span> —{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/admin/pages">
              /admin/pages
            </Link>
          </li>
          <li>
            <span className="font-medium">Campaign workbench (overview)</span> —{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/admin/workbench">
              /admin/workbench
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
