"use client";

import { useCallback, useState, useTransition } from "react";
import Link from "next/link";
import type { CountyMission, CountyMissionStack, CountyMissionStatus, CountyMissionsRegistryFile } from "@/lib/victory-os/types";

type Props = {
  registry: CountyMissionsRegistryFile | null;
  priorityStacks: CountyMissionStack[];
  weekKey: string;
};

const STATUS_OPTIONS: CountyMissionStatus[] = ["proposed", "approved", "in_progress", "completed", "cancelled"];

const HORIZON_LABEL: Record<string, string> = {
  long_term: "Long-term",
  monthly: "Monthly",
  weekly: "Weekly",
};

function MissionRow({
  mission,
  countySlug,
  onStatus,
  busy,
}: {
  mission: CountyMission;
  countySlug: string;
  onStatus: (missionId: string, status: CountyMissionStatus) => void;
  busy: boolean;
}) {
  return (
    <div className="rounded-xl border border-kelly-text/10 bg-white/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-muted">
            {HORIZON_LABEL[mission.horizon] ?? mission.horizon} · {mission.periodKey}
          </p>
          <p className="mt-1 font-body text-sm font-semibold text-kelly-navy">{mission.title}</p>
          <p className="mt-1 font-body text-xs text-kelly-text/80">{mission.objective}</p>
          {mission.successMetric ? (
            <p className="mt-1 font-body text-xs text-kelly-muted">Success: {mission.successMetric}</p>
          ) : null}
        </div>
        <select
          value={mission.status}
          disabled={busy}
          onChange={(e) => onStatus(mission.id, e.target.value as CountyMissionStatus)}
          className="rounded-lg border border-kelly-text/15 bg-white px-2 py-1 text-xs"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function StackCard({
  stack,
  onMissionStatus,
  onTaskStatus,
  busy,
}: {
  stack: CountyMissionStack;
  onMissionStatus: (countySlug: string, missionId: string, status: CountyMissionStatus) => void;
  onTaskStatus: (countySlug: string, taskId: string, status: CountyMissionStatus) => void;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const missions = [stack.longTerm, stack.monthly, stack.weekly].filter(Boolean) as CountyMission[];

  return (
    <article className="rounded-2xl border border-kelly-text/10 bg-kelly-page/30">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div>
          <Link
            href={`/admin/counties/${stack.countySlug}`}
            onClick={(e) => e.stopPropagation()}
            className="font-heading text-base font-bold text-kelly-navy hover:underline"
          >
            {stack.county}
          </Link>
          <p className="mt-0.5 line-clamp-1 font-body text-xs text-kelly-muted">{stack.weekly?.title ?? stack.monthly?.title}</p>
        </div>
        <span className="font-body text-xs text-kelly-muted">{stack.dailyTasks.length} tasks · {open ? "▲" : "▼"}</span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-kelly-text/10 px-4 pb-4 pt-3">
          {missions.map((m) => (
            <MissionRow
              key={m.id}
              mission={m}
              countySlug={stack.countySlug}
              onStatus={(id, status) => onMissionStatus(stack.countySlug, id, status)}
              busy={busy}
            />
          ))}
          {stack.dailyTasks.length > 0 ? (
            <div>
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-kelly-muted">Daily tasks</p>
              <ul className="mt-2 space-y-2">
                {stack.dailyTasks.map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-kelly-text/5 bg-white/60 px-3 py-2">
                    <span className="font-body text-xs text-kelly-text">
                      <span className="font-mono text-kelly-muted">{t.periodKey}</span> · [{t.assigneeRole}] {t.title}
                    </span>
                    <select
                      value={t.status}
                      disabled={busy}
                      onChange={(e) => onTaskStatus(stack.countySlug, t.id, e.target.value as CountyMissionStatus)}
                      className="rounded border border-kelly-text/15 px-2 py-0.5 text-[10px]"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function StatewideMissionsPanel({ registry, priorityStacks, weekKey }: Props) {
  const [stacks, setStacks] = useState(priorityStacks);
  const [reg, setReg] = useState(registry);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const sync = useCallback(() => {
    startTransition(async () => {
      setMessage(null);
      const res = await fetch("/api/admin/victory-os/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync_from_brief", weekKey }),
      });
      const data = await res.json();
      if (data.ok) {
        setReg(data.registry);
        setStacks(data.registry?.stacks.filter((s: CountyMissionStack) => s.weekly?.linkedDecisionIds?.length) ?? []);
        setMessage(`Synced ${data.result.stacksUpdated} stacks · ${data.result.decisionsLinked} decisions linked.`);
      } else {
        setMessage(data.error ?? "Sync failed.");
      }
    });
  }, [weekKey]);

  const onMissionStatus = useCallback((countySlug: string, missionId: string, status: CountyMissionStatus) => {
    startTransition(async () => {
      const res = await fetch("/api/admin/victory-os/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_mission_status", countySlug, missionId, status }),
      });
      const data = await res.json();
      if (data.ok && data.stack) {
        setStacks((prev) => prev.map((s) => (s.countySlug === countySlug ? data.stack : s)));
      }
    });
  }, []);

  const onTaskStatus = useCallback((countySlug: string, taskId: string, status: CountyMissionStatus) => {
    startTransition(async () => {
      const res = await fetch("/api/admin/victory-os/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_task_status", countySlug, taskId, status }),
      });
      const data = await res.json();
      if (data.ok && data.stack) {
        setStacks((prev) => prev.map((s) => (s.countySlug === countySlug ? data.stack : s)));
      }
    });
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-5">
        <p className="font-body text-sm font-semibold text-kelly-navy">Sprint 2 — County mission framework</p>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">
          Four-level stack per county: long-term → monthly → weekly (from Top 10 decisions) → daily tasks. Sync links
          missions to the decision brief for week <span className="font-mono">{weekKey}</span>.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={sync}
            className="rounded-full bg-kelly-navy px-5 py-2 text-sm font-bold text-white hover:bg-kelly-slate disabled:opacity-50"
          >
            Sync missions from decision brief
          </button>
          {reg ? (
            <span className="font-body text-xs text-kelly-muted">
              Registry: {reg.countyCount} counties · synced {reg.syncedWeekKey}
            </span>
          ) : (
            <span className="font-body text-xs text-amber-800">No registry — run sync</span>
          )}
        </div>
        {message ? <p className="mt-2 font-body text-sm text-kelly-slate">{message}</p> : null}
      </section>

      <section>
        <h3 className="font-heading text-xl font-bold text-kelly-navy">Priority county mission stacks</h3>
        <p className="mt-1 font-body text-sm text-kelly-muted">
          Counties with weekly missions linked to Top 10 decisions — expand for daily execution checklist.
        </p>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {stacks.length === 0 ? (
            <p className="font-body text-sm text-kelly-muted">No mission stacks yet. Sync from the decision brief.</p>
          ) : (
            stacks.map((stack) => (
              <StackCard
                key={stack.countySlug}
                stack={stack}
                onMissionStatus={onMissionStatus}
                onTaskStatus={onTaskStatus}
                busy={pending}
              />
            ))
          )}
        </div>
      </section>
    </div>
  );
}
