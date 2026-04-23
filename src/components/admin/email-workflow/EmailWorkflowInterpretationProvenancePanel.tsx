import type { ReactNode } from "react";

type Provenance = {
  version?: number;
  interpretedAt?: string;
  sourceKinds?: string[];
  engineId?: string;
  overwrittenFields?: string[];
  preservedOperatorFields?: string[];
  forwardHooks?: unknown;
  notes?: string;
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return x != null && typeof x === "object" && !Array.isArray(x);
}

/**
 * Compact operator view of `metadataJson.emailWorkflowInterpretation` (E-2B+).
 * Avoids a wall of raw JSON for triage; full JSON remains on the page in dev/debug.
 */
export function EmailWorkflowInterpretationProvenancePanel({ data }: { data: unknown }) {
  if (!isRecord(data)) {
    return <p className="text-xs text-deep-soil/55">No interpretation block.</p>;
  }
  const p = data as Provenance;
  const rows: { label: string; value: ReactNode }[] = [
    { label: "Engine", value: p.engineId ?? "—" },
    { label: "Run at", value: p.interpretedAt ?? "—" },
    {
      label: "Sources",
      value: p.sourceKinds?.length ? p.sourceKinds.join(", ") : "—",
    },
    {
      label: "Updated fields",
      value: p.overwrittenFields?.length ? p.overwrittenFields.join(", ") : "—",
    },
    {
      label: "Left unchanged (protected)",
      value: p.preservedOperatorFields?.length ? p.preservedOperatorFields.join(", ") : "—",
    },
  ];

  return (
    <div className="space-y-1.5 text-xs text-deep-soil/85">
      <dl className="grid gap-1">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[7.5rem_1fr] gap-1 sm:grid-cols-[8.5rem_1fr]">
            <dt className="text-[10px] font-bold uppercase text-deep-soil/50">{r.label}</dt>
            <dd className="min-w-0 break-words font-body text-deep-soil/90">{r.value}</dd>
          </div>
        ))}
      </dl>
      {p.forwardHooks != null ? (
        <details className="rounded border border-deep-soil/10 bg-white/60 p-1.5 text-[10px] text-deep-soil/70">
          <summary className="cursor-pointer font-semibold text-deep-soil/60">Forward hooks (E-3 / E-4)</summary>
          <pre className="mt-1 max-h-24 overflow-auto whitespace-pre-wrap break-all">{JSON.stringify(p.forwardHooks, null, 2)}</pre>
        </details>
      ) : null}
    </div>
  );
}
