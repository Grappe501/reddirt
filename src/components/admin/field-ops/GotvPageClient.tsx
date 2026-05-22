"use client";

import { useMemo, useState } from "react";

import type { GotvCommitmentAllocationFile, GotvCommitmentAllocationRow } from "@/lib/field-ops/gotv-commitment-types";
import type { StagedGotvCommitmentCard } from "@/lib/field-ops/staged-gotv-cards";

const TABS = [
  { id: "targets", label: "Commitment targets" },
  { id: "cards", label: "Commitment cards" },
  { id: "automation", label: "Automation queue" },
  { id: "house-parties", label: "House parties" },
  { id: "local-guides", label: "Local guides" },
  { id: "phone", label: "Phone bank capacity" },
  { id: "postcards", label: "Postcard capacity" },
  { id: "fundraising", label: "Fundraising support" },
  { id: "needs-data", label: "Needs data" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function filterRows(tab: TabId, rows: GotvCommitmentAllocationRow[]): GotvCommitmentAllocationRow[] {
  const copy = [...rows];
  switch (tab) {
    case "house-parties":
      return copy.sort((a, b) => b.housePartyGoal - a.housePartyGoal);
    case "local-guides":
      return copy.filter((r) => r.localGuideNeed > 0).sort((a, b) => b.localGuideNeed - a.localGuideNeed);
    case "phone":
      return copy.sort((a, b) => b.phoneBankCapacityHours - a.phoneBankCapacityHours);
    case "postcards":
      return copy.sort((a, b) => b.postcardCapacityEstimate - a.postcardCapacityEstimate);
    case "fundraising":
      return copy.sort((a, b) => (b.fundraisingSupportGoal ?? 0) - (a.fundraisingSupportGoal ?? 0));
    case "needs-data":
      return copy.filter((r) => r.missingData.length > 0).sort((a, b) => b.missingData.length - a.missingData.length);
    default:
      return copy.sort((a, b) => b.commitmentGap - a.commitmentGap);
  }
}

export function GotvPageClient({
  allocation,
  stagedCards,
}: {
  allocation: GotvCommitmentAllocationFile | null;
  stagedCards: StagedGotvCommitmentCard[];
}) {
  const [active, setActive] = useState<TabId>("targets");
  const rows = useMemo(() => (allocation ? filterRows(active, allocation.counties) : []), [active, allocation]);

  if (!allocation) {
    return (
      <div className="rounded-lg border border-amber-500/50 bg-amber-50 px-4 py-4 font-body text-sm text-amber-950">
        Run <code className="rounded bg-white px-1">npm run fieldops:gotv-allocation:build</code> to create the allocation JSON.
      </div>
    );
  }

  const currentPct = Math.min(100, Math.round((allocation.statewide.currentCommitments / allocation.statewide.commitmentGoal) * 100));

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-emerald-800/20 bg-emerald-50 px-4 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-heading text-[10px] font-bold uppercase tracking-wide text-emerald-900/70">Statewide GOTV commitment goal</p>
            <h2 className="font-heading text-2xl font-bold text-kelly-text">
              {allocation.statewide.currentCommitments.toLocaleString()} / {allocation.statewide.commitmentGoal.toLocaleString()}
            </h2>
            <p className="font-body text-xs text-kelly-muted">
              Gap {allocation.statewide.commitmentGap.toLocaleString()} · estimated relational coverage{" "}
              {allocation.statewide.estimatedRelationalCoverage.toLocaleString()} people
            </p>
          </div>
          <p className="font-body text-xs text-kelly-muted">Message: “{allocation.commitmentMessage}”</p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
          <div className="h-full rounded-full bg-emerald-700" style={{ width: `${currentPct}%` }} />
        </div>
      </section>

      <div className="flex flex-wrap gap-1 border-b border-kelly-text/10 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`rounded-full px-3 py-1 font-body text-[10px] font-bold uppercase ${
              active === t.id ? "bg-kelly-navy text-white" : "border border-kelly-text/15 bg-white text-kelly-text/80 hover:bg-kelly-wash"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === "cards" ? (
        <section className="rounded-lg border border-kelly-text/12 bg-white px-4 py-3">
          <p className="font-heading text-sm font-bold text-kelly-text">Staged commitment cards ({stagedCards.length})</p>
          <ul className="mt-2 divide-y divide-kelly-text/10 font-body text-xs text-kelly-text/80">
            {stagedCards.map((c) => (
              <li key={c.id} className="py-2">
                <p className="font-semibold">{c.name} · {c.county} · {c.zip}</p>
                <p className="text-kelly-muted">Opt-ins: email={String(c.optInEmail)} sms={String(c.optInSms)} phone={String(c.optInPhone)} · ways: {c.waysToHelp.join(", ") || "—"}</p>
              </li>
            ))}
            {stagedCards.length === 0 ? <li className="py-2 text-kelly-subtle">No staged fallback cards on disk.</li> : null}
          </ul>
        </section>
      ) : active === "automation" ? (
        <section className="rounded-lg border border-kelly-text/12 bg-white px-4 py-3">
          <p className="font-heading text-sm font-bold text-kelly-text">Automation recommendations (staged, not sent)</p>
          <div className="mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 font-body text-xs text-amber-950">
            Prepare-only queue: every email/SMS/phone item must show opt-in, STOP/unsubscribe support, source of consent,
            human approval, suppression-list check, and owner before any future sending integration.
          </div>
          <p className="mt-3 font-body text-xs text-kelly-muted">
            Source file: <code className="rounded bg-kelly-wash px-1">data/field-ops/automation-recommendations.staged.json</code>
          </p>
        </section>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-kelly-text/12 bg-white shadow-sm">
          <table className="min-w-[1180px] w-full border-collapse font-body text-[11px] text-kelly-text">
            <thead>
              <tr className="border-b border-kelly-text/10 bg-kelly-wash/50 text-left text-[9px] font-bold uppercase tracking-wide text-kelly-muted">
                <th className="px-2 py-2">County</th>
                <th className="px-2 py-2">Target</th>
                <th className="px-2 py-2">Current</th>
                <th className="px-2 py-2">Gap</th>
                <th className="px-2 py-2">Target %</th>
                <th className="px-2 py-2">Formula</th>
                <th className="px-2 py-2">House parties</th>
                <th className="px-2 py-2">Relational coverage</th>
                <th className="px-2 py-2">Phone h</th>
                <th className="px-2 py-2">Postcards</th>
                <th className="px-2 py-2">Text h</th>
                <th className="px-2 py-2">Guide gap</th>
                <th className="px-2 py-2">Conf.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.county} className="border-b border-kelly-text/5 odd:bg-white even:bg-kelly-wash/30">
                  <td className="px-2 py-2 font-semibold">{r.county}</td>
                  <td className="px-2 py-2 tabular-nums">{r.volunteerCommitmentTarget}</td>
                  <td className="px-2 py-2 tabular-nums">{r.currentCommitments ?? "—"}</td>
                  <td className="px-2 py-2 tabular-nums">{r.commitmentGap}</td>
                  <td className="px-2 py-2 tabular-nums font-semibold text-emerald-800">{r.countyVolunteerNeedPct.toFixed(2)}%</td>
                  <td className="max-w-[360px] px-2 py-2 text-[10px] text-kelly-muted">{r.countyVolunteerNeedFormula}</td>
                  <td className="px-2 py-2 tabular-nums">{r.housePartyGoal}</td>
                  <td className="px-2 py-2 tabular-nums">{r.estimatedRelationalCoverage}</td>
                  <td className="px-2 py-2 tabular-nums">{r.phoneBankCapacityHours}</td>
                  <td className="px-2 py-2 tabular-nums">{r.postcardCapacityEstimate}</td>
                  <td className="px-2 py-2 tabular-nums">{r.textVolunteerCapacityHours}</td>
                  <td className="px-2 py-2 tabular-nums">{r.localGuideNeed}</td>
                  <td className="px-2 py-2">{r.confidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
