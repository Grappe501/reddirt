import Link from "next/link";
import { Suspense } from "react";
import type { WorkflowIntake } from "@prisma/client";
import { WorkflowIntakeStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

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

const pathwayLabel: Record<string, string> = {
  local: "Local leadership",
  campaign: "Campaign team",
  youth: "Youth Coalition (AYC)",
  match: "Match me",
};

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

function metaString(meta: Record<string, unknown>, key: string): string {
  const v = meta[key];
  return typeof v === "string" && v.trim() ? v.trim() : "—";
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
        Fetching Volunteer Leadership Kickoff signups from the database.
      </p>
    </div>
  );
}

function TriageLoadError() {
  return (
    <div className="rounded-lg border border-red-200/80 bg-red-50/95 px-4 py-3 text-sm text-red-900" role="alert">
      <p className="font-medium">We couldn&apos;t load kickoff signups right now. Nothing was changed.</p>
      <p className="mt-1.5 text-red-900/90">Try refreshing.</p>
    </div>
  );
}

type KickoffRow = WorkflowIntake & {
  submission: {
    id: string;
    user: { name: string | null; email: string; phone: string | null } | null;
  } | null;
};

async function KickoffTriageTable() {
  let rows: KickoffRow[];
  try {
    rows = await prisma.workflowIntake.findMany({
      where: { source: "volunteer_kickoff" },
      orderBy: { createdAt: "desc" },
      take: 250,
      include: {
        submission: {
          select: {
            id: true,
            user: { select: { name: true, email: true, phone: true } },
          },
        },
      },
    });
  } catch (e) {
    console.error("[volunteer-kickoff triage page]", e);
    return <TriageLoadError />;
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-kelly-text/10 bg-kelly-fog/40 px-4 py-5">
        <p className="font-body text-sm leading-relaxed text-kelly-slate">
          <span className="font-semibold text-kelly-ink">No kickoff signups yet.</span> When volunteers submit from
          the kickoff site or <code className="text-xs">/volunteer-kickoff/join</code>, they will appear here.
        </p>
      </div>
    );
  }

  const pathwayCounts = rows.reduce<Record<string, number>>((acc, r) => {
    const meta = isRecord(r.metadata) ? r.metadata : {};
    const pathway = typeof meta.pathway === "string" ? meta.pathway : "other";
    acc[pathway] = (acc[pathway] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {Object.entries(pathwayCounts).map(([pathway, count]) => (
          <span
            key={pathway}
            className="rounded-full border border-kelly-text/10 bg-kelly-fog/60 px-3 py-1 text-xs font-semibold text-kelly-slate"
          >
            {pathwayLabel[pathway] || pathway}: {count}
          </span>
        ))}
        <span className="rounded-full border border-kelly-navy/20 bg-white px-3 py-1 text-xs font-semibold text-kelly-navy">
          Total: {rows.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-kelly-text/10 bg-kelly-page">
        <table className="w-full min-w-[780px] border-collapse text-left font-body text-sm">
          <thead>
            <tr className="border-b border-kelly-text/10 bg-kelly-fog/60">
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Volunteer</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Pathway</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">County / team</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Status</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Submitted</th>
              <th className="p-2.5 text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const meta = isRecord(r.metadata) ? r.metadata : {};
              const pathway = typeof meta.pathway === "string" ? meta.pathway : "";
              const team =
                (typeof meta.primaryTeam === "string" && meta.primaryTeam) ||
                (typeof meta.teamCategory === "string" && meta.teamCategory) ||
                "—";
              const user = r.submission?.user;
              return (
                <tr key={r.id} className="border-b border-kelly-text/5 align-top">
                  <td className="p-2.5">
                    <div className="font-semibold text-kelly-text">{user?.name || r.title || "—"}</div>
                    <div className="text-xs text-kelly-slate">{user?.email || "—"}</div>
                    <div className="text-xs text-kelly-slate">{user?.phone || "—"}</div>
                  </td>
                  <td className="p-2.5 text-kelly-slate">{pathwayLabel[pathway] || pathway || "—"}</td>
                  <td className="p-2.5 text-kelly-slate">
                    <div>{metaString(meta, "county")}</div>
                    <div className="text-xs text-kelly-subtle">{team}</div>
                  </td>
                  <td className="p-2.5 text-kelly-slate">{statusDisplay(r.status)}</td>
                  <td className="p-2.5 whitespace-nowrap text-xs text-kelly-slate">{safeDate(r.createdAt)}</td>
                  <td className="p-2.5">
                    <Link
                      className="text-xs font-semibold text-kelly-navy underline"
                      href={`/election-plan/operators/volunteer-intake?intake=${r.id}`}
                    >
                      Open in activation board
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminVolunteerKickoffTriagePage() {
  return (
    <div className="min-w-0 p-4 md:p-6">
      <div className="mb-8 max-w-3xl">
        <Link href="/admin/workbench" className="text-sm font-semibold text-kelly-slate hover:underline">
          ← Campaign workbench
        </Link>
        <h1 className="mt-3 font-heading text-2xl font-bold text-kelly-text">
          Volunteer Leadership Kickoff — signups
        </h1>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">
          Live queue for kickoff form submissions (local leadership, campaign teams, Arkansas Youth Coalition, and
          match-me). Rows come from Kelly DB via <code className="text-xs">WorkflowIntake</code> (
          <code className="text-xs">source: volunteer_kickoff</code>). Use the activation board to place and follow up.
        </p>
        <p className="mt-3 font-body text-sm">
          <Link
            className="font-semibold text-kelly-navy underline"
            href="/election-plan/operators/volunteer-intake"
          >
            Full volunteer activation board →
          </Link>
        </p>
      </div>

      <Suspense fallback={<TriageLoading />}>
        <KickoffTriageTable />
      </Suspense>

      <div className="mt-10 max-w-3xl rounded-lg border border-kelly-forest/15 bg-kelly-fog/50 px-4 py-3 text-sm text-kelly-text/90">
        <p className="font-semibold text-kelly-navy/95">Related</p>
        <ul className="mt-2 list-inside list-disc space-y-1 pl-0.5 text-kelly-text/85">
          <li>
            Public kickoff meeting site:{" "}
            <a
              className="font-semibold text-kelly-navy underline"
              href="https://kelly-volunteer-kickoff.netlify.app"
              target="_blank"
              rel="noreferrer"
            >
              kelly-volunteer-kickoff.netlify.app
            </a>
          </li>
          <li>
            In-app kickoff:{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/volunteer-kickoff">
              /volunteer-kickoff
            </Link>
          </li>
          <li>
            Ask Kelly beta feedback:{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/admin/workbench/ask-kelly-beta">
              /admin/workbench/ask-kelly-beta
            </Link>
          </li>
          <li>
            Talent Foundry command center:{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/admin/talent-foundry">
              /admin/talent-foundry
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
