/**
 * CM-2: thin Campaign Manager dashboard bands on `/admin/workbench`.
 * Read-only; consumes `getTruthSnapshot()` — see docs/campaign-manager-dashboard-bands.md.
 */
import Link from "next/link";
import type { TruthSnapshot } from "@/lib/campaign-engine/truth-snapshot";
import type { TruthClassId } from "@/lib/campaign-engine/truth";

export const CM2_PACKET = "CM-2" as const;

const bandBox = "rounded-md border border-deep-soil/10 bg-cream-canvas/90 px-2 py-1.5 shadow-sm";
const h2 = "font-heading text-[10px] font-bold uppercase tracking-wider text-deep-soil/55";
const h3 = "font-heading text-[9px] font-bold uppercase tracking-wide text-deep-soil/45";

type Props = { snapshot: TruthSnapshot };

function statusStyle(status: string): string {
  const base = "rounded px-1 py-0.5 text-[9px] font-bold uppercase";
  if (status === "good") return `${base} bg-emerald-100/90 text-emerald-900`;
  if (status === "partial") return `${base} bg-amber-100/90 text-amber-950`;
  if (status === "missing") return `${base} bg-deep-soil/10 text-deep-soil/80`;
  return `${base} bg-washed-denim/15 text-civic-slate`;
}

function truthClassHint(tc: TruthClassId): string {
  switch (tc) {
    case "AUTHORITATIVE":
      return "Truth: authoritative";
    case "MIRRORED":
      return "Truth: mirrored";
    case "INFERRED":
      return "Truth: inferred (heuristic)";
    case "PROVISIONAL":
      return "Truth: provisional";
    case "STALE":
      return "Truth: stale signal";
    case "UNAPPROVED_FOR_AI":
      return "Governance: not AI-approved";
    default:
      return `Truth: ${tc}`;
  }
}

const TRUTH_KEYS: (keyof TruthSnapshot["truth"])[] = [
  "countyGoals",
  "electionData",
  "complianceDocs",
  "seatCoverage",
  "budgetState",
  "openWork",
];

type DivisionRow = {
  division: string;
  maturity: string;
  primaryHref: string;
  linkLabel: string;
  openWorkLine: string | null;
  gapNote: string;
};

function divisionRowsFromSnapshot(s: TruthSnapshot): DivisionRow[] {
  const c = s.openWorkCounts;
  const sum = (keys: (keyof typeof c)[]) => keys.reduce((a, k) => a + c[k], 0);

  return [
    {
      division: "Campaign Manager",
      maturity: "Partially implemented",
      primaryHref: "/admin/workbench",
      linkLabel: "Hub",
      openWorkLine: `UWR-2 open (global): ${sum(["emailWorkflowItem", "workflowIntake", "campaignTask", "communicationThread", "arkansasFestivalIngest"])}`,
      gapNote: "No DB unified index; triage is merged read + deep links.",
    },
    {
      division: "Communications",
      maturity: "Strong",
      primaryHref: "/admin/workbench/comms",
      linkLabel: "Comms",
      openWorkLine: `Email queue + threads (global): ${c.emailWorkflowItem + c.communicationThread}`,
      gapNote: "COMMS-UNIFY-1: intent→execution metadata still fragmented.",
    },
    {
      division: "Field / Organizing",
      maturity: "Partially implemented",
      primaryHref: "/admin/workbench/festivals",
      linkLabel: "Festivals",
      openWorkLine: `Intake + tasks + festival pending: ${c.workflowIntake + c.campaignTask + c.arkansasFestivalIngest}`,
      gapNote: "FieldUnit↔County hard link still missing (GEO-1).",
    },
    {
      division: "Data / Research",
      maturity: "Partially implemented",
      primaryHref: "/admin/voter-import",
      linkLabel: "Voter import",
      openWorkLine: null,
      gapNote:
        s.truth.electionData.status === "missing"
          ? "Election results not in Prisma (DATA-4); JSON on disk only."
          : "See Truth band for goals + mirror.",
    },
    {
      division: "Finance / Fundraising",
      maturity: "Foundation → partial",
      primaryHref: "/admin/budgets",
      linkLabel: "Budgets",
      openWorkLine: null,
      gapNote: s.truth.budgetState.note ?? "Ledger + budgets; no fundraising desk route.",
    },
    {
      division: "Compliance",
      maturity: "Foundation → partial",
      primaryHref: "/admin/compliance-documents",
      linkLabel: "Documents",
      openWorkLine: null,
      gapNote: s.truth.complianceDocs.note ?? "COMP-1 rules engine not built.",
    },
    {
      division: "Talent / Training",
      maturity: "Conceptual + types",
      primaryHref: "/admin/workbench/positions",
      linkLabel: "Positions",
      openWorkLine: null,
      gapNote: "TALENT-1: no observation log or training UI in repo.",
    },
    {
      division: "Youth",
      maturity: "Conceptual",
      primaryHref: "/admin/workbench",
      linkLabel: "Hub",
      openWorkLine: null,
      gapNote: "YOUTH-1: program UI and routing not shipped.",
    },
  ];
}

export function CampaignManagerDashboardBands({ snapshot }: Props) {
  const wg = snapshot.health.warningGroups;
  const divisions = divisionRowsFromSnapshot(snapshot);

  return (
    <div className="mx-2 mb-2 space-y-2 md:mx-3">
      <section className={bandBox} aria-label="Truth and health">
        <p className={h2}>Truth + health (BRAIN-OPS snapshot)</p>
        <p className="mt-0.5 font-body text-[9px] text-deep-soil/55">
          Generated {snapshot.generatedAt.toISOString()} · read-only aggregate ·{" "}
          <span className="font-semibold text-deep-soil/70">CM-2</span>
        </p>
        <div className="mt-1.5 grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
          {TRUTH_KEYS.map((k) => {
            const m = snapshot.truth[k];
            return (
              <div
                key={k}
                className="rounded border border-deep-soil/8 bg-white/70 px-1.5 py-1 text-[10px] leading-snug"
              >
                <div className="flex flex-wrap items-center gap-1">
                  <span className="font-semibold text-deep-soil">{m.label}</span>
                  <span className={statusStyle(m.status)}>{m.status}</span>
                </div>
                <p className="mt-0.5 text-deep-soil/75">{m.note}</p>
                <p className="mt-0.5 font-mono text-[8px] text-deep-soil/50">{truthClassHint(m.truthClass)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className={bandBox} aria-label="Health warnings">
        <p className={h2}>Health warnings (grouped)</p>
        <div className="mt-1 grid gap-1.5 md:grid-cols-2 lg:grid-cols-3">
          {(
            [
              ["Goals", wg.goals],
              ["Compliance", wg.compliance],
              ["Finance", wg.finance],
              ["Seats", wg.seats],
              ["Pipeline", wg.pipeline],
              ["Other", wg.other],
            ] as const
          ).map(([label, items]) => (
            <div key={label}>
              <p className={h3}>{label}</p>
              {items.length === 0 ? (
                <p className="font-body text-[10px] text-deep-soil/45">None in this group.</p>
              ) : (
                <ul className="list-inside list-disc font-body text-[10px] text-deep-soil/80">
                  {items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={bandBox} aria-label="Governance hints">
        <p className={h2}>Governance posture</p>
        <div className="mt-1 grid gap-1.5 md:grid-cols-3">
          <div>
            <p className={h3}>Review required</p>
            {snapshot.governance.reviewRequired.length === 0 ? (
              <p className="font-body text-[10px] text-deep-soil/45">None listed.</p>
            ) : (
              <ul className="list-inside list-disc font-body text-[10px] text-amber-950">
                {snapshot.governance.reviewRequired.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <p className={h3}>Advisory only</p>
            <ul className="list-inside list-disc font-body text-[10px] text-deep-soil/75">
              {snapshot.governance.advisoryOnly.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className={h3}>Blocked</p>
            {snapshot.governance.blocked.length === 0 ? (
              <p className="font-body text-[10px] text-deep-soil/45">None listed (empty is normal).</p>
            ) : (
              <ul className="list-inside list-disc font-body text-[10px] text-red-900">
                {snapshot.governance.blocked.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className={bandBox} aria-label="Division command grid">
        <p className={h2}>Division command grid (thin)</p>
        <p className="mt-0.5 font-body text-[9px] text-deep-soil/55">
          Maturity from <code className="rounded bg-deep-soil/5 px-0.5">system-maturity-map.md</code>; open-work lines
          use global UWR-2 counts, not per-seat roll-ups.
        </p>
        <div className="mt-1 overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse font-body text-[10px]">
            <thead>
              <tr className="border-b border-deep-soil/15 text-left text-[9px] uppercase text-deep-soil/50">
                <th className="py-1 pr-2 font-semibold">Division</th>
                <th className="py-1 pr-2 font-semibold">Maturity</th>
                <th className="py-1 pr-2 font-semibold">Open work hint</th>
                <th className="py-1 pr-2 font-semibold">Gap / note</th>
                <th className="py-1 font-semibold">Link</th>
              </tr>
            </thead>
            <tbody>
              {divisions.map((d) => (
                <tr key={d.division} className="border-b border-deep-soil/8 align-top">
                  <td className="py-1 pr-2 font-semibold text-deep-soil">{d.division}</td>
                  <td className="py-1 pr-2 text-deep-soil/75">{d.maturity}</td>
                  <td className="py-1 pr-2 text-deep-soil/80">
                    {d.openWorkLine ?? <span className="text-deep-soil/45">—</span>}
                  </td>
                  <td className="py-1 pr-2 text-deep-soil/70">{d.gapNote}</td>
                  <td className="py-1">
                    <Link href={d.primaryHref} className="font-semibold text-civic-slate hover:underline">
                      {d.linkLabel}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
