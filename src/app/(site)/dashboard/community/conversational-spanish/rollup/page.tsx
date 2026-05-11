import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conversational Spanish · Rollup",
  description: "Scaffold — regional KPI rollup pending DB wiring.",
};

export default function ConversationalSpanishRollupPage() {
  return (
    <div className="space-y-4 rounded-2xl border border-kelly-text/10 bg-white p-5 shadow-[var(--shadow-soft)]">
      <p className="font-heading text-lg font-bold text-kelly-navy">Rollup (scaffold)</p>
      <p className="font-body text-sm text-kelly-text/85">
        Cross-lane KPI rollup will mirror the Muslim Community rollup once registration and engagement metrics are defined with
        partners.
      </p>
    </div>
  );
}
