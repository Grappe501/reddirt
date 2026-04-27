import Link from "next/link";
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
  if ((askKellyBetaCategoryValues as readonly string[]).includes(raw)) {
    return ASK_KELLY_CATEGORY_LABELS[raw as AskKellyBetaCategory];
  }
  return raw;
}

export default async function AdminAskKellyBetaTriagePage() {
  const rows = await prisma.workflowIntake.findMany({
    where: { source: "ask_kelly_beta" },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="min-w-0 p-4 md:p-6">
      <div className="mb-6 max-w-3xl">
        <Link href="/admin/workbench" className="text-sm font-semibold text-kelly-slate hover:underline">
          ← Campaign workbench
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Ask Kelly — beta feedback triage</h1>
        <p className="mt-1 font-body text-sm leading-relaxed text-kelly-text/80">
          Invite-only beta submissions about the public site, volunteering, and message/content. Staff can
          surface and sort these—owner and <strong>final say</strong> is listed as <strong>Kelly</strong> (not a staff approval gate). No voter
          file, donor, or treasury fields appear here.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="font-body text-sm text-kelly-slate">No rows yet. New beta feedback appears here after someone submits from Ask Kelly on the
          public site.</p>
      ) : (
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
                return (
                  <tr key={r.id} className="border-b border-kelly-text/5">
                    <td className="p-2.5 font-semibold text-kelly-text">
                      {r.title ?? "Ask Kelly beta feedback"}
                    </td>
                    <td className="p-2.5 text-kelly-slate">{categoryLabel(meta.category)}</td>
                    <td className="p-2.5 text-kelly-slate">{statusLabel[r.status]}</td>
                    <td className="p-2.5 whitespace-nowrap text-kelly-slate text-xs">
                      {r.createdAt.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="p-2.5 text-xs text-kelly-slate break-all">
                      {typeof meta.pagePath === "string" && meta.pagePath ? meta.pagePath : "—"}
                    </td>
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
      )}
    </div>
  );
}
