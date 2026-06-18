"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { CountyVaultListItem, CountyVaultSort } from "@/lib/county-vault/types";

const kindLabel: Record<string, string> = {
  IMAGE: "Photo",
  VIDEO: "Video",
  AUDIO: "Audio",
  DOCUMENT: "Document",
  OTHER: "Media",
};

type Props = {
  countySlug: string;
  countyDisplayName: string;
  items: CountyVaultListItem[];
  initialSort: CountyVaultSort;
  initialKind?: string;
  initialQ?: string;
};

export function CountyVaultLibrary({
  countySlug,
  countyDisplayName,
  items,
  initialSort,
  initialKind,
  initialQ,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  function pushFilters(next: { sort?: CountyVaultSort; kind?: string; q?: string }) {
    const params = new URLSearchParams(sp?.toString() ?? "");
    if (next.sort) params.set("sort", next.sort);
    if (next.kind !== undefined) {
      if (next.kind) params.set("kind", next.kind);
      else params.delete("kind");
    }
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    router.push(`/counties/${countySlug}/media?${params.toString()}`);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-kelly-text/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-kelly-gold">Media vault</p>
          <h1 className="font-heading mt-1 text-3xl font-bold text-kelly-navy md:text-4xl">{countyDisplayName}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-kelly-text/75">
            Photos, videos, and field moments from {countyDisplayName} — searchable transcripts, AI summaries, and
            download-ready files from Kelly&apos;s county organizing work.
          </p>
        </div>
        <Link
          href={`/counties/${countySlug}`}
          className="text-sm font-semibold text-kelly-navy underline-offset-2 hover:underline"
        >
          ← Back to county command
        </Link>
      </div>

      <form
        className="mt-8 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          pushFilters({
            sort: (fd.get("sort") as CountyVaultSort) || initialSort,
            kind: String(fd.get("kind") ?? ""),
            q: String(fd.get("q") ?? "").trim(),
          });
        }}
      >
        <label className="text-sm">
          <span className="font-medium">Search</span>
          <input
            name="q"
            defaultValue={initialQ ?? ""}
            placeholder="Title, topic, keyword…"
            className="mt-1 block w-48 rounded-lg border border-kelly-text/15 px-3 py-2 sm:w-64"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Kind</span>
          <select name="kind" defaultValue={initialKind ?? ""} className="mt-1 block rounded-lg border border-kelly-text/15 px-3 py-2">
            <option value="">All</option>
            <option value="IMAGE">Photos</option>
            <option value="VIDEO">Videos</option>
            <option value="AUDIO">Audio</option>
            <option value="DOCUMENT">Documents</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="font-medium">Sort</span>
          <select name="sort" defaultValue={initialSort} className="mt-1 block rounded-lg border border-kelly-text/15 px-3 py-2">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A–Z</option>
            <option value="kind">By type</option>
          </select>
        </label>
        <button type="submit" className="rounded-lg bg-kelly-navy px-4 py-2 text-sm font-semibold text-white">
          Apply
        </button>
      </form>

      {items.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-kelly-text/20 bg-kelly-wash/50 p-10 text-center text-sm text-kelly-text/70">
          No published media in this county vault yet. Check back as field teams upload and approve content.
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={`/counties/${countySlug}/media/${item.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-kelly-text/10 bg-white shadow-sm transition hover:border-kelly-navy/30 hover:shadow-elevated"
              >
                <div className="relative aspect-video bg-gradient-to-br from-kelly-navy/10 to-kelly-gold/10">
                  {item.kind === "IMAGE" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.previewUrl} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
                  ) : item.kind === "VIDEO" ? (
                    <video src={item.previewUrl} className="h-full w-full object-cover" muted preload="metadata" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl opacity-40">
                      {item.kind === "DOCUMENT" ? "📄" : item.kind === "AUDIO" ? "🎙" : "📁"}
                    </div>
                  )}
                  <span className="absolute left-3 top-3 rounded-full bg-kelly-navy/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                    {kindLabel[item.kind] ?? item.kind}
                  </span>
                  {item.hasTranscript ? (
                    <span className="absolute right-3 top-3 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-[10px] font-bold uppercase text-white">
                      Transcript
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="font-heading line-clamp-2 text-lg font-bold text-kelly-navy group-hover:text-kelly-slate">
                    {item.seoTitle ?? item.title}
                  </h2>
                  {item.summary ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-kelly-text/75">{item.summary}</p>
                  ) : item.transcriptExcerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm italic text-kelly-text/60">&ldquo;{item.transcriptExcerpt}&rdquo;</p>
                  ) : null}
                  <div className="mt-auto flex flex-wrap gap-2 pt-4 text-xs text-kelly-muted">
                    {item.city ? <span>{item.city}</span> : null}
                    {item.capturedAt ? (
                      <span>{new Date(item.capturedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</span>
                    ) : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
