import Link from "next/link";
import type { DebateWarRoomP4Packet } from "@/lib/intelligence/v4/debateWarRoomP4";
import { getSurfaceGuide } from "@/lib/intelligence/v4/debateOperatorNarratives";
import { V4OperatorGuide } from "@/components/admin/intelligence/v4/V4OperatorGuide";

const card = "rounded-xl border border-kelly-text/10 bg-white p-4";

export function V4DebateWarRoomPanel({
  packet,
  variant = "full",
}: {
  packet: DebateWarRoomP4Packet;
  variant?: "full" | "compact" | "archive";
}) {
  const guide = getSurfaceGuide("debateWarRoomP4");

  return (
    <section className="mb-8 space-y-6">
      <header className="rounded-xl border-2 border-kelly-navy/15 bg-kelly-page/40 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-violet-900">P4 · Debate war room</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Film room, cross-exam bank &amp; argument library</h2>
        <p className="mt-2 max-w-4xl text-sm text-kelly-muted">{packet.archiveHonesty}</p>
        <p className="mt-2 text-xs text-amber-900">
          INTERNAL_DRAFT · Do not cite clips or quotes on stage without human verification and claims gate.
        </p>
      </header>

      {guide && variant === "full" ? <V4OperatorGuide guide={guide} /> : null}

      {variant !== "archive" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {packet.todayPriorities.map((row) => (
            <div key={row.title} className={card}>
              <p className="text-[10px] font-bold uppercase text-kelly-subtle">{row.title}</p>
              <p className="mt-1 text-lg font-bold text-kelly-navy">{row.value}</p>
              <p className="mt-1 text-xs text-kelly-muted">{row.detail}</p>
            </div>
          ))}
        </div>
      ) : null}

      {variant === "full" ? (
        <article className={card}>
          <h3 className="text-sm font-bold uppercase text-kelly-navy">Readiness lanes (P4 computed)</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {packet.readinessScores.map((row) => (
              <div key={row.id} className="rounded-lg border border-kelly-text/10 px-3 py-2 text-xs">
                <p className="font-bold text-kelly-navy">{row.label}</p>
                <p className="text-lg font-bold">{row.score}/100</p>
                <p className="text-kelly-muted">{row.whyThisScore}</p>
              </div>
            ))}
          </div>
        </article>
      ) : null}

      <article className={card}>
        <h3 className="text-sm font-bold uppercase text-kelly-navy">Film room drills</h3>
        <p className="mt-1 text-xs text-kelly-muted">
          {packet.filmRoom.directClipCount} direct · {packet.filmRoom.referenceClipCount} reference ·{" "}
          {packet.filmRoom.legislativeClipCount} legislative · {packet.legislativeNote}
        </p>
        <ul className="mt-2 list-inside list-disc text-xs text-rose-900">
          {packet.filmRoom.coverageGaps.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        <div className="mt-4 space-y-3">
          {packet.filmRoom.items.slice(0, variant === "compact" ? 4 : 8).map((item) => (
            <div key={item.id} className="rounded-lg border border-kelly-text/10 bg-kelly-page/40 p-3 text-xs">
              <p className="font-bold text-kelly-navy">{item.title}</p>
              <p className="text-kelly-muted">
                {item.topic} · {item.confidence} · {item.governanceLabel}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Angle:</span> {item.opponentClaimOrAngle}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Counter:</span> {item.recommendedCounter}
              </p>
              <p className="mt-1">
                <span className="font-semibold">Drill:</span> {item.drillPrompt}
              </p>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noreferrer" className="mt-1 inline-block font-semibold text-kelly-navy underline">
                  Source (staff review)
                </a>
              ) : null}
            </div>
          ))}
        </div>
        <Link href="/admin/intelligence/legislative-video" className="mt-3 inline-block text-xs font-bold text-kelly-navy underline">
          Legislative video pipeline →
        </Link>
      </article>

      {variant !== "compact" ? (
        <>
          <article className={card}>
            <h3 className="text-sm font-bold uppercase text-kelly-navy">Cross-examination question bank</h3>
            <p className="mt-1 text-xs text-kelly-muted">
              Use to draw out implementation gaps — when, what you learn, Kelly pivot, and social angle for post-debate.
            </p>
            <div className="mt-4 space-y-4">
              {packet.crossExamBank.map((row) => (
                <div key={row.id} className="rounded-lg border border-violet-100 bg-violet-50/30 p-3 text-xs">
                  <p className="font-bold text-violet-950">{row.question}</p>
                  {row.billAnchor ? (
                    <Link
                      href={`/admin/intelligence/kim-hammer/bills/${encodeURIComponent(row.billAnchor)}`}
                      className="mt-1 inline-block font-semibold text-kelly-navy underline"
                    >
                      Bill drill: {row.billAnchor}
                    </Link>
                  ) : null}
                  <ul className="mt-2 space-y-1 text-kelly-muted">
                    <li>
                      <span className="font-semibold">When:</span> {row.whenToAsk}
                    </li>
                    <li>
                      <span className="font-semibold">What you learn:</span> {row.whatYouLearn}
                    </li>
                    <li>
                      <span className="font-semibold">Kelly pivot:</span> {row.kellyPivot}
                    </li>
                    <li>
                      <span className="font-semibold">Social:</span> {row.socialPostAngle}
                    </li>
                  </ul>
                  <span
                    className={`mt-2 inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                      row.risk === "HIGH" ? "bg-rose-100 text-rose-900" : row.risk === "MEDIUM" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-900"
                    }`}
                  >
                    {row.risk} risk
                  </span>
                </div>
              ))}
            </div>
          </article>

          <article className={card}>
            <h3 className="text-sm font-bold uppercase text-kelly-navy">Argument library (debate + social)</h3>
            <div className="mt-4 space-y-4">
              {packet.argumentLibrary.map((row) => (
                <div key={row.id} className="rounded-lg border border-kelly-text/10 p-3 text-xs">
                  <p className="font-bold text-rose-950">He may say: {row.hammerLine}</p>
                  <p className="mt-1 text-kelly-muted">Evidence: {row.evidenceHeMayCite.join("; ") || "—"}</p>
                  <p className="mt-2">
                    <span className="font-semibold text-emerald-900">Agree:</span> {row.agreeWhereValid}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold text-kelly-navy">Contrast:</span> {row.contrastPivot}
                  </p>
                  <p className="mt-1">
                    <span className="font-semibold text-violet-900">Bridge:</span> {row.kellyBridge}
                  </p>
                  <p className="mt-1 text-kelly-muted">
                    <span className="font-semibold">Debate:</span> {row.debateStep}
                  </p>
                  <p className="mt-1 text-kelly-muted">
                    <span className="font-semibold">Social snippet:</span> {row.socialSnippet}
                  </p>
                  {row.billDrillHref ? (
                    <Link href={row.billDrillHref} className="mt-2 inline-block font-bold text-kelly-navy underline">
                      Bill drill-down →
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </article>

          <article className={`${card} border-amber-200/50 bg-amber-50/40`}>
            <h3 className="text-sm font-bold uppercase text-amber-950">Trap lanes active tonight</h3>
            <ul className="mt-2 list-inside list-disc text-xs text-amber-950">
              {packet.scenarioTraps.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs font-bold uppercase text-amber-900">Do not say (debate)</p>
            <ul className="mt-1 list-inside list-disc text-xs text-amber-950">
              {packet.whatNotToSay.map((line) => (
                <li key={line.slice(0, 40)}>{line}</li>
              ))}
            </ul>
          </article>
        </>
      ) : null}
    </section>
  );
}
