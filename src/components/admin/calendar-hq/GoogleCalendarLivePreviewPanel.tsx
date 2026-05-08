import Link from "next/link";
import type { GoogleCalendarLivePreviewResult } from "@/lib/calendar/google-calendar-read-preview";
import { calendarFiltersToSearchParams, type CalendarHqFilters } from "@/lib/calendar/hq-filters";

const card =
  "rounded-lg border border-sky-800/20 bg-gradient-to-br from-sky-50/90 via-white to-kelly-page/40 px-3 py-2.5 shadow-sm";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-sky-950/70";

type Props = {
  preview: GoogleCalendarLivePreviewResult;
  filters: CalendarHqFilters;
  weekKey: string;
  view: string;
  eventId: string | null;
  matrixQ?: string;
  monthYm: string;
};

function buildPreviewHref(p: Props, previewSrc: string | null): string {
  const qs = calendarFiltersToSearchParams(p.filters, {
    week: p.weekKey,
    view: p.view,
    event: p.eventId,
    q: p.matrixQ,
    month: p.view === "month" ? p.monthYm : undefined,
    previewSrc: previewSrc ?? undefined,
  });
  return `/admin/workbench/calendar?${qs}`;
}

function selectedPreviewSourceId(preview: GoogleCalendarLivePreviewResult): string | undefined {
  switch (preview.kind) {
    case "success":
    case "empty_upcoming":
    case "reauth_needed":
    case "api_error":
      return preview.selectedSourceId;
    default:
      return undefined;
  }
}

export function GoogleCalendarLivePreviewPanel(p: Props) {
  const { preview } = p;
  const href = (id: string | null) => buildPreviewHref(p, id);
  const activePreviewSrc = selectedPreviewSourceId(preview);

  return (
    <section className={`${card} mx-2 my-2 md:mx-3`} aria-labelledby="google-calendar-live-preview-heading">
      <h2 id="google-calendar-live-preview-heading" className={h2}>
        Google Calendar — live read-only preview
      </h2>
      <p className="mt-1 font-body text-[10px] leading-snug text-sky-950/90">
        <strong>Read-only Google preview.</strong> This does not create, update, delete, publish, sync, or automate calendar
        events. OAuth may include the broad Calendar scope; this panel only calls list APIs.
      </p>

      <div className="mt-2 rounded border border-kelly-text/10 bg-white/90 px-2 py-1.5">
        <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/50">Configuration (names only)</p>
        <ul className="mt-1 space-y-0.5 font-body text-[9px] text-kelly-navy">
          {preview.envRows.map((row) => (
            <li key={row.label} className="flex flex-wrap gap-1">
              <span className={row.ok ? "font-bold text-emerald-800" : "font-bold text-rose-800"}>{row.ok ? "OK" : "Missing"}</span>
              <span className="text-kelly-text/85">{row.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-2 rounded border border-kelly-text/10 bg-white/90 px-2 py-1.5">
        <p className="font-heading text-[9px] font-bold uppercase text-kelly-text/50">Calendar sources (database)</p>
        {preview.kind === "no_sources" ? (
          <p className="mt-1 font-body text-[10px] text-amber-950">No CalendarSource rows yet — add sources in your database seed or admin flows.</p>
        ) : (
          <ul className="mt-1 max-h-32 overflow-y-auto space-y-1 font-body text-[9px] text-kelly-navy">
            {"sources" in preview &&
              preview.sources.map((s) => (
                <li key={s.id} className="rounded border border-kelly-text/8 px-1 py-0.5">
                  <div className="flex flex-wrap items-center gap-1">
                    {s.hasOAuthRefreshToken ? (
                      <Link
                        href={href(s.id)}
                        className={`font-bold ${s.id === activePreviewSrc ? "text-sky-950" : "text-sky-700 underline"}`}
                      >
                        {s.displayName || s.label}
                      </Link>
                    ) : (
                      <span className="font-bold text-kelly-text/70">{s.displayName || s.label}</span>
                    )}
                    <span className="text-kelly-text/50">· {s.eventCount} events in DB</span>
                    {s.hasOAuthRefreshToken ? (
                      <span className="text-emerald-800">· OAuth</span>
                    ) : (
                      <span className="text-rose-800">· no refresh token</span>
                    )}
                  </div>
                  <div className="font-mono text-[8px] text-kelly-text/55">cal: {s.externalCalendarId}</div>
                </li>
              ))}
          </ul>
        )}
        {"sources" in preview && preview.sources.some((s) => s.hasOAuthRefreshToken) ? (
          <p className="mt-1 font-body text-[8px] text-kelly-text/60">Click a source with OAuth to preview that calendar.</p>
        ) : null}
      </div>

      <div className="mt-2 rounded border border-sky-900/15 bg-sky-950/[0.03] px-2 py-1.5">
        <p className="font-heading text-[9px] font-bold uppercase text-sky-950/60">Google live preview</p>
        <PreviewBody preview={preview} href={href} />
      </div>
    </section>
  );
}

function PreviewBody({
  preview,
  href,
}: {
  preview: GoogleCalendarLivePreviewResult;
  href: (id: string | null) => string;
}) {
  switch (preview.kind) {
    case "not_configured":
      return (
        <p className="mt-1 font-body text-[10px] text-amber-950">
          Google Calendar is <strong>not configured</strong> on this host. Set the OAuth client env vars above, redeploy, then
          connect a calendar source.
        </p>
      );
    case "no_sources":
      return (
        <p className="mt-1 font-body text-[10px] text-kelly-text/80">
          Env looks usable, but there are no sources to read. Add a <code className="text-[9px]">CalendarSource</code> first.
        </p>
      );
    case "no_token_source":
      return (
        <p className="mt-1 font-body text-[10px] text-amber-950">
          No source has a stored OAuth <strong>refresh token</strong>. Open your Google connect flow for a calendar source
          (callback <code className="text-[9px]">/api/calendar/google/callback</code>) until at least one row shows OAuth
          here.
        </p>
      );
    case "invalid_preview_source":
      return (
        <p className="mt-1 font-body text-[10px] text-rose-900">
          Unknown preview source <code className="text-[9px]">{preview.requestedId}</code> or it has no refresh token.{" "}
          <Link className="font-bold underline" href={href(null)}>
            Clear preview selection
          </Link>
        </p>
      );
    case "reauth_needed":
      return (
        <p className="mt-1 font-body text-[10px] text-rose-900">
          <strong>{preview.selectedLabel}</strong> — {preview.hint}{" "}
          <Link className="ml-1 font-bold underline" href={href(null)}>
            Use default source
          </Link>
        </p>
      );
    case "api_error":
      return (
        <p className="mt-1 font-body text-[10px] text-rose-900">
          <strong>{preview.selectedLabel}</strong> — {preview.hint}
        </p>
      );
    case "empty_upcoming":
      return (
        <div className="mt-1 space-y-2">
          <p className="font-body text-[10px] text-kelly-text/85">
            <strong>{preview.selectedLabel}</strong> — Google returned <strong>no upcoming events</strong> from now onward
            for calendar <code className="text-[9px]">{preview.externalCalendarId}</code>.
          </p>
          <CalendarListSnippet rows={preview.calendarListSample} />
        </div>
      );
    case "success":
      return (
        <div className="mt-1 space-y-2">
          <p className="font-body text-[9px] text-kelly-text/75">
            Showing next <strong>10</strong> upcoming from Google for <strong>{preview.selectedLabel}</strong> (
            <code className="text-[8px]">{preview.externalCalendarId}</code>).
          </p>
          <CalendarListSnippet rows={preview.calendarListSample} />
          <ul className="space-y-1 border-t border-kelly-text/10 pt-1 font-body text-[9px] text-kelly-navy">
            {preview.events.map((ev) => (
              <li key={ev.id ?? ev.startLabel} className="rounded border border-kelly-text/8 bg-white/80 px-1 py-0.5">
                <div className="font-semibold">{ev.summary}</div>
                <div className="text-kelly-text/70">
                  {ev.startLabel} → {ev.endLabel}
                </div>
                {ev.htmlLink ? (
                  <a
                    href={ev.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[8px] font-bold text-sky-800 underline"
                  >
                    Open in Google Calendar ↗
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      );
    default: {
      const _exhaustive: never = preview;
      return _exhaustive;
    }
  }
}

function CalendarListSnippet({ rows }: { rows: { id: string | null | undefined; summary: string | null | undefined }[] }) {
  if (rows.length === 0) return null;
  return (
    <div>
      <p className="font-heading text-[8px] font-bold uppercase text-kelly-text/45">Calendars visible to this account (sample)</p>
      <ul className="mt-0.5 max-h-20 overflow-y-auto font-mono text-[8px] text-kelly-text/75">
        {rows.map((c) => (
          <li key={c.id ?? c.summary ?? "?"}>
            {c.summary ?? "(untitled)"} <span className="text-kelly-text/45">· {c.id}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
