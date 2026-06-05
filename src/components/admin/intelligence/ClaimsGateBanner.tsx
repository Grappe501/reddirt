import { claimsGateStageLabel, classifyClaimsGate, isClaimsGateStageBlocked } from "@/lib/intelligence/v4/claimsGatePolicy";

const STYLE: Record<string, string> = {
  clear: "border-emerald-200 bg-emerald-50/50 text-emerald-950",
  review: "border-amber-200 bg-amber-50/50 text-amber-950",
  research_only: "border-rose-300 bg-rose-50/70 text-rose-950",
  blocked: "border-rose-400 bg-rose-100/80 text-rose-950",
};

export function ClaimsGateBanner({ claimsGate }: { claimsGate: string }) {
  const severity = classifyClaimsGate(claimsGate);
  const blocked = isClaimsGateStageBlocked(claimsGate);

  return (
    <p className={`rounded-lg border p-3 text-[10px] font-bold ${STYLE[severity] ?? STYLE.review}`}>
      {blocked ? "Stage lock — " : ""}
      {claimsGateStageLabel(claimsGate)}: {claimsGate}
    </p>
  );
}
