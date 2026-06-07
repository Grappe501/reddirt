import Link from "next/link";
import { notFound } from "next/navigation";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { loadFieldBookPromotionExecutionState } from "@/lib/intelligence/v4/fieldBookPromotionExecutionState";
import {
  FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF,
  getFieldBookPromotionExecutionOverlay,
  PROMOTION_EXECUTION_WAVE_IDS,
  type PromotionExecutionWaveId,
} from "@/lib/intelligence/v4/phase11P8FieldBookPromotionExecutionDepth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ waveId: string }> };

export default async function FieldBookPromotionExecutionWavePage({ params }: Props) {
  const { waveId: raw } = await params;
  if (!PROMOTION_EXECUTION_WAVE_IDS.includes(raw as PromotionExecutionWaveId)) notFound();
  const waveId = raw as PromotionExecutionWaveId;

  const overlay = getFieldBookPromotionExecutionOverlay(waveId);
  const state = loadFieldBookPromotionExecutionState();
  const waveState = state?.waves.find((w) => w.waveId === waveId);

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader eyebrow="Field Book promotion · P8 wave" title={overlay.label} description={overlay.summary}>
        <V4BackLinks />
        <Link
          href={FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF}
          className="rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Execution hub
        </Link>
      </V4PageHeader>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <dl className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">Linked chunks</dt>
            <dd className="mt-1 font-mono text-kelly-navy">{(waveState?.linkedChunkCount ?? 0).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">Status</dt>
            <dd className="mt-1 capitalize text-kelly-navy">{(waveState?.status ?? "pending").replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">Batches</dt>
            <dd className="mt-1 font-mono text-[10px] text-kelly-navy">{overlay.linkedBatchIds.join(", ")}</dd>
          </div>
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">Prerequisites</dt>
            <dd className="mt-1 text-kelly-navy">{overlay.prerequisitePasses.join(" · ")}</dd>
          </div>
        </dl>
      </section>

      <section className="mb-6 space-y-4">
        <article className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5 text-sm">
          <h2 className="font-bold uppercase text-emerald-950">Execution steps</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-kelly-muted">
            {overlay.operatorSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="rounded-xl border border-violet-100 bg-violet-50/30 p-5 text-sm">
          <h2 className="font-bold uppercase text-violet-950">Claims execution gate</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-kelly-muted">
            {overlay.claimsExecutionSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="mb-8 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <h2 className="font-bold uppercase text-kelly-navy">Field Book targets</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {overlay.targetFieldBookSlugs.map((slug) => (
            <li key={slug}>
              <Link
                href={`/admin/intelligence/field-book/${slug}`}
                className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
              >
                {getFieldBookArticle(slug)?.title ?? slug}
              </Link>
            </li>
          ))}
        </ul>
        <h3 className="mt-4 text-[10px] font-bold uppercase text-kelly-subtle">Related routes</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {overlay.intelligenceLinks.map((route) => (
            <li key={route.href}>
              <Link href={route.href} className="text-xs font-bold text-kelly-navy underline">
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
