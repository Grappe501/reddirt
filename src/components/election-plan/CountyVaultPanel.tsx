import Link from "next/link";
import type { CountyVaultListItem } from "@/lib/county-vault/types";

type Props = {
  countySlug: string;
  countyDisplayName: string;
  stats: { total: number; publicCount: number; withTranscript: number; videos: number };
  previewItems: CountyVaultListItem[];
  isOperator?: boolean;
};

export function CountyVaultPanel({ countySlug, countyDisplayName, stats, previewItems, isOperator }: Props) {
  const vaultHref = `/counties/${countySlug}/media`;

  return (
    <section
      id="county-media-vault"
      className="scroll-mt-24 rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-950 via-kelly-navy to-indigo-900 p-6 text-white shadow-lg"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-kelly-gold">County media vault</p>
          <h2 className="font-heading mt-2 text-2xl font-bold">{countyDisplayName} library</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75">
            Photos, videos, PDFs, and zip batches — AI transcripts beside every video, deep analysis, SEO-ready metadata.
            Upload when signed in; publish approved items to the public vault.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={vaultHref}
            className="rounded-lg bg-kelly-gold px-4 py-2 text-sm font-bold text-kelly-navy shadow hover:brightness-105"
          >
            Public vault ({stats.publicCount})
          </Link>
          {isOperator ? (
            <Link
              href={`/election-plan/counties/${countySlug.replace(/-county$/, "")}#county-media-vault`}
              className="rounded-lg border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Upload panel ↓
            </Link>
          ) : null}
        </div>
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Total assets" value={stats.total} />
        <Stat label="Published" value={stats.publicCount} />
        <Stat label="Videos" value={stats.videos} />
        <Stat label="Transcribed" value={stats.withTranscript} />
      </dl>

      {previewItems.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {previewItems.slice(0, 4).map((item) => (
            <li key={item.id}>
              <Link
                href={`/counties/${countySlug}/media/${item.id}`}
                className="block overflow-hidden rounded-xl border border-white/15 bg-black/20 transition hover:border-kelly-gold/50"
              >
                <div className="relative aspect-square">
                  {item.kind === "IMAGE" || item.kind === "VIDEO" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl opacity-60">📄</div>
                  )}
                </div>
                <p className="truncate p-2 text-xs font-medium text-white/90">{item.title}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-sm text-white/60">No published vault items yet — upload and approve to populate.</p>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/8 px-4 py-3">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-white/55">{label}</dt>
      <dd className="font-heading mt-1 text-2xl font-bold text-kelly-gold">{value.toLocaleString()}</dd>
    </div>
  );
}
