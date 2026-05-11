import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Marshallese · Rollup",
  description: "Scaffold — regional KPI rollup pending DB wiring.",
};

export default function MarshalleseRollupPage() {
  return (
    <div className="space-y-4 rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)]">
      <p className="font-heading text-lg font-bold text-kelly-navy">Rollup (scaffold)</p>
      <p className="font-body text-sm text-kelly-text/85">
        Cross-lane rollup for this region is not wired. County and statewide goal cards on Overview show public campaign clock
        context only.
      </p>
    </div>
  );
}
