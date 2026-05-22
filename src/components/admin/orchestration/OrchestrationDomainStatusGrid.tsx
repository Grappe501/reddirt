import Link from "next/link";
import type { CampaignState } from "@/lib/agents/orchestration/campaign-state-types";
import { ORCHESTRATION_DOMAINS } from "@/lib/agents/orchestration/orchestration-domains";
import type { OrchestrationSourceHealth } from "@/lib/agents/orchestration/orchestration-source-health";

const BAND_DOT: Record<string, string> = {
  strong: "bg-emerald-500",
  stable: "bg-blue-500",
  weak: "bg-amber-500",
  critical: "bg-red-500",
};

function missingSignalForDomain(domainId: string, sources: OrchestrationSourceHealth[]): string | null {
  const map: Record<string, string> = {
    county: "county",
    communications: "communications",
    volunteer: "communications",
    finance: "os_control",
    reimbursement: "os_control",
    event_planning: "events_dashboard",
    calendar: "events_dashboard",
    memory: "observations",
    tool_builder: "tool_builder",
  };
  const sid = map[domainId];
  if (!sid) return null;
  const sh = sources.find((s) => s.sourceId === sid);
  if (sh && sh.status !== "ready") return `${sh.label}: ${sh.status}`;
  return null;
}

export function OrchestrationDomainStatusGrid({
  campaignState,
  sourceHealth,
}: {
  campaignState: CampaignState;
  sourceHealth: OrchestrationSourceHealth[];
}) {
  const domains = ORCHESTRATION_DOMAINS;

  return (
    <section className="rounded-2xl border p-5">
      <h2 className="text-sm font-bold text-kelly-navy">Domain status grid (20 domains)</h2>
      <p className="mt-1 text-xs text-kelly-muted">What the AI currently understands per orchestration domain.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((spec) => {
          const slice = campaignState.domainStatuses[spec.id];
          const missing = missingSignalForDomain(spec.id, sourceHealth);
          return (
            <div key={spec.id} className="rounded-lg border bg-white p-3">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${BAND_DOT[slice?.band ?? "weak"]}`} />
                <p className="text-xs font-bold text-kelly-navy">{spec.label}</p>
                <span className="ml-auto text-[10px] font-bold uppercase text-kelly-muted">{slice?.band ?? "—"}</span>
              </div>
              <p className="mt-2 text-[11px] text-kelly-muted">{slice?.summary ?? "No signal"}</p>
              <p className="mt-1 text-[10px] text-kelly-subtle">Score {slice?.score ?? 0}/100</p>
              {missing ? <p className="mt-1 text-[10px] font-bold text-amber-900">Missing: {missing}</p> : null}
              {spec.keyRoutes[0] ? (
                <Link href={spec.keyRoutes[0]} className="mt-1 inline-block text-[10px] font-bold underline">
                  Open domain →
                </Link>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
