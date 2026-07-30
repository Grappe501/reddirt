"use client";

import Link from "next/link";

type Props = {
  kind: "photo" | "speech";
  assetId: string;
  title?: string;
  surfaces: string[];
  shipHref?: string;
};

/** Round C — read-only “where this will appear” chip strip. */
export function EvidencePublicSurfacePreview({
  kind,
  assetId,
  title,
  surfaces,
  shipHref = "/admin/evidence-workbench?tab=publish#ew-ship-last-mile",
}: Props) {
  return (
    <div className="rounded-lg border-2 border-[#000066]/20 bg-white p-3 text-[#12124a]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="font-heading text-xs font-bold uppercase tracking-wide text-[#000066]">
            Where this will appear
          </p>
          <p className="mt-1 font-mono text-[10px] text-[#364272]">
            {kind} · {assetId}
            {title ? ` · ${title}` : ""}
          </p>
        </div>
        <Link href={shipHref} className="font-body text-[11px] font-semibold text-[#000066] underline">
          Ship last mile →
        </Link>
      </div>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {surfaces.map((s) => (
          <li
            key={s}
            className="rounded border border-[#8eb6dc]/50 bg-[#f4f7fc] px-2 py-1 font-body text-[10px] font-semibold text-[#12124a]"
          >
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
