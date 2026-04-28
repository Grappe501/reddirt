"use client";

import { ASK_KELLY_CANDIDATE_INTEGRATION_STATUS } from "@/content/candidate-integration-status-copy";

function toneBadge(tone: "codepath" | "external" | "oauth"): { label: string; className: string } {
  switch (tone) {
    case "codepath":
      return { label: "Code rails", className: "bg-kelly-forest/12 text-kelly-navy/90" };
    case "oauth":
      return { label: "OAuth", className: "bg-kelly-blue/12 text-kelly-navy/90" };
    case "external":
      return { label: "Outside stack", className: "bg-kelly-text/10 text-kelly-text/70" };
    default:
      return { label: "", className: "" };
  }
}

export function AskKellyCandidateIntegrationStatus() {
  const { sectionTitle, sectionLead, rows } = ASK_KELLY_CANDIDATE_INTEGRATION_STATUS;

  return (
    <section
      aria-labelledby="candidate-integration-status-heading"
      className="rounded-xl border border-kelly-text/12 bg-kelly-text/[0.02] p-5 sm:p-6"
    >
      <h2 id="candidate-integration-status-heading" className="font-heading text-base font-bold text-kelly-navy sm:text-lg">
        {sectionTitle}
      </h2>
      <p className="mt-2 font-body text-xs leading-relaxed text-kelly-text/75">{sectionLead}</p>
      <ul className="mt-4 divide-y divide-kelly-text/10 rounded-lg border border-kelly-text/10 bg-[var(--color-surface-elevated)]">
        {rows.map((r) => {
          const b = toneBadge(r.tone);
          return (
            <li key={r.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-body text-sm font-semibold text-kelly-text">{r.label}</span>
                <span className={`rounded px-1.5 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide ${b.className}`}>
                  {b.label}
                </span>
              </div>
              <p className="max-w-xl font-body text-xs leading-relaxed text-kelly-text/78 sm:text-right">{r.line}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
