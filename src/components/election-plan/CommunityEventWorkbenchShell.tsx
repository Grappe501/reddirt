"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { CommunityWorkbenchEventOpsPanel } from "@/components/election-plan/CommunityWorkbenchEventOpsPanel";
import { CommunityWorkbenchPilotSmokePanel } from "@/components/election-plan/CommunityWorkbenchPilotSmokePanel";
import { EventFundraisingOpportunityPanel } from "@/components/election-plan/EventFundraisingOpportunityPanel";
import { communityWorkbenchHref } from "@/lib/election-plan/community-workbench/links";
import type { PilotSmokePath } from "@/lib/election-plan/community-workbench/pilot-smoke-paths";
import type { PilotEventSeed } from "@/lib/election-plan/community-workbench/pilot-event-seeds";
import type { PilotWorkbenchValidation } from "@/lib/election-plan/community-workbench/pilot-validation";
import type {
  CommunityWorkbenchCommitteeRow,
  CommunityWorkbenchEventRow,
  CommunityWorkbenchView,
} from "@/lib/election-plan/community-workbench/types";

type Props = {
  workbench: CommunityWorkbenchView;
  event: CommunityWorkbenchEventRow;
  eventSlug: string;
  committee: CommunityWorkbenchCommitteeRow | null;
  pilotSeed: PilotEventSeed;
  operatorInitials: string | null;
  pilotSmokePath: PilotSmokePath;
  pilotValidation: PilotWorkbenchValidation;
};

function parseCommitteeMembers(membersJson: string | null): string[] {
  if (!membersJson) return [];
  try {
    const parsed = JSON.parse(membersJson) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function CommunityEventWorkbenchShell({
  workbench,
  event,
  committee,
  pilotSeed,
  operatorInitials,
  pilotSmokePath,
  pilotValidation,
}: Props) {
  const router = useRouter();
  const members = parseCommitteeMembers(committee?.membersJson ?? null);

  return (
    <div>
      <Link href={communityWorkbenchHref(workbench.slug)} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← {workbench.name} city workbench
      </Link>
      <Link
        href={`${communityWorkbenchHref(workbench.slug)}#events`}
        className="ml-3 text-xs font-semibold text-[var(--ep-gold)] hover:underline"
      >
        All city events
      </Link>

      <div className="mt-3">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Event Workbench · Special KPI</p>
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)] lg:text-3xl">{event.title}</h1>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          {event.eventDate
            ? new Date(event.eventDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
            : pilotSeed.eventDateIso}{" "}
          · Hosted on {workbench.name} workbench · Event leadership ≠ city leadership
        </p>
      </div>

      <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">Hard rule: event hosts ≠ house-party hosts · event chairs ≠ community_lead</p>
        <p className="mt-1 text-xs">
          Committee members and players onboard here as event participants — not Sherwood city volunteers unless they
          activate through PPEN as participants.
        </p>
      </div>

      <CommunityWorkbenchPilotSmokePanel smokePath={pilotSmokePath} validation={pilotValidation} />

      <EventFundraisingOpportunityPanel seed={pilotSeed} event={event} />

      <section id="committee" className="mb-10 scroll-mt-28">
        <h2 className="mb-4 font-heading text-xl font-bold text-[var(--ep-navy)]">Working committee</h2>
        {committee ? (
          <div className="ep-card text-sm">
            <p className="font-heading font-bold text-[var(--ep-navy)]">{committee.name}</p>
            {committee.goals ? <p className="mt-2 text-[var(--ep-navy-muted)]">{committee.goals}</p> : null}
            <p className="mt-4 text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Member / player slots</p>
            <ul className="mt-2 space-y-1">
              {members.map((m) => (
                <li key={m} className="rounded border border-[var(--ep-border)] px-3 py-2">
                  {m}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-[var(--ep-navy-muted)]">
              Onboarding path (PPEN preview): invite → activation → Level 1 access → event participation record → event
              workbench access.
            </p>
          </div>
        ) : (
          <p className="text-sm italic text-[var(--ep-navy-muted)]">No committee linked — seed or link on city events panel.</p>
        )}
      </section>

      <section id="event-ops" className="mb-10 scroll-mt-28">
        <h2 className="mb-4 font-heading text-xl font-bold text-[var(--ep-navy)]">Event command center</h2>
        <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
          Run of show, volunteer roles, status pipeline, and after-action report. Every save tagged with operator initials.
        </p>
        <CommunityWorkbenchEventOpsPanel
          workbenchSlug={workbench.slug}
          events={[event]}
          committees={workbench.committees}
          operatorInitials={operatorInitials}
        />
      </section>

      <button
        type="button"
        onClick={() => router.refresh()}
        className="rounded-md border border-[var(--ep-border)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ep-navy)] hover:border-[var(--ep-gold)]"
      >
        Refresh event data
      </button>
    </div>
  );
}
