import { GoogleEventSyncState } from "@prisma/client";
import {
  pushEventToGoogleAction,
  pullEventFromGoogleAction,
  clearEventGoogleErrorAction,
} from "@/app/admin/calendar-hq-actions";
import { isGoogleCalendarConfigured } from "@/lib/calendar/env";
import type { CalendarHqEventDetail } from "@/lib/calendar/hq-data";

const h2 = "font-heading text-[9px] font-bold uppercase tracking-wider text-deep-soil/50";

export function GoogleCalendarSyncBlock({ detail }: { detail: CalendarHqEventDetail }) {
  const src = detail.calendarSource;
  const conf = isGoogleCalendarConfigured();
  return (
    <div>
      <p className={h2}>Google Calendar (Slice 5)</p>
      <p className="mt-0.5 text-[8px] text-deep-soil/70">
        CampaignOS is source of truth; Google mirrors. Stage + public gating select the rail.
      </p>
      <dl className="mt-1 space-y-0.5 text-[8px] text-deep-soil/85">
        <div>
          <dt className="inline text-deep-soil/45">Source: </dt>
          <dd className="inline">
            {src
              ? `${src.displayName || src.label} · ${src.sourceType}${src.isPublicFacing ? " · public rail" : ""}`
              : "— (not yet pushed)"}
          </dd>
        </div>
        <div>
          <dt className="inline text-deep-soil/45">State: </dt>
          <dd className="inline">{String(detail.googleSyncState)}</dd>
        </div>
        <div>
          <dt className="inline text-deep-soil/45">Last sync: </dt>
          <dd className="inline">{detail.lastGoogleSyncAt ? detail.lastGoogleSyncAt.toLocaleString() : "—"}</dd>
        </div>
        {detail.googleSyncError ? (
          <div className="rounded border border-rose-800/30 bg-rose-50/80 px-1 py-0.5 text-[8px] text-rose-950">
            {detail.googleSyncError}
          </div>
        ) : null}
        {detail.syncReviewNeeded ? (
          <p className="text-[8px] font-bold text-amber-950">Sync review: external change may need staff confirmation.</p>
        ) : null}
        {detail.inboundTimeChangedAt ? (
          <p className="text-[8px] text-amber-900/90">Timing last changed externally: {detail.inboundTimeChangedAt.toLocaleString()}</p>
        ) : null}
      </dl>
      <ul className="mt-0.5 max-h-20 list-inside list-disc overflow-y-auto text-[7px] text-deep-soil/55">
        {(detail.syncLogs ?? []).slice(0, 6).map((l) => (
          <li key={l.id}>
            {l.createdAt.toLocaleString()} {l.direction} {l.status} — {l.message}
          </li>
        ))}
      </ul>
      {conf ? (
        <div className="mt-1 space-y-0.5">
          <form action={pushEventToGoogleAction} className="inline w-full">
            <input type="hidden" name="eventId" value={detail.id} />
            <button
              type="submit"
              className="w-full rounded border border-washed-denim/40 bg-cream-canvas py-0.5 text-[8px] font-bold text-civic-slate"
            >
              Push to Google
            </button>
          </form>
          {detail.googleEventId ? (
            <form action={pullEventFromGoogleAction} className="w-full">
              <input type="hidden" name="eventId" value={detail.id} />
              <button
                type="submit"
                className="w-full rounded border border-deep-soil/20 py-0.5 text-[8px] font-semibold text-deep-soil/85"
              >
                Pull from Google
              </button>
            </form>
          ) : null}
          {detail.googleSyncError || detail.googleSyncState === GoogleEventSyncState.ERROR ? (
            <form action={clearEventGoogleErrorAction}>
              <input type="hidden" name="eventId" value={detail.id} />
              <button type="submit" className="w-full text-[7px] text-deep-soil/50 underline">
                Clear local error
              </button>
            </form>
          ) : null}
        </div>
      ) : (
        <p className="mt-0.5 text-[7px] text-deep-soil/45">Set GOOGLE_CALENDAR_CLIENT_ID/SECRET in .env to enable push.</p>
      )}
    </div>
  );
}

