import Link from "next/link";
import { computePhase11P8UpgradePass } from "@/lib/intelligence/v4/phase11P8Closure";
import { FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF } from "@/lib/intelligence/v4/phase11P8FieldBookPromotionExecutionDepth";

export function FieldBookPromotionExecutionStrip() {
  const pass = computePhase11P8UpgradePass();
  const p = pass.progress;

  return (
    <section className="mb-4 rounded-xl border border-amber-200/60 bg-amber-50/40 p-4 text-xs text-amber-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold uppercase tracking-wider">Phase 11 P8 · Promotion execution</p>
          <p className="mt-1 text-kelly-muted">
            {p.wavesAtBar}/{p.waveTotal} execution waves · {p.canonBindingCount} canon bindings — complete P5→P8
            pipeline after preview and briefing attach.
          </p>
        </div>
        <Link
          href={FIELD_BOOK_PROMOTION_EXECUTION_HUB_HREF}
          className="rounded-full border border-amber-400 bg-white px-3 py-1 text-[10px] font-bold text-amber-950"
        >
          Open execution hub
        </Link>
      </div>
    </section>
  );
}
