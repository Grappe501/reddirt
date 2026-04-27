import Link from "next/link";
import { EventReadinessStatus, EventWorkflowState, type CampaignEventVisibility, type CampaignEventType } from "@prisma/client";
import { listEventsForWeekByRibbon, type RibbonBucket } from "@/lib/calendar/hq-command-data";
import { DEFAULT_CAMPAIGN_TZ } from "@/lib/calendar/weekly-time";
import { addWeeks } from "@/lib/calendar/weekly-time";
import { calendarFiltersToSearchParams, type CalendarHqFilters } from "@/lib/calendar/hq-filters";
import { EVENT_STAGE_LABEL } from "@/lib/calendar/event-lifecycle";
import {
  submitEventForReviewAction,
  approveEventAction,
  sendEventBackToDraftAction,
  publishEventAction,
  cancelEventAction,
  completeEventAction,
} from "@/app/admin/calendar-hq-actions";

const RIBBON_LABEL: Record<RibbonBucket, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Needs review",
  APPROVED: "Approved",
  PUBLISHED: "Public",
  CANCELED: "Canceled",
  COMPLETED: "Completed",
};

const visLabel: Record<CampaignEventVisibility, string> = {
  INTERNAL: "Int",
  STAFF: "Staff",
  PUBLIC_STAFF: "Pub+stf",
};

function readyDot(s: EventReadinessStatus) {
  if (s === EventReadinessStatus.READY) return "✓";
  if (s === EventReadinessStatus.AT_RISK) return "⚠";
  if (s === EventReadinessStatus.IN_PROGRESS) return "…";
  if (s === EventReadinessStatus.NOT_STARTED) return "○";
  if (s === EventReadinessStatus.N_A) return "—";
  return "?";
}

type RibbonEvent = Awaited<ReturnType<typeof listEventsForWeekByRibbon>>[RibbonBucket][number];

function QuickActions({ e, column }: { e: RibbonEvent; column: RibbonBucket }) {
  const btn =
    "w-full rounded border border-kelly-text/15 py-0.5 text-[7px] font-bold leading-tight text-kelly-text/90 hover:border-kelly-navy/30";
  if (column === "DRAFT") {
    return (
      <form action={submitEventForReviewAction} className="mt-0.5 space-y-0.5">
        <input type="hidden" name="eventId" value={e.id} />
        <button type="submit" className={btn}>
          Submit
        </button>
      </form>
    );
  }
  if (column === "PENDING_APPROVAL") {
    return (
      <div className="mt-0.5 space-y-0.5">
        <form action={approveEventAction} className="contents">
          <input type="hidden" name="eventId" value={e.id} />
          <input type="hidden" name="approvalNote" value="" />
          <button type="submit" className={btn}>
            Approve
          </button>
        </form>
        <form action={sendEventBackToDraftAction} className="contents">
          <input type="hidden" name="eventId" value={e.id} />
          <input type="hidden" name="note" value="Sent back from board" />
          <button type="submit" className={btn}>
            To draft
          </button>
        </form>
      </div>
    );
  }
  if (column === "APPROVED") {
    return (
      <div className="mt-0.5 space-y-0.5">
        <form action={publishEventAction} className="contents">
          <input type="hidden" name="eventId" value={e.id} />
          <button type="submit" className={btn}>
            Publish
          </button>
        </form>
        <form action={completeEventAction} className="contents">
          <input type="hidden" name="eventId" value={e.id} />
          <button type="submit" className={btn}>
            Complete
          </button>
        </form>
        <form action={cancelEventAction} className="contents">
          <input type="hidden" name="eventId" value={e.id} />
          <input type="hidden" name="cancellationReason" value="Canceled from board (add detail in event panel if needed)" />
          <input type="hidden" name="note" value="Board quick cancel" />
          <button type="submit" className={btn}>
            Cancel
          </button>
        </form>
      </div>
    );
  }
  if (column === "PUBLISHED") {
    return (
      <div className="mt-0.5 space-y-0.5">
        <form action={completeEventAction} className="contents">
          <input type="hidden" name="eventId" value={e.id} />
          <button type="submit" className={btn}>
            Complete
          </button>
        </form>
        <form action={cancelEventAction} className="contents">
          <input type="hidden" name="eventId" value={e.id} />
          <input type="hidden" name="cancellationReason" value="Canceled from board (add detail in event panel if needed)" />
          <button type="submit" className={btn}>
            Cancel
          </button>
        </form>
      </div>
    );
  }
  return null;
}

function EventCard({ e, column, toWeekEvent }: { e: RibbonEvent; column: RibbonBucket; toWeekEvent: (eid: string) => string }) {
  const owner = e.ownerUser?.name || e.ownerUser?.email || "—";
  const onPublicSite = e.eventWorkflowState === EventWorkflowState.PUBLISHED && e.isPublicOnWebsite;
  const v = visLabel[e.visibility];
  return (
    <li className="rounded border border-kelly-text/8 bg-white/90 px-0.5 py-0.5 shadow-sm">
      <Link href={`/admin/workbench/calendar?${toWeekEvent(e.id)}`} className="block">
        <span className="line-clamp-2 text-[9px] font-semibold text-kelly-slate">{e.title}</span>
        <span className="mt-0.5 block text-[7px] font-mono text-kelly-text/40">{String(e.eventType as CampaignEventType).replaceAll("_", " ")}</span>
        <span className="mt-0.5 block text-[8px] text-kelly-text/55">
          {e.startAt.toLocaleString("en-US", {
            timeZone: DEFAULT_CAMPAIGN_TZ,
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}{" "}
          {e.county ? `· ${e.county.displayName}` : "· (no co.)"}
        </span>
        <span className="mt-0.5 block text-[7px] text-kelly-text/50">
          {v} · {onPublicSite ? "on site" : "not on site"} · {owner}
        </span>
        <span className="mt-0.5 block text-[7px] text-kelly-text/45" title="Comms / Staff / Prep / Follow-up">
          C{readyDot(e.commsReadiness)} S{readyDot(e.staffingReadiness)} P{readyDot(e.prepReadiness)} F{readyDot(e.followupReadiness)}
        </span>
      </Link>
      <QuickActions e={e} column={column} />
    </li>
  );
}

export async function CalendarApprovalBoard({
  weekKey,
  filters,
  matrixQ,
  eventId,
}: {
  weekKey: string;
  filters: CalendarHqFilters;
  matrixQ: string | undefined;
  eventId: string | null;
}) {
  const ribbon = await listEventsForWeekByRibbon(weekKey, filters);
  const q = (view: string, wk?: string) =>
    calendarFiltersToSearchParams(filters, { week: wk ?? weekKey, view, event: eventId, q: matrixQ });
  const toWeekEvent = (eid: string) =>
    calendarFiltersToSearchParams(filters, { week: weekKey, view: "week", event: eid, q: matrixQ });
  return (
    <div className="w-full min-w-0 max-w-[1920px] flex-1 flex-col p-1 md:p-2">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
        <p className="font-heading text-sm font-bold text-kelly-text">Approval & staging (week scoping)</p>
        <div className="flex gap-1 text-[10px]">
          <Link className="rounded border border-kelly-text/20 bg-white px-2 py-0.5 font-bold" href={`/admin/workbench/calendar?${q("ribbon", addWeeks(weekKey, -1))}`}>
            ← Week
          </Link>
          <Link className="rounded border border-kelly-text/20 bg-white px-2 py-0.5 font-bold" href={`/admin/workbench/calendar?${q("ribbon", addWeeks(weekKey, 1))}`}>
            Week →
          </Link>
          <Link className="rounded border border-kelly-text/15 bg-white px-2 py-0.5" href={`/admin/workbench/calendar?${q("week")}`}>
            ← Week plan
          </Link>
        </div>
      </div>
      <p className="mb-2 text-[9px] text-kelly-text/55">
        Governed stages ({Object.values(EVENT_STAGE_LABEL).join(" · ")}). {weekKey} — cards show county, type, owner, visibility, and readiness. Quick actions use defaults; add notes in the
        event panel.
      </p>
      <div className="grid max-h-[min(70vh,900px)] min-h-[200px] grid-cols-1 gap-1 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {(Object.keys(RIBBON_LABEL) as RibbonBucket[]).map((state) => (
          <div key={state} className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded border border-kelly-text/10 bg-kelly-page/40">
            <p className="shrink-0 border-b border-kelly-text/10 bg-kelly-text px-1.5 py-1 text-center text-[9px] font-bold text-kelly-page">
              {RIBBON_LABEL[state]}{" "}
              <span className="text-kelly-page/50">({ribbon[state].length})</span>
            </p>
            <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto p-0.5">
              {ribbon[state].map((e) => (
                <EventCard key={e.id} e={e} column={state} toWeekEvent={toWeekEvent} />
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[8px] text-kelly-text/40">Drag-and-drop not enabled — use actions or the event execution panel for notes.</p>
    </div>
  );
}

