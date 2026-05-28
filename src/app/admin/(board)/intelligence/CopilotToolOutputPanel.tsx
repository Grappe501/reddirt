import type { CopilotToolOutput } from "@/lib/intelligence/aiCopilotOrchestrator";

export function CopilotToolOutputPanel({ output }: { output: CopilotToolOutput }) {
  return (
    <section className="mb-4 rounded-xl border border-violet-200/50 bg-violet-50/40 p-4 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-heading text-sm font-bold text-violet-950">{output.title}</h3>
        <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
          {output.draftStatus}
        </span>
        <span className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-900">
          {output.publicationSafety}
        </span>
      </div>
      <p className="mt-1 text-[10px] text-violet-900">{output.safeUseLabel}</p>
      {output.sections.map((section) => (
        <div key={section.heading} className="mt-3">
          <p className="font-semibold text-violet-950">{section.heading}</p>
          <ul className="mt-1 list-inside list-disc text-violet-900">
            {section.bullets.map((bullet) => (
              <li key={bullet.slice(0, 48)}>{bullet}</li>
            ))}
          </ul>
        </div>
      ))}
      <p className="mt-3 font-semibold text-violet-950">Evidence / citation status</p>
      <ul className="list-inside list-disc text-violet-900">
        {output.claimCitationStatus.slice(0, 4).map((line) => (
          <li key={line.slice(0, 48)}>{line}</li>
        ))}
      </ul>
      <p className="mt-2 font-semibold text-rose-800">Risk warnings</p>
      <ul className="list-inside list-disc text-rose-900">
        {output.riskWarnings.map((line) => (
          <li key={line.slice(0, 48)}>{line}</li>
        ))}
      </ul>
      <p className="mt-2 text-[10px] text-violet-900">
        Operator next action: {output.operatorNextAction}
      </p>
    </section>
  );
}
