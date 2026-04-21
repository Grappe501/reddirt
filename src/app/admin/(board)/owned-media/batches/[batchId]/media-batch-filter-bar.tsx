"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { OwnedMediaKind, OwnedMediaReviewStatus } from "@prisma/client";

type Props = {
  batchId: string;
  current: {
    kind?: string;
    review?: string;
    public?: string;
    untagged?: string;
  };
};

function toQuery(current: {
  kind?: string;
  review?: string;
  public?: string;
  untagged?: string;
}): string {
  const n = new URLSearchParams();
  if (current.kind) n.set("kind", current.kind);
  if (current.review) n.set("review", current.review);
  if (current.public) n.set("public", current.public);
  if (current.untagged) n.set("untagged", current.untagged);
  const s = n.toString();
  return s ? `?${s}` : "";
}

export function MediaBatchFilterBar({ batchId, current }: Props) {
  const router = useRouter();
  const sp = useSearchParams();

  const go = (patch: Partial<typeof current>) => {
    const next = {
      kind: patch.kind !== undefined ? patch.kind : sp.get("kind") ?? current.kind,
      review: patch.review !== undefined ? patch.review : sp.get("review") ?? current.review,
      public: patch.public !== undefined ? patch.public : sp.get("public") ?? current.public,
      untagged: patch.untagged !== undefined ? patch.untagged : sp.get("untagged") ?? current.untagged,
    };
    const q = toQuery({
      kind: next.kind,
      review: next.review,
      public: next.public,
      untagged: next.untagged,
    });
    router.push(`/admin/owned-media/batches/${batchId}${q}`);
  };

  return (
    <section className="rounded-lg border border-deep-soil/10 bg-white/70 p-4 text-sm text-deep-soil">
      <h3 className="font-heading text-sm font-bold text-deep-soil">Filter</h3>
      <p className="mt-1 text-xs text-deep-soil/55">Narrow the grid; bulk actions still affect the full batch.</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-xs">
          Type
          <select
            className="ml-1 mt-0.5 block rounded border border-deep-soil/15 bg-white px-2 py-1"
            value={sp.get("kind") ?? current.kind ?? ""}
            onChange={(e) => go({ kind: e.target.value || undefined })}
          >
            <option value="">All kinds</option>
            {Object.values(OwnedMediaKind).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          Review
          <select
            className="ml-1 mt-0.5 block rounded border border-deep-soil/15 bg-white px-2 py-1"
            value={sp.get("review") ?? current.review ?? ""}
            onChange={(e) => go({ review: e.target.value || undefined })}
          >
            <option value="">All</option>
            {Object.values(OwnedMediaReviewStatus).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          Visibility
          <select
            className="ml-1 mt-0.5 block rounded border border-deep-soil/15 bg-white px-2 py-1"
            value={sp.get("public") ?? current.public ?? ""}
            onChange={(e) => go({ public: e.target.value || undefined })}
          >
            <option value="">All</option>
            <option value="1">Public</option>
            <option value="0">Private</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={(sp.get("untagged") ?? current.untagged) === "1"}
            onChange={(e) => go({ untagged: e.target.checked ? "1" : undefined })}
          />
          No county and no event
        </label>
        <Link
          href={`/admin/owned-media/batches/${batchId}`}
          className="rounded border border-deep-soil/20 bg-white px-2 py-1 text-xs font-semibold text-deep-soil"
        >
          Clear filters
        </Link>
      </div>
    </section>
  );
}
