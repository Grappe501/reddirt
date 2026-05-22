import Link from "next/link";
import { loadGoogleCalendarLivePreview } from "@/lib/calendar/google-calendar-read-preview";
import { getCalendarSources } from "@/lib/calendar/hq-data";
import { getCachedCalendarReadinessLite, getCachedCalendarRequestPipelineCounts } from "@/lib/workbench/operator-readiness-cache";

const box = "rounded-lg border border-kelly-text/10 bg-white/85 px-2 py-2 text-[10px] text-kelly-text/85";

export async function CalendarHqReadinessPanel() {
  const [lite, pipe, sources] = await Promise.all([
    getCachedCalendarReadinessLite(),
    getCachedCalendarRequestPipelineCounts(),
    getCalendarSources().catch(() => []),
  ]);
  const preview = await loadGoogleCalendarLivePreview({
    sources,
    previewSourceId: (sources[0] as { id?: string } | undefined)?.id ?? null,
  });

  const previewLine =
    preview.kind === "success"
      ? `${preview.events.length} upcoming row(s) in preview`
      : preview.kind === "api_error"
        ? `API issue — ${preview.hint}`
        : preview.kind === "reauth_needed"
          ? `Reauth — ${preview.hint}`
          : preview.kind;

  const writePolicyLabel =
    lite.googleWritePolicy === "disabled"
      ? "disabled (writes require explicit operator approval elsewhere)"
      : lite.googleWritePolicy === "enabledButRequiresApproval"
        ? "ingest flag on — external writes remain gated"
        : "unavailable (OAuth/config incomplete)";

  return (
    <section className="border-b border-kelly-text/10 bg-kelly-fog/30 px-2 py-2 md:px-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-[9px] font-bold uppercase tracking-wider text-kelly-subtle">Calendar readiness</h2>
        <Link href="/admin/workbench/calendar/requests" className="text-[10px] font-bold text-kelly-forest underline">
          Open requests ({pipe.newCount} new · {pipe.followUpCount} follow-up · {pipe.draftedCount} converted)
        </Link>
      </div>
      <div className="mt-2 grid gap-2 md:grid-cols-2">
        <div className={box}>
          <p className="font-bold text-kelly-navy">Internal data</p>
          <ul className="mt-1 list-inside list-disc">
            <li>CampaignEvent rows: {lite.campaignEventTotal}</li>
            <li>Upcoming internal (14d): {lite.upcomingInternalEvents}</li>
            <li>Draft / pending workflow: {lite.draftEventCount}</li>
          </ul>
        </div>
        <div className={box}>
          <p className="font-bold text-kelly-navy">Request pipeline</p>
          <ul className="mt-1 list-inside list-disc">
            <li>New event-like: {lite.newRequestCount}</li>
            <li>Needs follow-up: {lite.needsFollowUpCount}</li>
            <li>In review: {lite.intakeInReviewCount}</li>
            <li>Ready for calendar: {lite.intakeReadyForCalendarCount}</li>
            <li>Converted: {lite.convertedCount}</li>
            {pipe.allEventLikeCount > 0 ? <li>All in scan: {pipe.allEventLikeCount}</li> : null}
          </ul>
          {lite.intakeCountNote ? <p className="mt-1 text-[9px] text-kelly-muted">{lite.intakeCountNote}</p> : null}
        </div>
        <div className={box}>
          <p className="font-bold text-kelly-navy">Google Calendar</p>
          <ul className="mt-1 list-inside list-disc">
            <li>OAuth/config: {lite.googleCalendarReadiness ? "looks present" : "incomplete"}</li>
            <li>Preview load: {previewLine}</li>
          </ul>
        </div>
        <div className={box}>
          <p className="font-bold text-kelly-navy">Publish / write policy</p>
          <p className="mt-1">
            <code className="text-[9px]">GOOGLE_CALENDAR_AUTO_PUBLISH_PUBLIC_FACING</code>:{" "}
            {lite.googleAutoPublishPublicFacingEnabled ? "enabled" : "off"} — {writePolicyLabel}
          </p>
          <p className="mt-1 text-[9px] text-kelly-muted">No one-click Google write is exposed here.</p>
        </div>
      </div>
      <p className="mt-2 text-[9px] text-kelly-muted">
        Next:{" "}
        {pipe.newCount > 0 ? (
          <Link href="/admin/workbench/calendar/requests" className="font-semibold text-kelly-forest underline">
            review new requests
          </Link>
        ) : lite.googleCalendarReadiness === false ? (
          <span>finish Google OAuth env, then retry preview.</span>
        ) : (
          <span>draft or adjust internal events in Calendar HQ.</span>
        )}
      </p>
    </section>
  );
}
