type Props = {
  summary: string;
  label?: string;
};

/** One-sentence orientation at the top of drill-down pages. */
export function KellyPageSummary({ summary, label = "In one sentence" }: Props) {
  return (
    <article className="ep-card mb-6 border-l-4 border-[var(--ep-gold)] bg-[var(--ep-cream)]/50 p-4 text-sm">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[var(--ep-gold)]">{label}</p>
      <p className="mt-2 leading-relaxed text-[var(--ep-navy)]">{summary}</p>
    </article>
  );
}
