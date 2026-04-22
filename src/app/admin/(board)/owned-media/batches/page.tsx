import Link from "next/link";
import { MediaIngestBatchStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

const statusClass: Record<MediaIngestBatchStatus, string> = {
  [MediaIngestBatchStatus.STARTED]: "bg-amber-100 text-amber-950",
  [MediaIngestBatchStatus.COMPLETE]: "bg-emerald-100 text-emerald-950",
  [MediaIngestBatchStatus.PARTIAL]: "bg-amber-200 text-amber-950",
  [MediaIngestBatchStatus.FAILED]: "bg-red-100 text-red-900",
};

export default async function MediaIngestBatchesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const batches = await prisma.mediaIngestBatch.findMany({
    orderBy: { createdAt: "desc" },
    take: 150,
    include: {
      _count: { select: { assets: true } },
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <Link href="/admin/owned-media" className="text-sm text-civic-slate hover:underline">
          ← Campaign-owned media
        </Link>
        <h1 className="mt-2 font-heading text-2xl font-bold text-deep-soil">Media ingest batches</h1>
        <p className="mt-1 text-sm text-deep-soil/70">
          Folder and device import sessions. Open a batch to review assets, apply tags, and run bulk actions.
        </p>
        {sp.error ? (
          <p className="mt-2 rounded-md border border-red-600/20 bg-red-50 px-3 py-2 text-sm text-red-800">Missing batch id.</p>
        ) : null}
      </div>

      <ul className="space-y-2">
        {batches.map((b) => (
          <li key={b.id}>
            <Link
              href={`/admin/owned-media/batches/${b.id}`}
              className="flex flex-col gap-1 rounded-lg border border-deep-soil/10 bg-cream-canvas px-4 py-3 shadow-[var(--shadow-soft)] transition hover:border-deep-soil/25 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-heading text-sm font-bold text-deep-soil">
                  {b.sourceLabel} <span className="font-mono font-normal text-deep-soil/50">· {b.id}</span>
                </p>
                <p className="mt-0.5 text-xs text-deep-soil/60">
                  {b.sourceType} · {b._count.assets} assets · {b.startedAt.toLocaleString()}
                </p>
                {b.ingestPath ? <p className="mt-0.5 break-all font-mono text-[10px] text-deep-soil/45">{b.ingestPath}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`inline-flex rounded-md px-2 py-0.5 font-body text-xs font-bold uppercase tracking-wide ${
                    statusClass[b.status] ?? "bg-deep-soil/10"
                  }`}
                >
                  {b.status}
                </span>
                {b.finishedAt ? (
                  <span className="text-xs text-deep-soil/50">done {b.finishedAt.toLocaleString()}</span>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {batches.length === 0 ? (
        <p className="rounded-md border border-deep-soil/10 bg-white/60 px-4 py-6 text-sm text-deep-soil/70">
          No batches yet. Run <code className="rounded bg-deep-soil/5 px-1">npm run ingest:device</code> or{" "}
          <code className="rounded bg-deep-soil/5 px-1">npm run ingest:folder</code> to create one.
        </p>
      ) : null}
    </div>
  );
}

