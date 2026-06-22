import Link from "next/link";

import { ElectionPlanCapitalizeMovesNotecard } from "@/components/election-plan/ElectionPlanCapitalizeMovesNotecard";
import { ElectionPlanBiosForumRereadPanel } from "@/components/election-plan/ElectionPlanBiosForumRereadPanel";
import { ElectionPlanForumSosMappingWorksheet } from "@/components/election-plan/ElectionPlanForumSosMappingWorksheet";
import { buildDay4ForumPipelineSurface } from "@/lib/election-plan/load-day4-forum-pipeline-surface";
import {
  epDebatePrepDayBlockHref,
  epDebatePrepDayHref,
  epDebatePrepDayRehearsalHref,
  EP_FORUM_TRANSCRIPT_LAB_HREF,
} from "@/lib/election-plan/debate-prep-links";
import { DAY4_ID } from "@/lib/election-plan/debatePrepDayDrillDown";
import { DAY4_DAY5_TEASER } from "@/lib/election-plan/day4-learning-pathway";

export function ElectionPlanDay4PathwayReturnLink({
  blockId,
  label = "Return to Day 4 pathway",
}: {
  blockId?: string;
  label?: string;
}) {
  const href = blockId ? epDebatePrepDayBlockHref(DAY4_ID, blockId) : epDebatePrepDayHref(DAY4_ID);
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs font-bold text-violet-800 hover:text-violet-950"
    >
      ← {label}
    </Link>
  );
}

export function ElectionPlanDay4HandoffBanner() {
  return (
    <section className="ep-card mt-6 border-2 border-emerald-300/60 bg-emerald-50/30 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-emerald-900">Day 5 handoff</p>
      <p className="mt-2 font-heading text-lg font-bold text-[var(--ep-navy)]">{DAY4_DAY5_TEASER.title}</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">{DAY4_DAY5_TEASER.body}</p>
      <Link
        href={DAY4_DAY5_TEASER.href}
        className="ep-btn ep-btn-primary ep-btn-block-sm-auto mt-4 inline-block"
      >
        Open Day 5 anticipate &amp; capitalize drills →
      </Link>
    </section>
  );
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso.slice(0, 16);
  }
}

export function ElectionPlanForumLabPipelineChecklist({
  pipeline,
}: {
  pipeline: import("@/lib/election-plan/load-day4-forum-pipeline-surface").Day4PipelineStatus;
}) {
  const steps = [
    {
      id: "artifact",
      label: "Forum artifact",
      done: pipeline.artifactReady,
      detail: pipeline.artifactReady ? pipeline.artifactLabel : "Forum transcript ready in lab — open to read excerpts",
    },
    {
      id: "v1",
      label: "v1 analysis",
      done: pipeline.v1Ready,
      detail: pipeline.v1Ready
        ? `Ready · ${formatTimestamp(pipeline.v1Timestamp)}`
        : "Run v1 theme analysis in forum lab",
    },
    {
      id: "v2",
      label: "v2 deep analysis",
      done: pipeline.v2Ready,
      detail: pipeline.v2Ready
        ? `Ready · ${formatTimestamp(pipeline.v2Timestamp)}`
        : "Run v2 deep analysis for predicted lines",
    },
    {
      id: "capitalize",
      label: "Verified capitalize moves",
      done: pipeline.verifiedCapitalizeCount >= pipeline.targetCapitalizeCount,
      detail: `${pipeline.verifiedCapitalizeCount} of ${pipeline.targetCapitalizeCount} green lines on notecard`,
    },
  ];

  const remaining = steps.filter((s) => !s.done);

  return (
    <section className="ep-card border-2 border-violet-300/50 bg-violet-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-violet-900">Forum pipeline · what remains</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Sunday ingest checklist — staff may run upload; Kelly reviews green lines only.
      </p>

      <ol className="mt-4 space-y-3">
        {steps.map((step) => (
          <li
            key={step.id}
            className={`rounded-lg border p-3 ${
              step.done
                ? "border-emerald-200 bg-emerald-50/50"
                : "border-amber-200 bg-amber-50/40"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold text-[var(--ep-navy)]">
                {step.done ? "✓ " : "○ "}
                {step.label}
              </p>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                  step.done ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                }`}
              >
                {step.done ? "Done" : "Remaining"}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">{step.detail}</p>
          </li>
        ))}
      </ol>

      {pipeline.staffPendingQuoteCount > 0 ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs text-amber-950">
          {pipeline.staffPendingQuoteCount} forum quote(s) still in staff review — not shown on Kelly notecard until
          claims-cleared.
        </p>
      ) : null}

      {remaining.length === 0 ? (
        <p className="mt-4 text-xs font-bold text-emerald-900">Pipeline complete — copy five green lines to notecard below.</p>
      ) : (
        <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
          Next: {remaining.map((s) => s.label.toLowerCase()).join(" → ")}
        </p>
      )}

      <Link href={EP_FORUM_TRANSCRIPT_LAB_HREF} className="mt-4 inline-block text-xs font-bold text-violet-800">
        Open forum lab →
      </Link>
    </section>
  );
}

export function ElectionPlanDay4RecoveryPanel() {
  return (
    <section className="ep-card mb-6 border-2 border-teal-200/80 bg-teal-50/20 p-5 text-sm">
      <p className="text-xs font-bold uppercase text-teal-900">Recovery protocol</p>
      <p className="mt-2 text-[var(--ep-navy-muted)]">
        Walk 10 minutes · hydrate · one optional 60s opening only. No new trap content tonight.
      </p>
      <Link
        href={epDebatePrepDayRehearsalHref(DAY4_ID, "rehearse-forum-counter-60s")}
        className="ep-btn ep-btn-primary ep-btn-block-sm-auto mt-4 inline-block"
      >
        One forum counter rehearsal (60s) →
      </Link>
    </section>
  );
}

export function ElectionPlanDay4BlockEmbed({ blockId }: { blockId: string }) {
  const surface = buildDay4ForumPipelineSurface();

  if (blockId === "b4-lab") {
    return (
      <div className="mb-6 space-y-0">
        <ElectionPlanDay4PathwayReturnLink blockId="b4-lab" />
        <ElectionPlanForumLabPipelineChecklist pipeline={surface.pipeline} />
        <ElectionPlanCapitalizeMovesNotecard lines={surface.notecardLines} />
        <ElectionPlanDay4HandoffBanner />
      </div>
    );
  }

  if (blockId === "b4-sos") {
    return (
      <div className="mb-6">
        <ElectionPlanDay4PathwayReturnLink blockId="b4-sos" />
        <ElectionPlanForumSosMappingWorksheet rows={surface.sosMappingRows} />
      </div>
    );
  }

  if (blockId === "b4-rest") {
    return (
      <div className="mb-6">
        <ElectionPlanDay4PathwayReturnLink blockId="b4-rest" />
        <ElectionPlanDay4RecoveryPanel />
      </div>
    );
  }

  if (blockId === "b4-opponent-bios-reread") {
    return (
      <div className="mb-6">
        <ElectionPlanDay4PathwayReturnLink blockId="b4-opponent-bios-reread" />
        <ElectionPlanBiosForumRereadPanel rows={surface.bioRows} />
        <ElectionPlanDay4HandoffBanner />
      </div>
    );
  }

  return null;
}
