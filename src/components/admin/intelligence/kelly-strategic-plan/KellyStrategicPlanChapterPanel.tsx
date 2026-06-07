import Link from "next/link";
import type { KellyStrategicPlanChapterOverlay } from "@/lib/intelligence/v4/phase11KellyStrategicPlanDepth";
import {
  KELLY_STRATEGIC_PLAN_LEGACY_HREF,
  KELLY_STRATEGIC_PLAN_HUB_HREF,
} from "@/lib/campaign-strategy/kelly-strategic-plan-nav";

export function KellyStrategicPlanChapterPanel({ overlay }: { overlay: KellyStrategicPlanChapterOverlay }) {
  return (
    <section className="mb-8 rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 to-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-900">Phase 11 P1 · Chapter intelligence</p>
      <h2 className="mt-1 font-heading text-lg font-bold text-kelly-navy">{overlay.strategicRole}</h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-navy">Debate application</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-kelly-muted">
            {overlay.debateApplication.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-navy">Operator steps</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-kelly-muted">
            {overlay.operatorSteps.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ol>
        </div>
      </div>

      {overlay.linkedPhilosophyBriefingIds.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-navy">Philosophy briefings</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {overlay.linkedPhilosophyBriefingIds.map((id) => (
              <Link
                key={id}
                href={`/admin/intelligence/debate-briefings/${id}`}
                className="rounded-full border border-fuchsia-200 px-2 py-0.5 text-[10px] font-bold text-fuchsia-950"
              >
                {id}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {overlay.intelligenceLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-kelly-navy/15 bg-white px-2 py-0.5 text-[10px] font-bold text-kelly-navy hover:bg-kelly-navy/5"
          >
            {link.label}
          </Link>
        ))}
      </div>

      <p className="mt-4 text-[10px] text-kelly-subtle">
        Legacy reader with Strategy Partner:{" "}
        <Link href={KELLY_STRATEGIC_PLAN_LEGACY_HREF} className="font-semibold text-kelly-navy underline">
          /admin/campaign-strategy
        </Link>
        {" · "}
        <Link href={KELLY_STRATEGIC_PLAN_HUB_HREF} className="font-semibold text-kelly-navy underline">
          Intelligence hub
        </Link>
      </p>
    </section>
  );
}
