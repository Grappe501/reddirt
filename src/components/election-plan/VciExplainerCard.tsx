import { VCI_EXPLAINER } from "@/lib/election-plan/vci-explainer";
import { formatVotes } from "@/lib/election-plan/electionPlanData";

type Props = {
  compact?: boolean;
};

export function VciExplainerCard({ compact }: Props) {
  const e = VCI_EXPLAINER;

  if (compact) {
    return (
      <p className="text-xs leading-relaxed text-[var(--ep-navy-muted)]">
        <strong className="text-[var(--ep-navy)]">{e.fullName} ({e.acronym})</strong> — {e.oneLine}{" "}
        <span className="text-[10px]">(campaign planning score, not Election Day results)</span>
      </p>
    );
  }

  return (
    <div className="ep-card ep-priority-card mb-8">
      <h2 className="font-heading text-lg font-bold text-[var(--ep-navy)]">
        What is {e.fullName} ({e.acronym})?
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ep-navy-muted)]">{e.plainEnglish}</p>

      <div className="mt-4 rounded-md border border-[var(--ep-border)] bg-[var(--ep-cream)] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">{e.formulaLabel}</p>
        <p className="mt-2 font-mono text-sm text-[var(--ep-navy)]">{e.formula}</p>
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">{e.formulaNote}</p>
      </div>

      <p className="mt-4 text-sm text-[var(--ep-navy-muted)]">
        <strong className="text-[var(--ep-navy)]">Example:</strong> {e.example.county} ranks #{e.example.rank} with{" "}
        {formatVotes(e.example.vci)} VCI — {e.example.explanation}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">We use VCI to</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
            {e.uses.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">VCI is not</h3>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--ep-navy-muted)]">
            {e.notWhatItIs.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
