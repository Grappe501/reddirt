import Link from "next/link";
import type { StrategyDoctrineArtifactOverlay } from "@/lib/intelligence/v4/phase11P3StrategyDoctrineDepth";

export function StrategyDoctrineArtifactPanel({ overlay }: { overlay: StrategyDoctrineArtifactOverlay }) {
  return (
    <section className="mb-6 rounded-xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/50 to-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-amber-950">Phase 11 P3 overlay · SDI-1</p>
      <p className="mt-2 text-sm font-semibold text-kelly-navy">{overlay.strategicRole}</p>
      <p className="mt-2 rounded-lg border border-rose-200 bg-rose-50/80 px-3 py-2 text-[11px] text-rose-950">
        Review gate: {overlay.reviewGate}
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Debate application</h3>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {overlay.debateApplication.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-kelly-subtle">Alignment use</h3>
          <ul className="mt-1 list-inside list-disc text-xs text-kelly-muted">
            {overlay.alignmentUse.map((line) => (
              <li key={line.slice(0, 48)}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      {overlay.linkedRegistryDoctrineIds.length > 0 ? (
        <p className="mt-3 text-[10px] text-kelly-subtle">
          Registry IDs: {overlay.linkedRegistryDoctrineIds.join(", ")}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {overlay.intelligenceLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[10px] font-bold text-amber-950"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
