"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import type { MondayBriefViewModel } from "@/lib/victory-os/mission-brief/compose-monday-brief-view-model";
import type { CountyMissionStack, WeeklyCampaignDecision } from "@/lib/victory-os/types";
import {
  BriefApprovalRing,
  BriefStatewideHero,
  BriefStickySectionNav,
  BriefWeekDeltaBanner,
  BriefWeekNav,
} from "./BriefHeroAndNav";
import { vos } from "../victory-os-ui/victory-os-tokens";
import {
  BriefCountyIntelSection,
  BriefDeploymentLanes,
  BriefTopDecisionsSection,
} from "./BriefDecisionsAndLanes";

type Props = {
  initialVm: MondayBriefViewModel;
};

export function MondayBriefCommandCenter({ initialVm }: Props) {
  const [vm, setVm] = useState(initialVm);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const brief = vm.brief;
  const stacksByCounty = new Map(vm.priorityStacks.map((s) => [s.countySlug, s]));

  const refetchVm = useCallback(async () => {
    const res = await fetch(`/api/admin/victory-os/brief?week=${vm.weekKey}`);
    const data = await res.json();
    if (data.ok && data.viewModel) setVm(data.viewModel);
  }, [vm.weekKey]);

  const onDecisionStatus = useCallback(
    (decisionId: string, status: WeeklyCampaignDecision["status"]) => {
      startTransition(async () => {
        const res = await fetch("/api/admin/victory-os/decisions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update_status", weekKey: vm.weekKey, decisionId, status }),
        });
        const data = await res.json();
        if (data.ok) await refetchVm();
      });
    },
    [vm.weekKey, refetchVm],
  );

  const runMondayPipeline = useCallback(() => {
    startTransition(async () => {
      setMessage(null);
      const res = await fetch("/api/admin/victory-os/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_monday_pipeline", weekKey: vm.weekKey }),
      });
      const data = await res.json();
      if (data.ok && data.viewModel) {
        setVm(data.viewModel);
        setMessage("Monday pipeline complete — decisions regenerated and missions synced.");
      } else setMessage(data.error ?? "Pipeline failed.");
    });
  }, [vm.weekKey]);

  const approveAllPending = useCallback(() => {
    startTransition(async () => {
      const res = await fetch("/api/admin/victory-os/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_all_pending", weekKey: vm.weekKey }),
      });
      const data = await res.json();
      if (data.ok && data.viewModel) {
        setVm(data.viewModel);
        setMessage("All pending decisions approved.");
      }
    });
  }, [vm.weekKey]);

  const syncMissionsOnly = useCallback(() => {
    startTransition(async () => {
      const res = await fetch("/api/admin/victory-os/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_from_brief", weekKey: vm.weekKey }),
      });
      const data = await res.json();
      if (data.ok) {
        const briefRes = await fetch(`/api/admin/victory-os/brief?week=${vm.weekKey}`);
        const briefData = await briefRes.json();
        if (briefData.ok) setVm(briefData.viewModel);
        setMessage("County missions synced.");
      }
    });
  }, [vm.weekKey]);

  return (
    <div className="space-y-6">
      <BriefStatewideHero vm={vm} />
      <BriefStickySectionNav weekKey={vm.weekKey} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <BriefWeekNav weekKey={vm.weekKey} />
        <div className="flex flex-wrap gap-2">
          {vm.readiness.pending > 0 ? (
          <button type="button" disabled={pending} onClick={approveAllPending} className={vos.btnCopper}>
            Approve all pending
          </button>
          ) : null}
          <button type="button" disabled={pending} onClick={syncMissionsOnly} className={vos.btnSecondary}>
            Sync missions
          </button>
          <button type="button" disabled={pending} onClick={runMondayPipeline} className={vos.btnPrimary}>
            Run Monday pipeline
          </button>
        </div>
      </div>

      {message ? <p className="font-body text-sm text-kelly-slate">{message}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <BriefWeekDeltaBanner vm={vm} />
        <BriefApprovalRing vm={vm} />
      </div>

      <BriefTopDecisionsSection
        decisions={brief.topDecisions}
        stacksByCounty={stacksByCounty}
        onStatus={onDecisionStatus}
        busy={pending}
      />

      <BriefDeploymentLanes
        kelly={brief.kellyDeployment}
        volunteer={brief.volunteerDeployment}
        fundraising={brief.fundraisingDeployment}
      />

      <BriefCountyIntelSection atRisk={brief.countiesAtRisk} opportunities={brief.strategicOpportunities} />

      <section id="section-missions" className={`scroll-mt-24 ${vos.glass}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg font-bold text-kelly-navy">County mission execution</h3>
            <p className="mt-1 font-body text-sm text-kelly-muted">
              Weekly missions and daily tasks for Top 10 counties — full stack in County missions tab.
            </p>
          </div>
          <Link href={`/admin/mission-brief?view=missions&week=${vm.weekKey}`} className={vos.btnPrimary}>
            Open mission stacks →
          </Link>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vm.priorityStacks.slice(0, 6).map((stack) => (
            <MissionStackMini key={stack.countySlug} stack={stack} weekKey={vm.weekKey} />
          ))}
        </div>
      </section>

      <p className="font-body text-xs text-kelly-muted">
        Deep dive:{" "}
        <Link href={`/admin/victory-board?week=${vm.weekKey}`} className="underline">
          Victory Board
        </Link>
        {" · "}
        <Link href={`/admin/mission-brief?view=map&week=${vm.weekKey}`} className="underline">
          Victory Map
        </Link>
        {" · "}
        <Link href="/admin/calendar-command-center/kelly" className="underline">
          Kelly cockpit
        </Link>
        {vm.fromSnapshot ? " · Loaded from snapshot" : " · Live generated"}
      </p>
    </div>
  );
}

function MissionStackMini({ stack, weekKey }: { stack: CountyMissionStack; weekKey: string }) {
  return (
    <Link
      href={`/admin/mission-brief?view=missions&week=${weekKey}`}
      className="block rounded-xl border border-kelly-text/10 bg-white p-3 hover:border-kelly-navy/30"
    >
      <p className="font-body text-sm font-bold text-kelly-navy">{stack.county}</p>
      <p className="mt-1 line-clamp-2 font-body text-xs text-kelly-muted">{stack.weekly?.title ?? stack.monthly?.title}</p>
      <p className="mt-2 font-body text-[10px] text-kelly-muted">{stack.dailyTasks.length} daily tasks</p>
    </Link>
  );
}
