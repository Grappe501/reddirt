import Link from "next/link";
import { notFound } from "next/navigation";
import { V4BackLinks, V4PageHeader } from "@/components/admin/intelligence/v4/V4PageHeader";
import { getFieldBookArticle } from "@/lib/intelligence/fieldBookRegistry";
import { loadFieldBookChunkPromotionState } from "@/lib/intelligence/v4/fieldBookChunkPromotionState";
import {
  FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF,
  getFieldBookChunkPromotionOverlay,
  PROMOTION_BATCH_IDS,
  type PromotionBatchId,
} from "@/lib/intelligence/v4/phase11P5FieldBookChunkPromotionDepth";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ batchId: string }> };

export default async function FieldBookChunkPromotionBatchPage({ params }: Props) {
  const { batchId: raw } = await params;
  if (!PROMOTION_BATCH_IDS.includes(raw as PromotionBatchId)) notFound();
  const batchId = raw as PromotionBatchId;

  const overlay = getFieldBookChunkPromotionOverlay(batchId);
  const state = loadFieldBookChunkPromotionState();
  const batchState = state?.batches.find((b) => b.batchId === batchId);

  return (
    <div className="mx-auto max-w-4xl text-kelly-text">
      <V4PageHeader eyebrow="Field Book chunk promotion · P5 batch" title={overlay.label} description={overlay.summary}>
        <V4BackLinks />
        <Link
          href={FIELD_BOOK_CHUNK_PROMOTION_HUB_HREF}
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-950"
        >
          Promotion hub
        </Link>
      </V4PageHeader>

      <section className="mb-6 rounded-xl border border-kelly-text/10 bg-white p-5 text-sm">
        <dl className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">Chunks</dt>
            <dd className="mt-1 font-mono text-kelly-navy">{(batchState?.chunkCount ?? 0).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">Status</dt>
            <dd className="mt-1 capitalize text-kelly-navy">{(batchState?.status ?? "catalogued").replace(/_/g, " ")}</dd>
          </div>
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">Batch id</dt>
            <dd className="mt-1 font-mono text-kelly-navy">{batchId}</dd>
          </div>
          <div>
            <dt className="font-bold uppercase text-kelly-subtle">Chunks API</dt>
            <dd className="mt-1">
              <code className="text-[10px]">/api/admin/campaign-strategy/chunks</code>
            </dd>
          </div>
        </dl>
      </section>

      <section className="mb-6 space-y-4">
        <article className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5 text-sm">
          <h2 className="font-bold uppercase text-emerald-950">Operator steps</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-kelly-muted">
            {overlay.operatorSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="rounded-xl border border-violet-100 bg-violet-50/30 p-5 text-sm">
          <h2 className="font-bold uppercase text-violet-950">Claims gate</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-kelly-muted">
            {overlay.claimsGateSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-rose-100 bg-rose-50/30 p-5 text-sm">
          <h2 className="font-bold uppercase text-rose-950">Do not promote until</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-kelly-muted">
            {overlay.doNotPromoteUntil.map((line) => (
              <li key={line}>{line}</li>
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
        <h3 className="mt-4 text-[10px] font-bold uppercase text-kelly-subtle">Preview routes</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {overlay.previewRoutes.map((route) => (
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
