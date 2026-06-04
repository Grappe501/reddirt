import type { V4LikelyArgument, V4RebuttalCard } from "@/lib/intelligence/v4/debateIntelligenceV4Types";

export function V4ArgumentMap({
  arguments: args,
  rebuttals,
}: {
  arguments: V4LikelyArgument[];
  rebuttals: V4RebuttalCard[];
}) {
  const norm = (s: string) => s.toLowerCase().replaceAll("_", " ");
  const rebuttalByPrompt = new Map(rebuttals.map((r) => [norm(r.prompt), r]));
  return (
    <div className="space-y-3">
      {args.map((arg) => {
        const rebuttal = rebuttalByPrompt.get(norm(arg.id));
        return (
          <div key={arg.id} className="rounded-xl border border-kelly-text/10 bg-white p-4">
            <p className="text-[10px] font-bold uppercase text-rose-900">Likely: {arg.id.replaceAll("_", " ")}</p>
            <p className="mt-1 text-sm font-semibold text-kelly-text">{arg.argument}</p>
            <p className="mt-2 text-xs text-kelly-muted">May cite: {arg.evidenceHeMayCite.join(" · ")}</p>
            {rebuttal ? (
              <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 text-xs">
                <p>
                  <span className="font-bold text-emerald-900">Agree:</span> {rebuttal.agreeWhereValid}
                </p>
                <p className="mt-1">
                  <span className="font-bold text-emerald-900">Contrast:</span> {rebuttal.contrastMethod}
                </p>
                <p className="mt-1">
                  <span className="font-bold text-emerald-900">Bridge:</span> {rebuttal.kellyBridge}
                </p>
                <p className="mt-1 text-[10px] uppercase text-kelly-subtle">{rebuttal.evidenceStatus}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
