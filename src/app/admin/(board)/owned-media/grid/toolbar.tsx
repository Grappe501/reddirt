import Link from "next/link";
import type { OwnedMediaKind } from "@prisma/client";
import { COMMUNITY_TRAINING_TAG } from "@/lib/campaign-briefings/briefing-queries";

type BatchOpt = { id: string; label: string; started: string };

type Props = {
  defaultQ: string;
  size: "sm" | "md" | "lg";
  tag: string | null;
  batch: string | null;
  kind: OwnedMediaKind | null;
  batches: BatchOpt[];
  resultCount: number;
};

function buildHref(next: Record<string, string | null | undefined>): string {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) {
    if (v && v.length > 0) u.set(k, v);
  }
  const s = u.toString();
  return s ? `/admin/owned-media/grid?${s}` : "/admin/owned-media/grid";
}

export function OwnedMediaGridToolbar(props: Props) {
  const { defaultQ, size, tag, batch, kind, batches, resultCount } = props;
  const basePreserved = {
    q: defaultQ || undefined,
    tag: tag || undefined,
    batch: batch || undefined,
    kind: kind || undefined,
    size: size as string,
  };

  return (
    <div className="mt-4 space-y-3">
      <form method="get" action="/admin/owned-media/grid" className="flex flex-wrap items-end gap-3">
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Search</span>
          <input
            name="q"
            defaultValue={defaultQ}
            placeholder="Title, path, filename…"
            className="mt-0.5 w-[min(100vw-2rem,20rem)] rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 text-sm"
          />
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Tag</span>
          <input
            name="tag"
            defaultValue={tag ?? ""}
            placeholder={COMMUNITY_TRAINING_TAG}
            className="mt-0.5 w-48 rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 font-mono text-xs"
          />
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Ingest batch</span>
          <select
            name="batch"
            defaultValue={batch ?? ""}
            className="mt-0.5 max-w-[14rem] rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 text-xs"
          >
            <option value="">Any</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label} · {new Date(b.started).toLocaleDateString()}
              </option>
            ))}
          </select>
        </label>
        <label className="font-body text-sm">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-deep-soil/55">Kind</span>
          <select
            name="kind"
            defaultValue={kind ?? ""}
            className="mt-0.5 rounded-md border border-deep-soil/15 bg-white px-2 py-1.5 text-xs"
          >
            <option value="">Any</option>
            {(["IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "OTHER"] as const).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <input type="hidden" name="size" value={size} />
        <button
          type="submit"
          className="rounded-md bg-deep-soil px-3 py-1.5 font-body text-sm font-semibold text-cream-canvas"
        >
          Apply
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-body text-xs text-deep-soil/60">
          {resultCount} shown · cell size
        </span>
        {(
          [
            ["sm", "Small"],
            ["md", "Medium"],
            ["lg", "Large"],
          ] as const
        ).map(([s, label]) => (
          <Link
            key={s}
            href={buildHref({ ...basePreserved, size: s })}
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              size === s ? "bg-red-dirt text-cream-canvas" : "border border-deep-soil/20 text-deep-soil"
            }`}
          >
            {label}
          </Link>
        ))}
        <Link
          href={buildHref({ ...basePreserved, tag: COMMUNITY_TRAINING_TAG })}
          className="text-xs font-semibold text-civic-slate underline"
        >
          Filter: {COMMUNITY_TRAINING_TAG}
        </Link>
      </div>
    </div>
  );
}
