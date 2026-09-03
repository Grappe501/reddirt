import { notFound } from "next/navigation";
import { EventWorkflowState } from "@prisma/client";
import { EventFieldEditor } from "@/components/scheduler/EventFieldEditor";
import { loadSchedulerEvent } from "@/lib/scheduler/load-queue";
import { cardFromRow } from "@/lib/scheduler/public-card-fields";

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
    error?: string;
  }>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const row = await loadSchedulerEvent(id);
  if (!row) notFound();
  const card = cardFromRow(row);
  const isArchived = Boolean(row.schedulerArchivedAt);
  const isLive =
    row.isPublicOnWebsite && row.eventWorkflowState === EventWorkflowState.PUBLISHED && !isArchived;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-kelly-text">
          {isArchived ? "Archived event" : "Edit public card"}
        </h1>
        <p className="mt-1 font-body text-sm text-kelly-text/70">
          {row.startAt.toISOString().slice(0, 10)} · /events/{row.slug}
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
      <EventFieldEditor
        id={row.id}
        title={row.title}
        locationName={row.locationName}
        publicSummary={row.publicSummary}
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
