import Link from "next/link";
import { notFound } from "next/navigation";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { getKellyPrepWeekDayOverlay } from "@/lib/intelligence/v4/phase15P2KellyPrepWeekDepth";
import {
  getKellyPrepWeekDayPlan,
  KELLY_PREP_WEEK_DAY_IDS,
  KELLY_PREP_WEEK_HUB_HREF,
  type KellyPrepWeekDayId,
} from "@/lib/intelligence/v4/kellyPrepWeekPath";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return KELLY_PREP_WEEK_DAY_IDS.map((dayId) => ({ dayId }));
}

export default async function KellyPrepWeekDayPage({
  params,
}: {
  params: Promise<{ dayId: string }>;
}) {
  const { dayId } = await params;
  if (!KELLY_PREP_WEEK_DAY_IDS.includes(dayId as KellyPrepWeekDayId)) notFound();

  const plan = getKellyPrepWeekDayPlan(dayId as KellyPrepWeekDayId)!;
  const overlay = getKellyPrepWeekDayOverlay(dayId as KellyPrepWeekDayId);

  return (
    <div className="mx-auto max-w-7xl text-kelly-text">
      <V4PageHeader
        eyebrow={`Kelly prep week · ${plan.weekdayLabel}`}
        title={plan.title}
        description={plan.subtitle}
      >
        <V4BackLinks />
        <Link
          href={KELLY_PREP_WEEK_HUB_HREF}
          className="rounded-full border border-indigo-400 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-950"
        >
          Week hub
        </Link>
      </V4PageHeader>

      <section className="mb-6 rounded-xl border border-indigo-100 bg-white p-5 text-sm">
        <p className="text-kelly-muted">
          <span className="font-bold text-kelly-navy">Goal:</span> {plan.goalForKelly}
        </p>
        <p className="mt-2 text-rose-900/90">
          <span className="font-bold">Trap we want:</span> {plan.hammerTrapWeWant}
        </p>
        <p className="mt-2 text-emerald-900">
          <span className="font-bold">Success check:</span> {plan.successCheck}
        </p>
      </section>

      <section className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/40 p-5">
        <h2 className="text-xs font-bold uppercase text-indigo-900">P2 closure steps</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-kelly-muted">
          {overlay.closureSteps.map((step) => (
            <li key={step.slice(0, 48)}>{step}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Kelly reads — in order</h2>
        {plan.kellyReads.map((item, idx) => (
          <article key={item.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-kelly-navy">
                {idx + 1}. {item.label}
              </p>
              <span className="font-mono text-xs text-kelly-subtle">~{item.minutes} min</span>
            </div>
            <p className="mt-2 text-kelly-muted">
              <span className="font-semibold">Extract:</span> {item.whatToExtract}
            </p>
            <p className="mt-1 text-kelly-muted">
              <span className="font-semibold">Kelly edge:</span> {item.kellySuperiorityAngle}
            </p>
            <Link href={item.href} className="mt-3 inline-block font-bold text-indigo-950 underline">
              Open reading →
            </Link>
          </article>
        ))}
      </section>

      {plan.rehearsalOutLoud.length ? (
        <section className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-emerald-900">Rehearse out loud</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-kelly-muted">
            {plan.rehearsalOutLoud.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {plan.staffOnly?.length ? (
        <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50/50 p-5 text-sm">
          <h2 className="text-xs font-bold uppercase text-amber-900">Staff only</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-kelly-muted">
            {plan.staffOnly.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
