import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import type { PublicFestivalCard } from "@/lib/festivals/types";
import type { FestivalCoveragePayloadV1 } from "@/lib/festivals/types";

function formatRange(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return "";
  const opt: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString("en-US", opt)} – ${e.toLocaleDateString("en-US", { ...opt, year: "numeric" })}`;
}

function isCoveragePayload(x: unknown): x is FestivalCoveragePayloadV1 {
  return Boolean(x && typeof x === "object" && (x as FestivalCoveragePayloadV1).version === 1);
}

type Props = {
  festivals: PublicFestivalCard[];
  coveragePayload: unknown | null;
};

export function HomeArkansasFestivalsSection({ festivals, coveragePayload }: Props) {
  const plan = coveragePayload && isCoveragePayload(coveragePayload) ? coveragePayload : null;

  return (
    <FullBleedSection padY className="border-t border-deep-soil/10 bg-cream-canvas/80" aria-labelledby="festival-feed-title">
      <ContentContainer>
        <p
          id="festival-feed-title"
          className="text-center font-body text-[11px] font-bold uppercase tracking-[0.24em] text-civic-slate"
        >
          Community calendar
        </p>
        <h2 className="mt-2 text-center font-heading text-2xl font-bold text-deep-soil md:text-3xl">
          Fairs & festivals (Arkansas feed)
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center font-body text-sm text-deep-soil/75 md:text-base">
          Ingested from whitelisted sources and staff review—not the same as published campaign stops. Use the field plan
          below to line up candidate travel with volunteer coverage.
        </p>

        {festivals.length === 0 ? (
          <p className="mx-auto mt-8 max-w-xl rounded-lg border border-dashed border-deep-soil/25 bg-white/70 p-5 text-center font-body text-sm text-deep-soil/70" role="status">
            No approved community events on the public feed yet. Run ingest (cron), approve rows in the workbench, or review
            suggestions from the{" "}
            <Link href="/events#suggest" className="font-semibold text-red-dirt underline">
              Movement /events form
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-8 grid list-none grid-cols-1 gap-4 md:grid-cols-2">
            {festivals.map((f) => (
              <li key={f.id} className="min-w-0">
                <div className="flex h-full flex-col rounded-card border border-deep-soil/12 bg-white p-5 shadow-[var(--shadow-soft)]">
                  <p className="font-body text-[10px] font-bold uppercase tracking-wider text-civic-slate/80">
                    {formatRange(f.startAt, f.endAt)}
                    {f.city || f.countyDisplayName
                      ? ` · ${[f.city, f.countyDisplayName].filter(Boolean).join(", ")}`
                      : null}
                  </p>
                  <h3 className="mt-2 font-heading text-lg font-bold text-deep-soil">{f.name}</h3>
                  {f.venueName ? <p className="mt-1 font-body text-xs text-deep-soil/60">{f.venueName}</p> : null}
                  {f.shortDescription ? (
                    <p className="mt-2 line-clamp-3 font-body text-sm text-deep-soil/75">{f.shortDescription}</p>
                  ) : null}
                  {f.linkUrl ? (
                    <a
                      href={f.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 font-body text-sm font-semibold text-red-dirt underline-offset-2 hover:underline"
                    >
                      {f.sourceChannel === "PUBLIC_FORM" ? "More info (submitted) →" : "Source listing →"}
                    </a>
                  ) : (
                    <p className="mt-4 font-body text-sm text-deep-soil/60">
                      {f.sourceChannel === "PUBLIC_FORM" ? "Community-sourced — verify details before travel." : "No direct listing link on file — verify before travel."}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        {plan ? (
          <div className="mx-auto mt-10 max-w-3xl rounded-card border border-civic-gold/25 bg-civic-midnight/5 p-6 md:p-8">
            <h3 className="font-heading text-lg font-bold text-deep-soil">AI field map (draft)</h3>
            <p className="mt-2 font-body text-sm text-deep-soil/75">{plan.horizonNote}</p>
            <ul className="mt-6 space-y-6">
              {plan.weekends.map((w) => (
                <li key={w.label} className="border-t border-deep-soil/10 pt-4 first:border-t-0 first:pt-0">
                  <p className="font-body text-xs font-bold uppercase tracking-wider text-red-dirt/90">{w.label}</p>
                  <p className="mt-1 font-body text-sm font-semibold text-deep-soil">Candidate priority</p>
                  <p className="font-body text-sm text-deep-soil/85">
                    {w.candidatePriority.name} — {w.candidatePriority.countyOrCity}
                  </p>
                  <p className="mt-1 font-body text-sm text-deep-soil/70">{w.candidatePriority.rationale}</p>
                  {w.parallelTeamTargets.length > 0 ? (
                    <div className="mt-3">
                      <p className="font-body text-sm font-semibold text-deep-soil">Parallel team targets</p>
                      <ul className="mt-1 list-inside list-disc space-y-1 font-body text-sm text-deep-soil/80">
                        {w.parallelTeamTargets.map((p) => (
                          <li key={p.festivalId}>
                            <strong className="font-semibold text-deep-soil">{p.name}</strong> ({p.countyOrCity}): {p.task}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {w.coverageGaps && w.coverageGaps.length > 0 ? (
                    <p className="mt-2 font-body text-xs text-deep-soil/60">Gaps: {w.coverageGaps.join("; ")}</p>
                  ) : null}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-body text-xs text-deep-soil/55">
              Generated for planning; confirm each stop with scheduling and local leads. Refresh via cron:{" "}
              <code className="rounded bg-white px-1">/api/cron/festivals-coverage</code>.
            </p>
          </div>
        ) : null}

        <p className="mt-8 text-center font-body text-xs text-deep-soil/55">
          <Link href="/get-involved" className="font-semibold text-red-dirt hover:underline" prefetch={false}>
            Organize a volunteer team →
          </Link>
        </p>
      </ContentContainer>
    </FullBleedSection>
  );
}
