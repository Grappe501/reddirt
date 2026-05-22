"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { PromotionWorkbenchSnapshot } from "@/lib/campaign-events/calendar-promotion/load-promotion-workbench";
import type { GooglePayloadPreview, PromotionTargetLane } from "@/lib/campaign-events/calendar-promotion/promotion-types";
import {
  dryRunPromotionAction,
  previewPromotionPayloadAction,
  promoteLedgerEventAction,
} from "@/app/admin/(board)/campaign-events/calendar-promotion-actions";

function QueueSection({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: PromotionWorkbenchSnapshot["readyTentative"];
  onSelect: (recordId: string, lane: PromotionTargetLane) => void;
}) {
  return (
    <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page p-4">
      <h2 className="font-heading text-sm font-bold">{title}</h2>
      {items.length ? (
        <ul className="mt-3 space-y-2 font-body text-sm">
          {items.map((e) => (
            <li key={e.row.recordId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2">
              <div>
                <strong>{e.row.calendar.title}</strong>
                <span className="ml-2 text-xs text-kelly-muted">
                  {e.row.dateYmd} · {e.promotionStatus.replaceAll("_", " ")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <button type="button" className="text-kelly-navy underline" onClick={() => onSelect(e.row.recordId, "tentative")}>
                  Review
                </button>
                <Link href={`/admin/campaign-events/${e.row.recordId}`} className="underline">
                  Drilldown
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-kelly-muted">None in this queue.</p>
      )}
    </section>
  );
}

export function CalendarPromotionWorkbench({ snapshot }: { snapshot: PromotionWorkbenchSnapshot }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<{ recordId: string; lane: PromotionTargetLane } | null>(null);
  const [payload, setPayload] = useState<GooglePayloadPreview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { config } = snapshot;

  const openReview = (recordId: string, lane: PromotionTargetLane) => {
    setSelected({ recordId, lane });
    setMessage(null);
    startTransition(async () => {
      const res = await previewPromotionPayloadAction(recordId, lane);
      if (res.ok) setPayload(res.payload);
      else setPayload(null);
    });
  };

  const runPromote = (ackWarnings?: boolean) => {
    if (!selected) return;
    startTransition(async () => {
      const res = await promoteLedgerEventAction(selected.recordId, selected.lane, { acknowledgeWarnings: ackWarnings });
      if (res.ok) {
        setMessage(
          res.result.status === "succeeded"
            ? `Promoted — Google event ${res.result.googleEventId ?? ""}`
            : res.result.error ?? res.result.status,
        );
        router.refresh();
      }
    });
  };

  const runDryRun = () => {
    if (!selected) return;
    startTransition(async () => {
      const res = await dryRunPromotionAction(selected.recordId, selected.lane);
      if (res.ok) {
        setMessage("Dry-run logged — no Google write.");
        setPayload(res.result.payload ?? null);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-kelly-navy/25 bg-kelly-navy/[0.06] p-5 font-body text-sm">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Google Calendar promotion (human-controlled)</h2>
        <p className="mt-2 text-kelly-muted">
          First controlled write surface for Event OS. Writes require{" "}
          <code className="text-xs">GOOGLE_CALENDAR_WRITE_ENABLED=true</code> plus Kelly tentative/official CalendarSource OAuth.
        </p>
        {!config.readyToWrite ? (
          <p className="mt-2 rounded-lg border border-amber-600/30 bg-amber-50 px-3 py-2 text-xs text-amber-950">
            {config.disabledReason}
            {config.missingConfig.length ? ` · Missing: ${config.missingConfig.join("; ")}` : ""}
          </p>
        ) : (
          <p className="mt-2 text-xs text-emerald-800">Write lanes ready — promotion still requires explicit operator click per event.</p>
        )}
        <p className="mt-2 text-xs">
          Tentative lane: {config.tentativeSourceReady ? "ready" : "not ready"} · Official lane:{" "}
          {config.officialSourceReady ? "ready" : "not ready"}
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <QueueSection title="Ready for tentative promotion" items={snapshot.readyTentative} onSelect={openReview} />
        <QueueSection title="Ready for official promotion" items={snapshot.readyOfficial} onSelect={openReview} />
        <QueueSection title="Promotion blocked" items={snapshot.blocked} onSelect={openReview} />
        <QueueSection title="Promotion failed" items={snapshot.failed} onSelect={openReview} />
        <QueueSection title="Recently promoted" items={snapshot.recentlyPromoted} onSelect={openReview} />
        <QueueSection title="Duplicate / conflict warnings" items={snapshot.duplicateWarnings} onSelect={openReview} />
      </div>

      {selected ? (
        <section className="rounded-2xl border border-kelly-navy/30 bg-kelly-page p-5 font-body text-sm">
          <h3 className="font-heading font-bold">Payload preview · {selected.lane} lane</h3>
          {payload ? (
            <>
              <p className="mt-2 font-semibold text-kelly-navy">{payload.aiSummary}</p>
              <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                <div>
                  <dt className="font-bold text-kelly-slate">Title</dt>
                  <dd>{payload.title}</dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-slate">Calendar</dt>
                  <dd>{payload.calendarSourceLabel}</dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-slate">When</dt>
                  <dd>
                    {payload.startIso} → {payload.endIso}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold text-kelly-slate">Location</dt>
                  <dd>{payload.location || "—"}</dd>
                </div>
              </dl>
              <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-kelly-wash p-3 text-[10px] whitespace-pre-wrap">
                {payload.description}
              </pre>
              {payload.warnings.length ? (
                <p className="mt-2 text-xs text-amber-900">Warnings: {payload.warnings.join("; ")}</p>
              ) : null}
            </>
          ) : (
            <p className="mt-2 text-kelly-muted">{pending ? "Loading preview…" : "Select an event to preview."}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pending || !config.readyToWrite}
              className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
              onClick={() => runPromote(false)}
            >
              Promote to {selected.lane}
            </button>
            <button
              type="button"
              disabled={pending || !config.readyToWrite}
              className="rounded-full border px-4 py-2 text-xs font-bold disabled:opacity-40"
              onClick={() => runPromote(true)}
            >
              Promote (acknowledge warnings)
            </button>
            <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-xs font-bold" onClick={runDryRun}>
              Dry-run only
            </button>
          </div>
          {message ? <p className="mt-3 text-xs font-semibold">{message}</p> : null}
        </section>
      ) : null}
    </div>
  );
}
