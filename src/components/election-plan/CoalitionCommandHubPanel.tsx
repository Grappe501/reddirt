"use client";

import Link from "next/link";
import { useState } from "react";

import { communityWorkbenchHref, communityWorkbenchHubHref } from "@/lib/election-plan/community-workbench/links";
import { readinessBandLabel } from "@/lib/election-plan/community-workbench/ownership-warnings";
import type { CoalitionCommandHubView } from "@/lib/election-plan/community-workbench/load-coalition-command-hub";
import type { ElectionPlanWorkbenchSnapshot } from "@/lib/election-plan/types";
type Props = {
  hub: CoalitionCommandHubView;
  data: ElectionPlanWorkbenchSnapshot;
};

function readinessBadge(band: "green" | "yellow" | "red"): string {
  if (band === "green") return "bg-emerald-100 text-emerald-900";
  if (band === "yellow") return "bg-amber-100 text-amber-900";
  return "bg-red-100 text-red-900";
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{subtitle}</p> : null}
    </div>
  );
}

export function CoalitionCommandHubPanel({ hub, data }: Props) {
  const [legacyOpen, setLegacyOpen] = useState(false);
  const e = data.endorsementAcquisition;
  const legacy = data.coalitionPowerMap;

  const missingOwnerCount = hub.rollup.total - hub.rollup.withOwner;

  return (
    <section>
      <SectionTitle title="Coalition Command" subtitle={hub.heroLine} />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={`${communityWorkbenchHubHref()}?kind=coalition`}
          className="rounded-lg border border-[var(--ep-navy)] bg-[var(--ep-navy)] px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
        >
          All 12 coalition workbenches
        </Link>
        <Link
          href={`${communityWorkbenchHubHref()}?kind=city`}
          className="rounded-lg border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
        >
          City workbenches
        </Link>
        <Link
          href="/election-plan?tab=countyPlaybooks"
          className="rounded-lg border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
        >
          County playbooks
        </Link>
        <Link
          href={`${communityWorkbenchHubHref()}?kind=campus`}
          className="rounded-lg border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
        >
          Campus workbenches
        </Link>
        <Link
          href={`${communityWorkbenchHubHref()}?kind=program`}
          className="rounded-lg border border-[var(--ep-border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
        >
          Program workbenches
        </Link>
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="ep-card text-sm">
          <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Community leads assigned</p>
          <p className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">
            {hub.rollup.withOwner}
            <span className="text-base font-normal text-[var(--ep-navy-muted)]"> / {hub.rollup.total}</span>
          </p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Record-backed from workbench leadership rows</p>
        </div>
        <div className="ep-card text-sm">
          <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Avg readiness</p>
          <p className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">{hub.rollup.avgReadinessPct}%</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Leadership · events · relationships · intel</p>
        </div>
        <div className="ep-card text-sm">
          <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Upcoming events</p>
          <p className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">{hub.rollup.withUpcomingEvent}</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">Coalition workbenches with scheduled field ops</p>
        </div>
        <div className="ep-card text-sm">
          <p className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Framework slots</p>
          <p className="mt-1 font-heading text-2xl font-bold text-[var(--ep-navy)]">12</p>
          <p className="mt-1 text-xs text-[var(--ep-navy-muted)]">One operating workbench per coalition lane</p>
        </div>
      </div>

      {missingOwnerCount > 0 ? (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <p className="font-semibold">
            {missingOwnerCount} coalition workbench{missingOwnerCount === 1 ? "" : "es"} need a Community Lead
          </p>
          <p className="mt-1 text-xs">
            Assign leads inside each workbench — coalition organizing runs through the same template as city hubs.
          </p>
        </div>
      ) : null}

      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="font-heading text-lg font-bold text-[var(--ep-navy)]">Coalition workbenches</h3>
        <Link
          href={`${communityWorkbenchHubHref()}?kind=coalition`}
          className="text-xs font-semibold text-[var(--ep-gold)] hover:underline"
        >
          Open filtered hub →
        </Link>
      </div>
      <p className="mb-4 text-xs text-[var(--ep-navy-muted)]">
        Framework intel sections and volunteer pathways are slots local coalition leads fill — not campaign assumptions.
      </p>

      <ul className="divide-y divide-[var(--ep-border)] rounded-lg border border-[var(--ep-border)]">
        {hub.workbenches.map((wb) => (
          <li key={wb.slug}>
            <Link
              href={communityWorkbenchHref(wb.slug)}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--ep-cream)]"
            >
              <div className="min-w-0 flex-1">
                <p className="font-heading font-bold text-[var(--ep-navy)]">{wb.name}</p>
                {wb.tagline ? <p className="text-xs text-[var(--ep-navy-muted)]">{wb.tagline}</p> : null}
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[var(--ep-navy-muted)]">
                  {wb.communityLead ? (
                    <span>Lead: {wb.communityLead}</span>
                  ) : (
                    <span className="font-semibold text-amber-800">Community Lead OPEN</span>
                  )}
                  {wb.leadRole ? <span>· Role: {wb.leadRole}</span> : null}
                  <span>
                    · {wb.frameworkSectionCount} intel slots · {wb.pathwayCount} pathways
                  </span>
                  {wb.intelPagesFilled > 0 ? (
                    <span className="text-emerald-800">· {wb.intelPagesFilled} intel page{wb.intelPagesFilled === 1 ? "" : "s"} filled</span>
                  ) : null}
                  {wb.relationshipCount > 0 ? (
                    <span>· {wb.relationshipCount} relationship{wb.relationshipCount === 1 ? "" : "s"}</span>
                  ) : null}
                  {wb.locale !== "en" ? <span>· {wb.locale}</span> : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums ${readinessBadge(wb.readinessBand)}`}>
                  {wb.readinessPct}% · {readinessBandLabel(wb.readinessBand)}
                </span>
                {wb.hasUpcomingEvent ? (
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-900">Event scheduled</span>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 ep-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-heading font-bold text-[var(--ep-navy)]">Endorsement pipeline</h3>
          <Link href="/election-plan?tab=endorsements" className="text-xs font-semibold text-[var(--ep-gold)] hover:underline">
            Full endorsements tab →
          </Link>
        </div>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{e.heroLine}</p>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Requested</dt>
            <dd className="font-heading text-xl font-bold text-[var(--ep-navy)]">{e.requested}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Endorsed</dt>
            <dd className="font-heading text-xl font-bold text-[var(--ep-navy)]">{e.endorsed}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Activated</dt>
            <dd className="font-heading text-xl font-bold text-[var(--ep-navy)]">{e.activated}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase text-[var(--ep-navy-muted)]">Volunteer leads</dt>
            <dd className="font-heading text-xl font-bold text-[var(--ep-navy)]">{e.volunteerLeadsGenerated}</dd>
          </div>
        </dl>
        {e.pendingTargets.length > 0 ? (
          <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
            {e.pendingTargets.length} pending target{e.pendingTargets.length === 1 ? "" : "s"} on endorsements tab — drill down for org, tier, and county.
          </p>
        ) : (
          <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
            Endorsement targets live on the endorsements tab. Coalition relationship counts above come from workbench records only.
          </p>
        )}
      </div>

      <div className="mt-8 rounded-lg border border-[var(--ep-border)] bg-[var(--ep-cream)]">
        <button
          type="button"
          onClick={() => setLegacyOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]"
        >
          <span>Legacy coalition snapshot KPI cards (reference only — deprecated)</span>
          <span aria-hidden>{legacyOpen ? "▾" : "▸"}</span>
        </button>
        {legacyOpen ? (
          <div className="border-t border-[var(--ep-border)] px-4 pb-4 pt-3">
            <p className="mb-4 text-xs text-[var(--ep-navy-muted)]">
              Pre-workbench snapshot totals from <code className="text-[10px]">coalitionPowerMap</code>. Do not use for
              operations — open the matching coalition workbench or endorsements tab for record-backed counts.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "NAACP", detail: `${legacy.naacp.called} contacted · ${legacy.naacp.meetingsRequested} meetings requested` },
                { label: "Labor", detail: `${legacy.labor.contacted} contacted · ${legacy.labor.endorsementsInProgress} endorsements in progress` },
                { label: "Hispanic outreach", detail: legacy.hispanic.frameworkStatus },
                { label: "Muslim community", detail: `${legacy.muslim.contactsTotal} contacts · ${legacy.muslim.meetingsOpen} meetings open` },
                { label: "Current officials", detail: `${legacy.electedOfficials.contacted} contacted · ${legacy.electedOfficials.meetingsCompleted} meetings` },
                { label: "Former officials", detail: `${legacy.pastOfficials.engaged} engaged of ${legacy.pastOfficials.total}` },
                { label: "Candidate partnerships", detail: `${legacy.candidates.activePartnerships} active · ${legacy.candidates.sharedEvents} shared events` },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-[var(--ep-border)] bg-white p-3 text-xs">
                  <p className="font-heading font-bold text-[var(--ep-navy)]">{item.label}</p>
                  <p className="mt-1 text-[var(--ep-navy-muted)]">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
