"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useMemo, useState, useTransition } from "react";

import { layerLegend } from "@/lib/victory-os/victory-board/board-color-maps";
import { rebuildVictoryBoardPinsForLayer } from "@/lib/victory-os/victory-board/compose-victory-board-view-model";
import type { VictoryBoardMapLayer, VictoryBoardViewModel } from "@/lib/victory-os/victory-board/types";
import type { CountyVictoryContext } from "@/lib/victory-os/types";
import { VictoryOsHero, VictoryOsMetric } from "../victory-os-ui/VictoryOsShell";
import { vos } from "../victory-os-ui/victory-os-tokens";
import { VictoryBoardCharts } from "./VictoryBoardCharts";

const VictoryBoardCountyMap = dynamic(
  () => import("./VictoryBoardCountyMap").then((m) => m.VictoryBoardCountyMap),
  { ssr: false, loading: () => <div className="flex h-[min(56vh,480px)] items-center justify-center rounded-2xl border border-kelly-text/10 bg-kelly-page/40 font-body text-sm text-kelly-muted">Loading map…</div> },
);

const LAYERS: { id: VictoryBoardMapLayer; label: string }[] = [
  { id: "deployment_priority", label: "Deployment priority" },
  { id: "ops_status", label: "Ops status" },
  { id: "electoral_importance", label: "Electoral importance" },
  { id: "decision_rank", label: "Top 10 decisions" },
];

type Props = {
  initialVm: VictoryBoardViewModel;
  counties: CountyVictoryContext[];
};

export function VictoryBoardDashboard({ initialVm, counties }: Props) {
  const [vm, setVm] = useState(initialVm);
  const [layer, setLayer] = useState<VictoryBoardMapLayer>(vm.mapLayerDefault);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const pins = useMemo(
    () => rebuildVictoryBoardPinsForLayer(vm, layer, counties),
    [vm, layer, counties],
  );

  const selectedPin = pins.find((p) => p.countySlug === selectedSlug) ?? null;
  const selectedDecision = vm.topDecisions.find((d) => d.countySlug === selectedSlug) ?? null;
  const legend = layerLegend(layer);

  const refetch = useCallback(() => {
    startTransition(async () => {
      setMessage(null);
      const res = await fetch(`/api/admin/victory-os/victory-board?week=${vm.weekKey}`);
      const data = await res.json();
      if (data.ok && data.viewModel) {
        setVm(data.viewModel);
        setMessage("Victory Board refreshed from latest decisions.");
      }
    });
  }, [vm.weekKey]);

  const persistSnapshot = useCallback(() => {
    startTransition(async () => {
      setMessage(null);
      const res = await fetch("/api/admin/victory-os/victory-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "persist_snapshot", weekKey: vm.weekKey }),
      });
      const data = await res.json();
      if (data.ok) setMessage("Board snapshot saved to data/victory-board/board-v1.json");
      else setMessage(data.error ?? "Snapshot failed.");
    });
  }, [vm.weekKey]);

  return (
    <div className="space-y-6">
      <VictoryOsHero
        eyebrow="Victory OS · Sprint 4"
        title="Decision intelligence at a glance"
        summary={vm.intelligenceNarrative}
        footer={
          <>
            <VictoryOsMetric label="Pace" value={vm.statewide.pace} />
            <VictoryOsMetric label="Gap" value={vm.statewide.statewideVoteGap.toLocaleString()} />
            <VictoryOsMetric label="CM approval" value={`${vm.statewide.approvalPct}%`} highlight={vm.statewide.pendingDecisions > 0} />
            <VictoryOsMetric label="Election" value={`${vm.electionDaysRemaining}d`} />
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button type="button" disabled={pending} onClick={refetch} className={vos.btnSecondary}>
          Refresh board
        </button>
        <button type="button" disabled={pending} onClick={persistSnapshot} className={vos.btnPrimary}>
          Save snapshot
        </button>
      </div>

      {message ? <p className="font-body text-sm text-kelly-slate">{message}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {LAYERS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLayer(l.id)}
                className={`rounded-full px-3 py-1.5 font-body text-xs font-semibold ${
                  layer === l.id ? vos.navPillActive : vos.navPill
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <VictoryBoardCountyMap pins={pins} selectedSlug={selectedSlug} onSelectPin={setSelectedSlug} />
          <div className="flex flex-wrap gap-3">
            {legend.map((item) => (
              <span key={item.label} className="flex items-center gap-1.5 font-body text-[11px] text-kelly-muted">
                <span className="inline-block h-3 w-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: item.color }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          {selectedPin ? (
            <div className={vos.glass}>
              <h3 className="font-heading text-lg font-bold text-kelly-navy">{selectedPin.displayName}</h3>
              <dl className="mt-3 space-y-2 font-body text-xs">
                <Row label="Priority" value={String(selectedPin.deploymentPriority)} />
                <Row label="Ops" value={selectedPin.opsStatus.toUpperCase()} />
                <Row label="Electoral" value={selectedPin.electoralImportance} />
                <Row label="Opportunity" value={selectedPin.opportunityLevel} />
                <Row label="Readiness" value={selectedPin.organizationalReadiness} />
                {selectedPin.decisionRank != null ? (
                  <Row label="Decision rank" value={`#${selectedPin.decisionRank} · ${selectedPin.decisionStatus}`} />
                ) : (
                  <Row label="Top 10" value="Not ranked this week" />
                )}
              </dl>
              {selectedDecision ? (
                <p className="mt-3 font-body text-xs text-kelly-slate">{selectedDecision.recommendation}</p>
              ) : null}
              <Link
                href={`/admin/counties/${selectedPin.countySlug}`}
                className="mt-3 inline-block font-body text-xs font-semibold text-kelly-navy underline"
              >
                Open county workbench →
              </Link>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-kelly-text/15 bg-kelly-page/30 p-4 font-body text-sm text-kelly-muted">
              Select a county pin to inspect decision intelligence.
            </div>
          )}

          <div className="rounded-2xl border border-kelly-text/10 bg-white p-4">
            <h3 className="font-heading text-sm font-bold text-kelly-navy">Regional rollups</h3>
            <ul className="mt-3 space-y-2">
              {vm.regionRollups.map((r) => (
                <li key={r.regionSlug} className="flex items-center justify-between gap-2 font-body text-xs">
                  <span className="text-kelly-slate">{r.regionLabel}</span>
                  <span className="tabular-nums font-semibold text-kelly-navy">
                    {r.avgDeploymentPriority}
                    {r.redOpsCount > 0 ? <span className="ml-1 text-red-600">· {r.redOpsCount} red</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <section>
        <h2 className="font-heading text-lg font-bold text-kelly-navy">Decision intelligence charts</h2>
        <p className="mt-1 font-body text-sm text-kelly-muted">Derived from Top 10 decisions and Victory Map — not raw field dumps.</p>
        <div className="mt-4">
          <VictoryBoardCharts charts={vm.charts} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <IntelList title="Counties at risk" items={vm.countiesAtRisk.slice(0, 8)} tone="risk" />
        <IntelList title="Strategic opportunities" items={vm.strategicOpportunities.slice(0, 8)} tone="opp" />
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-kelly-muted">{label}</dt>
      <dd className="font-semibold capitalize text-kelly-navy">{value}</dd>
    </div>
  );
}

function IntelList({
  title,
  items,
  tone,
}: {
  title: string;
  items: CountyVictoryContext[];
  tone: "risk" | "opp";
}) {
  return (
    <div className="rounded-2xl border border-kelly-text/10 bg-white p-4">
      <h3 className="font-heading text-sm font-bold text-kelly-navy">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((c) => (
          <li key={c.countySlug} className="flex items-start justify-between gap-2 font-body text-xs">
            <Link href={`/admin/counties/${c.countySlug}`} className="font-semibold text-kelly-navy underline">
              {c.county}
            </Link>
            <span className={tone === "risk" ? "text-red-700" : "text-emerald-800"}>
              {tone === "risk" ? c.opsStatus : c.opportunityLevel}
            </span>
          </li>
        ))}
        {items.length === 0 ? <li className="text-kelly-muted">None flagged this week.</li> : null}
      </ul>
    </div>
  );
}
