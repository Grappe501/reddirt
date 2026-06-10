"use client";

import Link from "next/link";
import type { ElectionDayViewModel } from "@/lib/victory-os/election-day/types";
import { VictoryOsHero, VictoryOsMetric } from "../victory-os-ui/VictoryOsShell";
import { vos } from "../victory-os-ui/victory-os-tokens";

const STATUS_STYLE: Record<string, string> = {
  critical: "border-red-400/50 bg-red-50 text-red-900",
  watch: "border-amber-400/50 bg-amber-50 text-amber-950",
  on_track: "border-emerald-400/50 bg-emerald-50 text-emerald-900",
  unknown: "border-kelly-text/15 bg-kelly-page/50 text-kelly-muted",
};

const PANEL_STATUS: Record<string, string> = {
  nominal: "bg-emerald-100 text-emerald-800",
  active: "bg-amber-100 text-amber-900",
  escalation: "bg-red-100 text-red-800",
};

export function ElectionDayOpsCenter({ vm }: { vm: ElectionDayViewModel }) {
  return (
    <div className="space-y-6">
      <VictoryOsHero
        eyebrow={vm.isElectionDay ? "Election Day · LIVE" : "Election Day · Operations Center"}
        title="Arkansas Election Operations Center"
        summary={vm.intelligenceNarrative}
        footer={
          <>
            <VictoryOsMetric label="Target" value={vm.statewide.workingTargetWithCushion.toLocaleString()} />
            <VictoryOsMetric label="Countdown" value={vm.isElectionDay ? "TODAY" : `${vm.daysUntilElection}d`} highlight={vm.isElectionDay} />
            <span className={vos.draftBadgeOnDark}>{vm.publicationSafety}</span>
          </>
        }
      />

      <p className="rounded-xl border border-amber-300/40 bg-amber-50/80 px-4 py-3 font-body text-xs text-amber-950">
        {vm.statewide.advisoryNote}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vm.sidePanels.map((panel) => (
          <div key={panel.id} className={vos.card}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-heading text-sm font-bold text-kelly-navy">{panel.title}</h3>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${PANEL_STATUS[panel.status]}`}>{panel.status}</span>
            </div>
            <p className="mt-2 font-body text-xs text-kelly-muted">{panel.summary}</p>
            <p className="mt-2 font-body text-[10px] font-semibold text-kelly-navy">{panel.itemCount} items</p>
          </div>
        ))}
      </div>

      <section>
        <h3 className="font-heading text-xl font-bold text-kelly-navy">Critical counties</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vm.criticalCounties.map((c) => (
            <CountyCard key={c.countySlug} card={c} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-heading text-xl font-bold text-kelly-navy">All counties</h3>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vm.countyCards.slice(0, 24).map((c) => (
            <CountyCard key={c.countySlug} card={c} compact />
          ))}
        </div>
        <p className="mt-3 font-body text-xs text-kelly-muted">Showing 24 of {vm.countyCards.length} counties · Goal votes from win-target scenario</p>
      </section>

      <p className="font-body text-xs text-kelly-muted">
        <Link href="/admin/mission-brief" className="underline">Monday brief</Link>
        {" · "}
        <Link href="/admin/victory-board" className="underline">Victory Board</Link>
        {" · "}
        <Link href="/admin/ai-command-center" className="underline">Command center</Link>
      </p>
    </div>
  );
}

function CountyCard({ card, compact }: { card: ElectionDayViewModel["countyCards"][number]; compact?: boolean }) {
  return (
    <article className={`rounded-2xl border p-4 ${STATUS_STYLE[card.status]}`}>
      <div className="flex items-start justify-between gap-2">
        <Link href={`/admin/counties/${card.countySlug}`} className="font-heading text-sm font-bold hover:underline">
          {card.county}
        </Link>
        <span className="text-[10px] font-bold uppercase">{card.status.replace(/_/g, " ")}</span>
      </div>
      {!compact ? (
        <>
          <dl className="mt-3 grid grid-cols-3 gap-2 font-body text-[10px]">
            <div><dt className="opacity-70">Goal</dt><dd className="font-bold tabular-nums">{card.goalVotes.toLocaleString()}</dd></div>
            <div><dt className="opacity-70">Actual</dt><dd className="font-bold tabular-nums">{card.actualVotes ?? "—"}</dd></div>
            <div><dt className="opacity-70">Gap</dt><dd className="font-bold tabular-nums">{card.gap ?? "—"}</dd></div>
          </dl>
          <p className="mt-2 font-body text-[10px] opacity-80">
            Poll watchers {card.pollWatcherCount} · Volunteers {card.volunteerDeployed} · {card.opsStatus} ops
          </p>
        </>
      ) : (
        <p className="mt-1 font-body text-[10px] opacity-80">Goal {card.goalVotes.toLocaleString()} · {card.electoralImportance}</p>
      )}
    </article>
  );
}
