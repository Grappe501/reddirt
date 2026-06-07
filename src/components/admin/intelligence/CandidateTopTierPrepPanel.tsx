import Link from "next/link";
import type { TopTierPrepItem } from "@/lib/intelligence/v4/phase15P4TopTierSurfacing";

const KIND_LABEL: Record<TopTierPrepItem["kind"], string> = {
  briefing: "Philosophy briefing",
  depth: "Plain-language depth",
  psychology: "Psychology manual",
};

export function CandidateTopTierPrepPanel({ items }: { items: TopTierPrepItem[] }) {
  const briefings = items.filter((i) => i.kind === "briefing");
  const depth = items.filter((i) => i.kind === "depth");
  const psych = items.filter((i) => i.kind === "psychology");

  return (
    <div className="space-y-8">
      {(
        [
          ["Philosophy briefings — tier A", briefings],
          ["Plain-language depth — tier A", depth],
          ["Psychology manual — tier B promoted", psych],
        ] as const
      ).map(([title, rows]) => (
        <section key={title}>
          <h2 className="mb-3 font-heading text-lg font-bold text-kelly-navy">{title}</h2>
          <div className="space-y-3">
            {rows.map((item) => (
              <article key={item.id} className="rounded-xl border border-kelly-text/10 bg-white p-4 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-violet-950">
                      #{item.rank} · {KIND_LABEL[item.kind]} · tier {item.tier}
                    </p>
                    <Link href={item.href} className="mt-1 block font-bold text-kelly-navy underline">
                      {item.title}
                    </Link>
                  </div>
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-950">
                    ~{item.estimatedMinutes} min
                  </span>
                </div>
                <p className="mt-2 text-xs text-kelly-muted">{item.whyPromoted}</p>
                <p className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/40 p-2 text-xs italic text-kelly-text">
                  Rehearse out loud: {item.rehearseOutLoud.slice(0, 200)}
                  {item.rehearseOutLoud.length > 200 ? "…" : ""}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
