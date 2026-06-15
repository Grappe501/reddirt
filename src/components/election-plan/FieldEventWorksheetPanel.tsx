"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import type { ExecutiveCalendarEntry } from "@/lib/election-plan/field-event-worksheet-storage";
import {
  activationScheduledDate,
  buildOperationalTasks,
  getWorksheet,
  saveWorksheet,
  scaffoldWorksheet,
} from "@/lib/election-plan/field-event-worksheet-storage";
import type { FieldActivationKey, FieldEventWorksheet } from "@/lib/election-plan/field-event-worksheet-types";
import {
  ACTIVATION_LABELS,
  ACTIVATION_LEAD_DAYS,
} from "@/lib/election-plan/field-event-worksheet-types";
import {
  fieldCalendarHref,
  fieldOperationalCalendarHref,
} from "@/lib/election-plan/field-calendar-links";
import { countyPlaybookHref } from "@/lib/election-plan/location-links";
import { cn } from "@/lib/utils";

type ForwardMotionStop = {
  eventName: string;
  mobilizeStatus: string;
  facebookStatus: string;
  newsReleaseStatus: string;
  nextAction: string;
};

type Props = {
  entry: ExecutiveCalendarEntry;
  sourceOverrides?: Partial<FieldEventWorksheet>;
  forwardMotion?: ForwardMotionStop;
};

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      {label ? <span className="text-sm font-semibold text-[var(--ep-navy)]">{label}</span> : null}
      {hint ? <span className="mt-0.5 block text-xs text-[var(--ep-navy-muted)]">{hint}</span> : null}
      <textarea
        className="mt-2 w-full rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-sm leading-relaxed"
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function FieldEventWorksheetPanel({ entry, sourceOverrides, forwardMotion }: Props) {
  const [worksheet, setWorksheet] = useState<FieldEventWorksheet>(() =>
    scaffoldWorksheet(entry, { ...getWorksheet(entry.id, entry), ...sourceOverrides }),
  );
  const [saved, setSaved] = useState(false);

  const persist = useCallback(
    (next: FieldEventWorksheet) => {
      setWorksheet(next);
      saveWorksheet(entry.id, next);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    },
    [entry.id],
  );

  const operationalTasks = useMemo(() => buildOperationalTasks(entry, worksheet), [entry, worksheet]);

  const countySlug = entry.county.toLowerCase().replace(/\s+/g, "-");

  return (
    <section>
      <Link href={fieldCalendarHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Field calendar
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[var(--ep-gold)]">
            {entry.startDate}
            {entry.endDate && entry.endDate !== entry.startDate ? ` → ${entry.endDate}` : ""}
            {" · "}
            {entry.category.replace(/_/g, " ")}
          </p>
          <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{entry.label}</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            {entry.city ? `${entry.city} · ` : ""}
            {entry.county} County · {entry.status}
          </p>
        </div>
        {saved ? (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">Saved</span>
        ) : null}
      </div>

      <div className="my-4 flex flex-wrap gap-3 text-sm">
        <Link href={countyPlaybookHref(entry.county, countySlug)} className="ep-chapter-link">
          County playbook →
        </Link>
        <Link href={fieldOperationalCalendarHref()} className="ep-chapter-link">
          Day-to-day operational calendar →
        </Link>
      </div>

      {forwardMotion ? (
        <div className="ep-card-glass mb-6 text-sm">
          <p className="font-semibold text-[var(--ep-navy)]">Forward motion status</p>
          <p className="mt-1 text-[var(--ep-navy-muted)]">{forwardMotion.nextAction}</p>
          <p className="mt-2 text-xs">
            Mobilize: {forwardMotion.mobilizeStatus} · Facebook: {forwardMotion.facebookStatus} · Release:{" "}
            {forwardMotion.newsReleaseStatus}
          </p>
        </div>
      ) : null}

      <div className="space-y-8">
        <div className="ep-card ep-priority-card border-l-4 border-[var(--ep-gold)]">
          <h2 className="font-heading text-lg font-bold">What we are trying to accomplish</h2>
          <TextArea
            label=""
            value={worksheet.accomplishment}
            onChange={(accomplishment) => persist({ ...worksheet, accomplishment })}
            rows={5}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="ep-card">
            <h2 className="font-heading text-lg font-bold">Messaging</h2>
            <TextArea
              label=""
              value={worksheet.messaging}
              onChange={(messaging) => persist({ ...worksheet, messaging })}
              rows={5}
            />
          </div>
          <div className="ep-card">
            <h2 className="font-heading text-lg font-bold">Volunteers</h2>
            <TextArea
              label=""
              value={worksheet.volunteers}
              onChange={(volunteers) => persist({ ...worksheet, volunteers })}
              rows={5}
              hint="Shifts, captains, recruitment status"
            />
          </div>
        </div>

        <div className="ep-card">
          <h2 className="font-heading text-lg font-bold">Local contact</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-semibold">Name</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--ep-border)] px-3 py-2 text-sm"
                value={worksheet.localContact}
                onChange={(e) => persist({ ...worksheet, localContact: e.target.value })}
              />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Role / organization</span>
              <input
                className="mt-1 w-full rounded-md border border-[var(--ep-border)] px-3 py-2 text-sm"
                value={worksheet.localContactRole}
                onChange={(e) => persist({ ...worksheet, localContactRole: e.target.value })}
              />
            </label>
          </div>
        </div>

        <div className="ep-card">
          <h2 className="font-heading text-lg font-bold">Run of day</h2>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Full timeline for the event — travel through debrief</p>
          <TextArea
            label=""
            value={worksheet.runOfDay}
            onChange={(runOfDay) => persist({ ...worksheet, runOfDay })}
            rows={10}
          />
        </div>

        <div className="ep-card">
          <h2 className="font-heading text-lg font-bold">Logistics</h2>
          <div className="mt-4 space-y-4">
            <TextArea
              label="Travel"
              value={worksheet.logisticsTravel}
              onChange={(logisticsTravel) => persist({ ...worksheet, logisticsTravel })}
              rows={2}
            />
            <TextArea
              label="Venue"
              value={worksheet.logisticsVenue}
              onChange={(logisticsVenue) => persist({ ...worksheet, logisticsVenue })}
              rows={2}
            />
            <TextArea
              label="Materials"
              value={worksheet.logisticsMaterials}
              onChange={(logisticsMaterials) => persist({ ...worksheet, logisticsMaterials })}
              rows={2}
            />
            <TextArea
              label="Other logistics"
              value={worksheet.logisticsNotes}
              onChange={(logisticsNotes) => persist({ ...worksheet, logisticsNotes })}
              rows={3}
            />
          </div>
        </div>

        <div className="ep-card">
          <h2 className="font-heading text-lg font-bold">Tasks leading up</h2>
          <ul className="mt-4 space-y-3">
            {worksheet.prepTasks.map((task) => (
              <li key={task.id} className="flex flex-wrap items-start gap-3 rounded-lg border border-[var(--ep-border)] p-3">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={(e) => {
                    const prepTasks = worksheet.prepTasks.map((t) =>
                      t.id === task.id ? { ...t, done: e.target.checked } : t,
                    );
                    persist({ ...worksheet, prepTasks });
                  }}
                  className="mt-1"
                />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium", task.done && "text-[var(--ep-navy-muted)] line-through")}>
                    {task.label}
                  </p>
                  <label className="mt-2 block text-xs text-[var(--ep-navy-muted)]">
                    Due date (adds to operational calendar)
                    <input
                      type="date"
                      className="mt-1 block rounded border border-[var(--ep-border)] px-2 py-1 text-sm"
                      value={task.dueDate ?? ""}
                      onChange={(e) => {
                        const prepTasks = worksheet.prepTasks.map((t) =>
                          t.id === task.id ? { ...t, dueDate: e.target.value || undefined } : t,
                        );
                        persist({ ...worksheet, prepTasks });
                      }}
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="ep-card">
          <h2 className="font-heading text-lg font-bold">Field activations — opt in</h2>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            When enabled, corresponding actions appear on the{" "}
            <Link href={fieldOperationalCalendarHref()} className="font-semibold text-[var(--ep-gold)] hover:underline">
              day-to-day operational calendar
            </Link>
            .
          </p>
          <div className="mt-4 space-y-4">
            {(Object.keys(worksheet.activations) as FieldActivationKey[]).map((key) => {
              const opt = worksheet.activations[key];
              const scheduled = activationScheduledDate(entry.startDate, key, opt);
              return (
                <div key={key} className="rounded-lg border border-[var(--ep-border)] p-4">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={opt.enabled}
                      onChange={(e) => {
                        const activations = {
                          ...worksheet.activations,
                          [key]: { ...opt, enabled: e.target.checked },
                        };
                        persist({ ...worksheet, activations });
                      }}
                    />
                    <span className="font-semibold text-[var(--ep-navy)]">{ACTIVATION_LABELS[key]}</span>
                    <span className="text-xs text-[var(--ep-navy-muted)]">
                      default {ACTIVATION_LEAD_DAYS[key]} days before event
                    </span>
                  </label>
                  {opt.enabled ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="block text-xs">
                        Scheduled date
                        <input
                          type="date"
                          className="mt-1 block w-full rounded border border-[var(--ep-border)] px-2 py-1 text-sm"
                          value={opt.scheduledDate ?? scheduled}
                          onChange={(e) => {
                            const activations = {
                              ...worksheet.activations,
                              [key]: { ...opt, scheduledDate: e.target.value },
                            };
                            persist({ ...worksheet, activations });
                          }}
                        />
                      </label>
                      <label className="block text-xs sm:col-span-2">
                        Notes
                        <textarea
                          className="mt-1 w-full rounded border border-[var(--ep-border)] px-2 py-1 text-sm"
                          rows={2}
                          value={opt.notes}
                          onChange={(e) => {
                            const activations = {
                              ...worksheet.activations,
                              [key]: { ...opt, notes: e.target.value },
                            };
                            persist({ ...worksheet, activations });
                          }}
                        />
                      </label>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="ep-card">
          <h2 className="font-heading text-lg font-bold">Field notes</h2>
          <TextArea
            label=""
            value={worksheet.fieldNotes}
            onChange={(fieldNotes) => persist({ ...worksheet, fieldNotes })}
            rows={4}
            hint="Intelligence from the field — saves automatically to this browser"
          />
        </div>

        <div className="ep-card">
          <h2 className="font-heading text-lg font-bold">Operational calendar preview</h2>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Generated from opt-ins and prep task due dates</p>
          {operationalTasks.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">No operational tasks yet — opt in to activations above.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {operationalTasks.map((t) => (
                <li key={t.id} className="flex justify-between gap-2 border-b border-[var(--ep-border)] py-2 last:border-0">
                  <span>{t.label}</span>
                  <span className="whitespace-nowrap text-xs text-[var(--ep-navy-muted)]">{t.date}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="mt-8 text-xs text-[var(--ep-navy-muted)]">
        Worksheet saves to browser localStorage. Export via Field Calendar tab. Merge to{" "}
        <code>data/campaign-brain/field-event-worksheets.source.json</code> for team sharing.
      </p>
    </section>
  );
}
