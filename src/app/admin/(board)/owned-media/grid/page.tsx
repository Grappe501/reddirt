import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { OwnedMediaKind } from "@prisma/client";
import { prisma } from "@/lib/db";
import { COMMUNITY_TRAINING_TAG } from "@/lib/campaign-briefings/briefing-queries";
import { getOwnedFilePublicPath } from "@/lib/owned-media/storage";
import { OwnedMediaGridToolbar } from "./toolbar";

type Props = {
  searchParams: Promise<{
    q?: string;
    size?: string;
    tag?: string;
    batch?: string;
    kind?: string;
  }>;
};

const SIZE = new Set(["sm", "md", "lg"]);

export default async function OwnedMediaGridPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const size = SIZE.has(sp.size ?? "") ? (sp.size as "sm" | "md" | "lg") : "sm";
  const tag = sp.tag?.trim() || null;
  const batch = sp.batch?.trim() || null;
  const kind =
    sp.kind && Object.values(OwnedMediaKind).includes(sp.kind as OwnedMediaKind)
      ? (sp.kind as OwnedMediaKind)
      : null;

  const where: Prisma.OwnedMediaAssetWhereInput = {};
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { fileName: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { localIngestRelativePath: { contains: q, mode: "insensitive" } },
    ];
  }
  if (tag) where.issueTags = { has: tag };
  if (batch) where.mediaIngestBatchId = batch;
  if (kind) where.kind = kind;

  const [assets, batches] = await Promise.all([
    prisma.ownedMediaAsset
      .findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: 500,
        select: {
          id: true,
          title: true,
          fileName: true,
          kind: true,
          mimeType: true,
          reviewStatus: true,
          issueTags: true,
          localIngestRelativePath: true,
          mediaIngestBatchId: true,
        },
      })
      .catch(() => []),
    prisma.mediaIngestBatch.findMany({ orderBy: { createdAt: "desc" }, take: 40 }).catch(() => []),
  ]);

  const minCell =
    size === "lg" ? "minmax(10rem, 1fr)" : size === "md" ? "minmax(6.5rem, 1fr)" : "minmax(4.25rem, 1fr)";

  return (
    <div className="mx-auto max-w-[1800px] px-2 pb-8 pt-2 md:px-4">
      <div className="border-b border-deep-soil/10 pb-3">
        <h1 className="font-heading text-2xl font-bold text-deep-soil">Media library — grid</h1>
        <p className="mt-1 max-w-3xl font-body text-sm text-deep-soil/70">
          Dense view for triage: up to 500 items. Ingested folder runs are tagged (e.g.{" "}
          <code className="rounded bg-deep-soil/5 px-1 text-xs">{COMMUNITY_TRAINING_TAG}</code>) and chunked for search when
          OpenAI is configured. Use detail pages for transcripts and ASR.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/admin/owned-media" className="font-semibold text-civic-slate underline">
            ← List view
          </Link>
          <span className="text-deep-soil/35"> · </span>
          <Link href="/admin/owned-media/batches" className="font-semibold text-civic-slate underline">
            Batches
          </Link>
        </p>
      </div>

      <OwnedMediaGridToolbar
        defaultQ={q}
        size={size}
        tag={tag}
        batch={batch}
        kind={kind}
        batches={batches.map((b) => ({ id: b.id, label: b.sourceLabel, started: b.startedAt.toISOString() }))}
        resultCount={assets.length}
      />

      <ul
        className="mt-4 grid list-none gap-1.5 md:gap-2"
        style={{ gridTemplateColumns: `repeat(auto-fill, ${minCell})` }}
      >
        {assets.map((a) => {
          const isHeic = a.mimeType?.toLowerCase().includes("heic") || a.mimeType?.toLowerCase().includes("heif");
          const canImgThumb = a.kind === "IMAGE" && a.mimeType && !isHeic;
          const src = canImgThumb ? getOwnedFilePublicPath(a.id) : null;
          return (
            <li key={a.id}>
              <Link
                href={`/admin/owned-media/${a.id}`}
                className="group flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-deep-soil/10 bg-cream-canvas shadow-sm transition hover:border-red-dirt/30 hover:shadow"
              >
                <div
                  className={`relative aspect-square w-full ${size === "sm" ? "min-h-[3.5rem]" : size === "md" ? "min-h-[5.5rem]" : "min-h-[8rem]"} overflow-hidden bg-deep-soil/5`}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center p-1 text-center">
                      <span className="font-mono text-[9px] font-bold uppercase text-deep-soil/70">{a.kind}</span>
                      {isHeic ? (
                        <span className="mt-0.5 text-[8px] text-deep-soil/50">HEIC — open file</span>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className="min-w-0 border-t border-deep-soil/10 p-1.5">
                  <p
                    className={`font-body font-semibold leading-snug text-deep-soil ${
                      size === "sm" ? "line-clamp-2 text-[9px]" : size === "md" ? "line-clamp-2 text-[10px]" : "line-clamp-3 text-xs"
                    }`}
                    title={a.title}
                  >
                    {a.title}
                  </p>
                  {size !== "sm" ? (
                    <p className="mt-0.5 truncate font-mono text-[8px] text-deep-soil/45" title={a.id}>
                      {a.id.slice(0, 8)}…
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      {assets.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-deep-soil/20 p-8 text-center text-sm text-deep-soil/60">
          No assets match. Clear filters or run folder ingest:{" "}
          <code className="rounded bg-deep-soil/5 px-1 text-xs">npm run ingest:campaign-info-folder</code>
        </p>
      ) : null}
    </div>
  );
}
