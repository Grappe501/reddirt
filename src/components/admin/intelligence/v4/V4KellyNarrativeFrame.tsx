import { KELLY_MASTER_FRAME } from "@/lib/intelligence/v4/debateOperatorNarratives";

export function V4KellyNarrativeFrame() {
  return (
    <section className="mb-6 rounded-xl border border-emerald-200/50 bg-emerald-50/40 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">Your narrative spine</p>
      <p className="mt-2 font-heading text-lg font-bold text-emerald-950">{KELLY_MASTER_FRAME.headline}</p>
      <p className="mt-3 text-sm text-emerald-950/90">
        Hammer will sound certain because he cites bills. You win by sounding clearer: what changed in law, who carries the
        burden (counties and voters), and what kind of Secretary of State Arkansas needs — a service office that helps
        election workers implement rules fairly, not a legislator who keeps adding duties without support.
      </p>
      <p className="mt-3 text-xs font-semibold text-emerald-900">Answer architecture (use on every substantive question)</p>
      <p className="mt-1 text-xs text-emerald-950">{KELLY_MASTER_FRAME.answerArchitecture}</p>
    </section>
  );
}
