import { notFound } from "next/navigation";
import { EventWorkflowState } from "@prisma/client";
import { getEventBySlug } from "@/content/events";
import { EventFieldEditor } from "@/components/scheduler/EventFieldEditor";
import { PUBLIC_CALENDAR_DEFAULT_TZ } from "@/lib/calendar/public-event-types";
import { ymdInTimeZone } from "@/lib/calendar/public-event-format";
import { countyNameFromAnySlug } from "@/lib/events/county-key";
import { loadSchedulerEvent } from "@/lib/scheduler/load-queue";
import { cardFromRow } from "@/lib/scheduler/public-card-fields";

function clockInZone(at: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(at);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "12";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}

function countySelectValue(displayName: string | null | undefined, countySlug?: string): string {
  const fromName = (displayName ?? "").replace(/\s+County$/i, "").trim();
  if (fromName) return fromName;
  return countyNameFromAnySlug(countySlug ?? "")?.replace(/\s+County$/i, "") ?? "";
}

export default async function SchedulerEventEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    saved?: string;
    published?: string;
    unpublished?: string;
    archived?: string;
    graphic?: string;
    error?: string;
  }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const row = await loadSchedulerEvent(id);
  if (!row) notFound();
  const curated = getEventBySlug(row.slug);
  const card = cardFromRow({
    ...row,
    publicFieldAttendance: row.publicFieldAttendance || curated?.fieldAttendance || null,
  });
  const isArchived = Boolean(row.schedulerArchivedAt);
  const isLive =
    row.isPublicOnWebsite && row.eventWorkflowState === EventWorkflowState.PUBLISHED && !isArchived;
  const tz = row.timezone || PUBLIC_CALENDAR_DEFAULT_TZ;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-kelly-text">
          {isArchived ? "Archived event" : "Edit public card"}
        </h1>
        <p className="mt-1 font-body text-sm text-kelly-text/70">
          {ymdInTimeZone(row.startAt, tz)} · /events/{row.slug}
        </p>
        <p className="mt-2 max-w-2xl font-body text-sm text-kelly-text/70">
          These boxes are the public /events card. Publish puts it on the site. Unpublish takes it off. Archive keeps a reason in the record.
        </p>
      </div>
      {sp.saved ? <p className="font-body text-sm text-kelly-navy">Draft saved.</p> : null}
      {sp.published ? <p className="font-body text-sm text-kelly-navy">Published to the public events page.</p> : null}
      {sp.unpublished ? <p className="font-body text-sm text-kelly-navy">Removed from the public events page.</p> : null}
      {sp.archived ? (
        <p className="font-body text-sm text-kelly-navy">Archived. It is off the public calendar and kept in the record.</p>
      ) : null}
      {sp.error === "title" ? <p className="font-body text-sm text-red-700">Title is required.</p> : null}
      {sp.error === "archive_reason" ? (
        <p className="font-body text-sm text-red-700">A reason of at least 8 characters is required to archive.</p>
      ) : null}
      {sp.graphic === "1" ? <p className="font-body text-sm text-kelly-navy">Social graphic saved.</p> : null}
      {sp.graphic === "0" ? <p className="font-body text-sm text-kelly-navy">Social graphic removed.</p> : null}
      {sp.error === "graphic_type" ? (
        <p className="font-body text-sm text-red-700">Use a JPG, PNG, or WebP image.</p>
      ) : null}
      {sp.error === "graphic_size" ? (
        <p className="font-body text-sm text-red-700">Keep the graphic under 3 MB.</p>
      ) : null}
      {sp.error === "graphic_storage" ? (
        <p className="font-body text-sm text-red-700">Upload storage is not available. Paste a public image URL instead.</p>
      ) : null}
      {sp.error === "graphic_empty" ? (
        <p className="font-body text-sm text-red-700">Choose a file or paste a public image URL.</p>
      ) : null}
      <EventFieldEditor
        id={row.id}
        title={row.title}
        locationName={row.locationName || curated?.locationLabel || null}
        address={row.address || curated?.addressLine || null}
        city={row.city || curated?.city || null}
        countyName={countySelectValue(row.county?.displayName, curated?.countySlug)}
        publicContact={row.publicContact || curated?.publicContact || null}
        socialGraphicUrl={row.publicSocialGraphicUrl || curated?.flyerSrc || null}
        publicSummary={row.publicSummary || curated?.summary || null}
        dateYmd={ymdInTimeZone(row.startAt, tz)}
        startTime={clockInZone(row.startAt, tz)}
        endTime={clockInZone(row.endAt, tz)}
        card={card}
        isLive={isLive}
        isArchived={isArchived}
        publishedBy={row.schedulerPublishedBy}
        publishedAt={row.schedulerPublishedAt}
        archivedBy={row.schedulerArchivedBy}
        archivedAt={row.schedulerArchivedAt}
        archiveReason={row.schedulerArchiveReason}
        archivePlace={row.schedulerArchivePlace}
      />
    </section>
  );
}
