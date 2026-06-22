import { EpInsightPanel } from "@/components/election-plan/ui/EpInsightPanel";

type Props = {
  summary: string;
  label?: string;
};

/** One-sentence orientation at the top of drill-down pages. */
export function KellyPageSummary({ summary, label = "In one sentence" }: Props) {
  return (
    <EpInsightPanel label={label}>
      <p>{summary}</p>
    </EpInsightPanel>
  );
}
