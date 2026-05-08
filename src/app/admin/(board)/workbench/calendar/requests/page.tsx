import Link from "next/link";
import { listCalendarRequestRows } from "@/lib/calendar/calendar-requests";
import { getCalendarRequestKindLabel } from "@/lib/calendar/calendar-intake-taxonomy";
import {
  archiveCalendarIntakeAction,
  createDraftCampaignEventFromIntakeAction,
  markCalendarIntakeInReviewAction,
  markCalendarIntakeNeedsFollowUpAction,
} from "@/app/admin/calendar-requests-actions";

export const dynamic = "force-dynamic";

type Tab = "all" | "new" | "followup" | "reviewed" | "drafted";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

function tabHref(t: Tab) {
  return t === "all" ? "/admin/workbench/calendar/requests" : `/admin/workbench/calendar/requests?tab=${t}`;
}

function filterByTab<T extends Awaited<ReturnType<typeof listCalendarRequestRows>>[number]>(rows: T[], tab: Tab): T[] {
  if (tab === "new") return rows.filter((r) => r.status === "PENDING");
  if (tab === "followup") return rows.filter((r) => r.status === "AWAITING_INFO");
  if (tab === "reviewed") return rows.filter((r) => r.status === "IN_REVIEW" || r.status === "READY_FOR_CALENDAR");
  if (tab === "drafted") return rows.filter((r) => r.status === "CONVERTED");
  return rows;
}

const TAB_IDS: Tab[] = ["all", "new", "followup", "reviewed", "drafted"];

export default async function CalendarRequestsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const notice = sp.notice;
  const error = sp.error;
  const rawTab = sp.tab ?? "all";
  const tab = (TAB_IDS.includes(rawTab as Tab) ? rawTab : "all") as Tab;
  const rows = await listCalendarRequestRows(100);
  const visible = filterByTab(rows, tab);

  const tabPill = (t: Tab, label: string) => {
    const active = tab === t;
    return (
      <Link
        href={tabHref(t)}
        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
          active ? "border-kelly-forest bg-emerald-50 text-kelly-navy" : "border-kelly-text/15 bg-white text-kelly-text/80"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-w-0 max-w-5xl space-y-3 px-2 py-3">
      <div className="flex flex-wrap items-center gap-2 text-[10px]">
        <Link className="rounded border border-kelly-text/15 bg-white px-2 py-0.5 font-semibold" href="/admin/workbench/calendar">
          ← Calendar HQ
        </Link>
        <Link className="rounded border border-kelly-navy/20 px-2 py-0.5" href="/admin/workbench/cockpit">
          Cockpit
        </Link>
      </div>
      <header>
        <h1 className="font-heading text-xl font-bold text-kelly-navy">Calendar requests</h1>
        <p className="mt-1 max-w-3xl font-body text-[11px] text-kelly-text/80">
          Event-like <code className="text-[9px]">WorkflowIntake</code> rows (host gatherings, analytics rows tied to an event id, etc.). Safe status moves and optional draft{" "}
          <code className="text-[9px]">CampaignEvent</code> creation — no Google Calendar write, no public publish, no comms send from this page.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {tabPill("all", "All event-like")}
          {tabPill("new", "New")}
          {tabPill("followup", "Needs follow-up")}
          {tabPill("reviewed", "Reviewed")}
          {tabPill("drafted", "Drafted")}
        </div>
      </header>

      {notice === "review" ? (
        <p className="rounded border border-emerald-200 bg-emerald-50/80 px-2 py-1 text-[11px] text-emerald-950">Marked in review.</p>
      ) : null}
      {notice === "followup" ? (
        <p className="rounded border border-emerald-200 bg-emerald-50/80 px-2 py-1 text-[11px] text-emerald-950">Marked needs follow-up.</p>
      ) : null}
      {notice === "archived" ? (
        <p className="rounded border border-emerald-200 bg-emerald-50/80 px-2 py-1 text-[11px] text-emerald-950">Archived.</p>
      ) : null}
      {error ? <p className="rounded border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] text-rose-950">{error}</p> : null}

      <ul className="space-y-2">
        {visible.map((r) => (
          <li key={r.intakeId} className="rounded-lg border border-kelly-text/12 bg-white/90 p-3 text-[11px] shadow-sm">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="rounded bg-kelly-fog px-1 text-[9px] font-bold uppercase text-kelly-slate">{r.status}</span>
              <span className="rounded bg-violet-50 px-1 text-[9px] font-bold text-violet-950">{getCalendarRequestKindLabel(r.kind)}</span>
              <span className="font-semibold text-kelly-navy">{r.title ?? "Request"}</span>
              <span className="text-[9px] text-kelly-text/50">{r.source}</span>
            </div>
            <p className="mt-0.5 text-[10px] text-kelly-text/65">
              {r.requesterName ?? "—"} · {r.requesterEmail ?? "—"} · {r.requesterPhone ?? "—"}
            </p>
            <p className="mt-0.5 text-[10px] text-kelly-text/70">
              Community: {r.structuredSummary.community ?? "—"} · type: {r.structuredSummary.gatheringType ?? "—"} · timing:{" "}
              {r.structuredSummary.preferredTiming ?? "—"}
            </p>
            <p className="mt-0.5 text-[9px] text-kelly-text/55">
              Created {r.createdAt.toISOString()} · county: {r.countyName ?? r.countyId ?? "—"}
            </p>
            {r.notesExcerpt ? (
              <p className="mt-1 line-clamp-4 whitespace-pre-wrap font-body text-[10px] text-kelly-text/80">{r.notesExcerpt}</p>
            ) : null}
            {r.linkedEventId ? (
              <p className="mt-1 text-[10px]">
                Linked event:{" "}
                <Link
                  href={`/admin/workbench/calendar?event=${encodeURIComponent(r.linkedEventId)}&view=week`}
                  className="font-bold text-kelly-forest underline"
                >
                  {r.linkedEventTitle ?? r.linkedEventId.slice(0, 8)}
                </Link>{" "}
                <span className="text-kelly-text/50">({r.linkedEventWorkflowState})</span>
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap gap-2">
              <form action={markCalendarIntakeInReviewAction}>
                <input type="hidden" name="intakeId" value={r.intakeId} />
                <button type="submit" className="rounded border border-kelly-navy/25 bg-white px-2 py-0.5 text-[10px] font-bold">
                  Mark reviewed
                </button>
              </form>
              <form action={markCalendarIntakeNeedsFollowUpAction}>
                <input type="hidden" name="intakeId" value={r.intakeId} />
                <button type="submit" className="rounded border border-amber-300/60 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-950">
                  Needs follow-up
                </button>
              </form>
              {!r.linkedEventId && r.status !== "ARCHIVED" && r.status !== "DECLINED" ? (
                <form action={createDraftCampaignEventFromIntakeAction}>
                  <input type="hidden" name="intakeId" value={r.intakeId} />
                  <button type="submit" className="rounded border border-emerald-500/50 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-950">
                    Create draft CampaignEvent
                  </button>
                </form>
              ) : null}
              {r.status !== "ARCHIVED" ? (
                <form action={archiveCalendarIntakeAction}>
                  <input type="hidden" name="intakeId" value={r.intakeId} />
                  <button type="submit" className="rounded border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-900">
                    Dismiss / archive
                  </button>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {visible.length === 0 ? (
        <p className="text-[11px] text-kelly-text/60">No matching event-like intakes for this filter.</p>
      ) : null}
    </div>
  );
}
