type Props = {
  warnings: string[];
  escalation?: string;
};

export function CopilotRiskWarningCard({ warnings, escalation }: Props) {
  if (!warnings.length) return null;
  return (
    <div className="rounded-xl border border-amber-700/25 bg-amber-50/80 p-3 text-sm text-amber-950">
      <p className="text-[10px] font-bold uppercase">Risk & gates</p>
      <ul className="mt-1 space-y-1 text-xs">
        {warnings.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>
      {escalation ? <p className="mt-2 text-xs"><strong>Escalate:</strong> {escalation}</p> : null}
    </div>
  );
}
