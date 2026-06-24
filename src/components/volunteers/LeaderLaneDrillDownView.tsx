"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { LaneDrillDownItem, LaneDrillDownPage, LaneDrillDownSection } from "@/lib/volunteers/lane-drill-down-config";
import {
  leaderLaneDrillDownHref,
  leaderLaneDrillDownMeHref,
} from "@/lib/volunteers/lane-drill-down-config";
import type { VolunteerLeader, VolunteerTeamLaneId } from "@/lib/volunteers/types";
import { VOLUNTEER_TEAM_LANES } from "@/lib/volunteers/types";

type Props = {
  leader: VolunteerLeader;
  page: LaneDrillDownPage;
  isSelf?: boolean;
};

function storageKey(leaderInitials: string, laneId: string, itemId: string): string {
  return `reddirt-lane-check:${leaderInitials}:${laneId}:${itemId}`;
}

function priorityClass(priority: LaneDrillDownItem["priority"]): string {
  if (priority === "high") return "border-l-4 border-l-[var(--ep-gold)]";
  if (priority === "medium") return "border-l-4 border-l-[var(--ep-blue)]/40";
  return "border-l-4 border-l-[var(--ep-navy)]/15";
}

function LaneSectionBlock({
  section,
  laneId,
  leaderInitials,
  editable,
}: {
  section: LaneDrillDownSection;
  laneId: string;
  leaderInitials: string;
  editable: boolean;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const next: Record<string, boolean> = {};
    for (const item of section.items) {
      if (item.kind !== "checklist") continue;
      try {
        next[item.id] = localStorage.getItem(storageKey(leaderInitials, laneId, item.id)) === "1";
      } catch {
        next[item.id] = false;
      }
    }
    setChecked(next);
  }, [section.items, laneId, leaderInitials]);

  const toggle = useCallback(
    (itemId: string) => {
      if (!editable) return;
      setChecked((prev) => {
        const next = !prev[itemId];
        try {
          localStorage.setItem(storageKey(leaderInitials, laneId, itemId), next ? "1" : "0");
        } catch {
          /* ignore */
        }
        return { ...prev, [itemId]: next };
      });
    },
    [editable, leaderInitials, laneId],
  );

  if (!section.items.length) return null;

  return (
    <section id={section.id} className="scroll-mt-32 border-b border-[var(--ep-navy)]/10 pb-10 last:border-0">
      <h2 className="font-heading text-xl font-bold text-[var(--ep-navy)]">{section.title}</h2>
      {section.intro ? <p className="mt-2 max-w-3xl text-sm text-[var(--ep-navy-muted)]">{section.intro}</p> : null}
      <ul className="mt-4 space-y-3">
        {section.items.map((item) => (
          <li
            key={item.id}
            className={`rounded-xl border border-[var(--ep-navy)]/10 bg-white p-4 shadow-sm ${priorityClass(item.priority)}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {item.kind === "checklist" && editable ? (
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={Boolean(checked[item.id])}
                      onChange={() => toggle(item.id)}
                      className="mt-1 h-4 w-4 rounded border-[var(--ep-border)]"
                    />
                    <span>
                      <span className="font-semibold text-[var(--ep-navy)]">{item.title}</span>
                      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{item.description}</p>
                    </span>
                  </label>
                ) : (
                  <>
                    <p className="font-semibold text-[var(--ep-navy)]">{item.title}</p>
                    <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{item.description}</p>
                  </>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="rounded bg-[var(--ep-cream)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">
                  {item.kind}
                </span>
                {item.href ? (
                  <Link href={item.href} className="text-xs font-semibold text-[var(--ep-blue)] hover:underline">
                    Open →
                  </Link>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LeaderLaneDrillDownView({ leader, page, isSelf }: Props) {
  const workbenchHref = isSelf
    ? "/election-plan/operators/leaders/me"
    : `/election-plan/operators/leaders/${leader.slug}`;

  return (
    <div className="ep-chapter-body px-6 py-10 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link href={workbenchHref} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
          ← Back to workbench
        </Link>

        <div className="ep-classification mt-4">Lane drill-down v3.4 · {page.label}</div>
        <h1 className="mt-2 font-heading text-3xl font-bold text-[var(--ep-navy)]">{page.label} lane</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--ep-navy)]">{page.tagline}</p>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          {leader.displayName} · <span className="font-mono font-bold text-[var(--ep-blue)]">{leader.initials}</span>
          {isSelf ? " · your signed-in drill-down" : null}
        </p>

        <nav className="mt-6 flex flex-wrap gap-2" aria-label="Other lanes">
          {leader.teamLanes.map((laneId) => {
            const label = VOLUNTEER_TEAM_LANES.find((l) => l.id === laneId)?.label ?? laneId;
            const href = isSelf ? leaderLaneDrillDownMeHref(laneId) : leaderLaneDrillDownHref(leader.slug, laneId);
            const active = laneId === page.laneId;
            return (
              <Link
                key={laneId}
                href={href}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  active
                    ? "bg-[var(--ep-navy)] text-white"
                    : "border border-[var(--ep-navy)]/20 bg-white text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 space-y-10">
          <LaneSectionBlock
            section={page.workCompletion}
            laneId={page.laneId}
            leaderInitials={leader.initials}
            editable={Boolean(isSelf)}
          />
          <LaneSectionBlock section={page.organizing} laneId={page.laneId} leaderInitials={leader.initials} editable={false} />
          <LaneSectionBlock section={page.reporting} laneId={page.laneId} leaderInitials={leader.initials} editable={false} />
          {page.tools.items.length ? (
            <LaneSectionBlock section={page.tools} laneId={page.laneId} leaderInitials={leader.initials} editable={false} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function LeaderLaneNavStrip({
  leader,
  isSelf,
  activeLaneId,
}: {
  leader: VolunteerLeader;
  isSelf?: boolean;
  activeLaneId?: VolunteerTeamLaneId;
}) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {leader.teamLanes.map((laneId) => {
        const label = VOLUNTEER_TEAM_LANES.find((l) => l.id === laneId)?.label ?? laneId;
        const href = isSelf ? leaderLaneDrillDownMeHref(laneId) : leaderLaneDrillDownHref(leader.slug, laneId);
        return (
          <Link
            key={laneId}
            href={href}
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
              activeLaneId === laneId
                ? "border-[var(--ep-gold)] bg-[var(--ep-cream)] text-[var(--ep-navy)]"
                : "border-[var(--ep-gold)]/40 bg-white text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
            }`}
          >
            {label} →
          </Link>
        );
      })}
    </div>
  );
}
