"use client";

import { useMemo, useState } from "react";
import type { PersistedMarchEventRow } from "@/lib/campaign-events/merge-persisted-row";
import type { FactCardSection, FactField } from "@/lib/campaign-events/types";
import type { EditableFactSectionId } from "@/lib/campaign-events/constants";
import { EDITABLE_FACT_SECTIONS } from "@/lib/campaign-events/constants";
import { formatInTimeZone } from "date-fns-tz";
import { FactSectionEditor } from "./FactSectionEditor";
import { EventReviewModal } from "./EventReviewModal";

const TZ = "America/Chicago";

function formatCompactTime(iso: string, allDay: boolean): string {
  if (allDay) return "All day";
  return formatInTimeZone(new Date(iso), TZ, "h:mm a");
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "navy" | "amber" | "green" | "red" }) {
  const cls =
    tone === "navy"
      ? "border-kelly-navy/25 bg-kelly-navy/[0.08] text-kelly-navy"
      : tone === "amber"
        ? "border-amber-600/30 bg-amber-50 text-amber-950"
        : tone === "green"
          ? "border-emerald-700/25 bg-emerald-50 text-emerald-900"
          : tone === "red"
            ? "border-red-800/25 bg-red-50 text-red-900"
            : "border-kelly-text/10 bg-kelly-wash text-kelly-muted";
  return (
    <span className={`rounded-full border px-2.5 py-1 font-body text-xs font-semibold ${cls}`}>{children}</span>
  );
}

function FactSectionView({
  section,
  recordId,
  factCard,
  editingSection,
  setEditingSection,
}: {
  section: FactCardSection;
  recordId: string;
  factCard: PersistedMarchEventRow["factCard"];
  editingSection: EditableFactSectionId | null;
  setEditingSection: (id: EditableFactSectionId | null) => void;
}) {
  const [open, setOpen] = useState(!section.defaultCollapsed);
  const editable = EDITABLE_FACT_SECTIONS.includes(section.id as EditableFactSectionId);
  const sectionId = section.id as EditableFactSectionId;
  const isEditing = editable && editingSection === sectionId;
  const missing = section.fields.filter((f) => f.status === "missing").length;

  return (
    <section
      className={
        section.emphasis === "house_meet_greet"
          ? "rounded-2xl border border-kelly-gold/30 bg-kelly-gold/[0.06]"
          : "rounded-2xl border border-kelly-text/10 bg-kelly-page"
      }
    >
      <div className="flex items-start justify-between gap-2 px-4 py-3">
        <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
          <h4 className="font-heading text-base font-bold text-kelly-text">{section.title}</h4>
          <p className="mt-1 font-body text-xs text-kelly-muted">{section.helper}</p>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <button type="button" className="font-body text-xs font-bold text-kelly-navy" onClick={() => setOpen((v) => !v)}>
            {open ? "Hide" : "Show"}
          </button>
          {editable && open && !isEditing ? (
            <button
              type="button"
              className="font-body text-xs font-bold text-kelly-slate underline underline-offset-2"
              onClick={() => setEditingSection(sectionId)}
            >
              Edit
            </button>
          ) : null}
        </div>
      </div>
      {open ? (
        <div className="border-t border-kelly-text/10 px-4 pb-4">
          {missing > 0 && !isEditing ? (
            <p className="mb-2 mt-2 font-body text-xs text-kelly-muted">
              {missing} friendly next action{missing === 1 ? "" : "s"}
            </p>
          ) : null}
          {isEditing ? (
            <FactSectionEditor
              recordId={recordId}
              sectionId={sectionId}
              factCard={factCard}
              onCancel={() => setEditingSection(null)}
              onSaved={() => setEditingSection(null)}
            />
          ) : (
            <>
              {section.fields.length ? (
                <dl>
                  {section.fields.map((f) => (
                    <FieldRow key={f.key} field={f} />
                  ))}
                </dl>
              ) : null}
              {section.placeholderRows?.map((row) => (
                <p key={row.label} className="mt-2 rounded-lg border border-dashed border-kelly-text/15 px-3 py-2 text-sm text-kelly-muted">
                  <strong>{row.label}</strong> — {row.hint}
                </p>
              ))}
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}

function FieldRow({ field }: { field: FactField }) {
  return (
    <div className="grid gap-1 border-t border-kelly-text/5 py-2 sm:grid-cols-[minmax(8rem,11rem)_1fr] sm:gap-3">
      <dt className="font-body text-xs font-semibold text-kelly-muted">{field.label}</dt>
      <dd className="font-body text-sm text-kelly-text/85">
        {field.status === "missing" ? (
          <span className="italic text-kelly-subtle">Not captured yet</span>
        ) : (
          field.value
        )}
      </dd>
    </div>
  );
}

export function CampaignEventCard({ row }: { row: PersistedMarchEventRow }) {
  const [expanded, setExpanded] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<EditableFactSectionId | null>(null);
  const item = row.calendar;
  const timeLabel = useMemo(
    () => `${formatCompactTime(item.start, item.allDay)}${item.end && !item.allDay ? ` – ${formatCompactTime(item.end, false)}` : ""}`,
    [item.start, item.end, item.allDay],
  );

  const milesLabel =
    row.factCard.travel.roundTripMiles != null ? `${row.factCard.travel.roundTripMiles.toFixed(1)} mi` : null;

  return (
    <article className="rounded-2xl border border-kelly-text/10 bg-kelly-page shadow-[var(--shadow-soft)]">
      <div className="flex gap-3 px-4 py-3">
        <div className="min-w-0 flex-1 font-body text-sm leading-snug text-kelly-text/85">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-semibold text-kelly-text">{row.dateYmd}</span>
            <span className="text-kelly-muted">{timeLabel}</span>
            <span className="font-heading font-bold text-kelly-text">{item.title}</span>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
            <span>{row.likelyCity ?? "City TBD"}</span>
            <span className="text-kelly-text/30">·</span>
            <span>{row.classificationLabel}</span>
            <span className="text-kelly-text/30">·</span>
            <Badge tone="navy">{row.eventStatus}</Badge>
            {row.decisionLabel ? (
              <Badge tone={row.decisionLabel === "Denied" || row.decisionLabel === "Personal" ? "red" : row.decisionLabel === "Hold" || row.decisionLabel === "Request info" ? "amber" : "green"}>
                {row.decisionLabel}
              </Badge>
            ) : null}
            {row.requestInfoStatus === "draft_ready" ? <Badge tone="amber">Email draft saved</Badge> : null}
            {row.workHours.show ? <Badge tone="amber">{row.workHours.badge}</Badge> : null}
            {row.conflicts.map((c) => (
              <Badge key={c.category + c.label} tone="red">
                {c.label}
              </Badge>
            ))}
            <span className="text-kelly-text/30">·</span>
            <span>{row.travelLine}</span>
            {milesLabel ? (
              <>
                <span className="text-kelly-text/30">·</span>
                <span>{milesLabel}</span>
              </>
            ) : null}
            {row.reimbursementDisplay ? (
              <>
                <span className="text-kelly-text/30">·</span>
                <span>{row.reimbursementDisplay}</span>
              </>
            ) : null}
            <span className="text-kelly-text/30">·</span>
            <span>{row.persistedMissingCount} gaps</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            type="button"
            className="rounded-full bg-kelly-navy px-3 py-1.5 font-body text-xs font-bold text-white"
            onClick={() => setReviewOpen(true)}
          >
            Review with AI
          </button>
          <button type="button" className="font-body text-xs font-bold text-kelly-navy" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Collapse" : "Fact card"}
          </button>
        </div>
      </div>

      {reviewOpen ? <EventReviewModal recordId={row.recordId} onClose={() => setReviewOpen(false)} /> : null}

      {expanded ? (
        <div className="space-y-3 border-t border-kelly-text/10 px-4 pb-5 pt-3">
          <p className="font-body text-xs text-kelly-subtle">
            Record {row.recordId.slice(0, 8)}… · Calendar {row.sourceCalendarId}
          </p>
          <div className="grid gap-3">
            {row.sections.map((section) => (
              <FactSectionView
                key={`${row.recordId}-${section.id}`}
                section={section}
                recordId={row.recordId}
                factCard={row.factCard}
                editingSection={editingSection}
                setEditingSection={setEditingSection}
              />
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
