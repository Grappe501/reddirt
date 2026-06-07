import Link from "next/link";
import { computePhase11P9UpgradePass } from "@/lib/intelligence/v4/phase11P9Closure";
import { PHASE_11_STACK_CLOSURE_HUB_HREF } from "@/lib/intelligence/v4/phase11P9StackClosureDepth";

export function Phase11StackClosureStrip() {
  const pass = computePhase11P9UpgradePass();
  const p = pass.progress;

  return (
    <section className="mb-4 rounded-xl border border-indigo-200/60 bg-indigo-50/40 p-4 text-xs text-indigo-950">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold uppercase tracking-wider">Phase 11 P9 · Stack closure</p>
          <p className="mt-1 text-kelly-muted">
            {p.passesAtBar}/{p.passTotal} sub-passes at bar · stack {p.stackCompletionPct}% · debate feed{" "}
            {p.debatePhilosophyScore}%
          </p>
        </div>
        <Link
          href={PHASE_11_STACK_CLOSURE_HUB_HREF}
          className="rounded-full border border-indigo-400 bg-white px-3 py-1 text-[10px] font-bold text-indigo-950"
        >
          Stack closure hub
        </Link>
      </div>
    </section>
  );
}
