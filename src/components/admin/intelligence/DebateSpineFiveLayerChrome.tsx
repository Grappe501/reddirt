import Link from "next/link";
import type { FiveLayerPageDepth } from "@/lib/intelligence/v4/phase3DebateSpineDepth";

const LAYER_LABELS = [
  { id: "orientation", label: "1 · Orientation" },
  { id: "narrative", label: "2 · Narrative" },
  { id: "evidence", label: "3 · Evidence" },
  { id: "operator", label: "4 · Operator scripts" },
  { id: "gates", label: "5 · Gates" },
] as const;

const TIER_STYLE: Record<string, string> = {
  VERIFIED: "bg-emerald-100 text-emerald-900",
  NEEDS_REVIEW: "bg-amber-100 text-amber-900",
  RESEARCH_QUESTION: "bg-rose-100 text-rose-900",
};

export function DebateSpineFiveLayerChrome({
  depth,
  showStickyNav = true,
}: {
  depth: FiveLayerPageDepth;
  showStickyNav?: boolean;
}) {
  return (
    <div className="space-y-4">
      {showStickyNav ? (
        <nav
          aria-label="Five-layer briefing"
          className="sticky top-0 z-10 -mx-1 overflow-x-auto rounded-xl border border-indigo-200 bg-indigo-50/90 px-2 py-2 shadow-sm backdrop-blur"
        >
          <p className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[0.18em] text-indigo-950">
            Phase 3 · five-layer standard · {depth.audience} audience
          </p>
          <div className="flex flex-wrap gap-1.5">
            {LAYER_LABELS.map((l) => (
              <a
                key={l.id}
                href={`#five-layer-${depth.pageId}-${l.id}`}
                className="whitespace-nowrap rounded-full border border-indigo-300/60 bg-white px-2.5 py-1 text-[10px] font-bold text-indigo-950 hover:border-indigo-500"
              >
                {l.label}
              </a>
            ))}
            <Link
              href="/admin/intelligence/phase-3-upgrade"
              className="whitespace-nowrap rounded-full border border-kelly-gold/50 px-2.5 py-1 text-[10px] font-bold text-kelly-navy"
            >
              Phase 3 waves →
            </Link>
          </div>
        </nav>
      ) : null}

      <section
        id={`five-layer-${depth.pageId}-orientation`}
        className="rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-white p-5"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-950">Layer 1 — Orientation</p>
        <p className="mt-2 text-sm leading-relaxed text-kelly-text">{depth.orientation}</p>
      </section>

      <section id={`five-layer-${depth.pageId}-narrative`} className="rounded-xl border border-kelly-navy/15 bg-white p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-kelly-navy">Layer 2 — Narrative</p>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-kelly-text">
          {depth.narrativeParagraphs.map((p) => (
            <p key={p.slice(0, 48)}>{p}</p>
          ))}
        </div>
      </section>

      <section id={`five-layer-${depth.pageId}-evidence`} className="rounded-xl border border-amber-200 bg-amber-50/30 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-950">Layer 3 — Evidence table</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-amber-200 text-[10px] uppercase text-amber-900">
                <th className="py-2 pr-3">Claim</th>
                <th className="py-2 pr-3">Tier</th>
                <th className="py-2 pr-3">Source</th>
                <th className="py-2">Gate</th>
              </tr>
            </thead>
            <tbody>
              {depth.evidenceRows.map((row) => (
                <tr key={row.claim.slice(0, 40)} className="border-b border-amber-100 align-top">
                  <td className="py-2 pr-3 text-kelly-text">{row.claim}</td>
                  <td className="py-2 pr-3">
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${TIER_STYLE[row.tier]}`}>
                      {row.tier.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-kelly-muted">
                    {row.sourceHref ? (
                      <Link href={row.sourceHref} className="font-bold text-kelly-navy underline">
                        {row.sourceLabel}
                      </Link>
                    ) : (
                      row.sourceLabel
                    )}
                  </td>
                  <td className="py-2 text-[10px] text-rose-900">{row.gateNote ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id={`five-layer-${depth.pageId}-operator`} className="rounded-xl border border-violet-200 bg-violet-50/30 p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-950">Layer 4 — Operator scripts</p>
        <div className="mt-3 space-y-3">
          {depth.operatorScripts.map((script) => (
            <blockquote
              key={script.label + script.text.slice(0, 24)}
              className="rounded-lg border border-violet-100 bg-white p-4 text-sm leading-relaxed"
            >
              <p className="text-[10px] font-bold uppercase text-violet-900">{script.label}</p>
              <p className="mt-2 italic text-kelly-text">&ldquo;{script.text}&rdquo;</p>
              {script.deliveryNote ? (
                <p className="mt-2 text-[10px] text-violet-800">Delivery: {script.deliveryNote}</p>
              ) : null}
            </blockquote>
          ))}
        </div>
      </section>

      <section id={`five-layer-${depth.pageId}-gates`} className="rounded-xl border-2 border-rose-200 bg-rose-50/40 p-5 text-xs">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-950">Layer 5 — Gates</p>
        <dl className="mt-3 space-y-2">
          <div>
            <dt className="font-bold text-rose-900">Claims gate</dt>
            <dd className="mt-0.5 text-kelly-text">{depth.gates.claimsGate}</dd>
          </div>
          {depth.gates.diligenceFrame ? (
            <div>
              <dt className="font-bold text-amber-900">Diligence incomplete frame</dt>
              <dd className="mt-0.5 italic text-kelly-text">&ldquo;{depth.gates.diligenceFrame}&rdquo;</dd>
            </div>
          ) : null}
          {depth.gates.pakkoNote ? (
            <div>
              <dt className="font-bold text-sky-900">Pakko / three-way</dt>
              <dd className="mt-0.5 text-kelly-text">{depth.gates.pakkoNote}</dd>
            </div>
          ) : null}
        </dl>
      </section>
    </div>
  );
}
