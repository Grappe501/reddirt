"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";

import { formatPromotionStatus } from "@/lib/election-plan/forward-motion-readiness";
import { forwardMotionHubHref } from "@/lib/election-plan/forward-motion-links";
import type { StopCommandCenterView } from "@/lib/election-plan/forward-motion-stop-types";
import { getThankYouDoctrine } from "@/lib/election-plan/load-movement-infrastructure";
import { KellyStopBriefPanel } from "@/components/election-plan/KellyStopBriefPanel";
import { conversationStrategyHref, getArkansasConversationStrategy } from "@/lib/election-plan/load-arkansas-conversation-strategy";
import { eventApprovalsHref } from "@/lib/election-plan/location-links";
import { formatVotes } from "@/lib/election-plan/electionPlanData";
import {
  loadStopCommandCenterTracking,
  mergeReadinessWithTracking,
  saveStopCommandCenterTracking,
  type StopCommandCenterTracking,
} from "@/lib/election-plan/stop-command-center-storage";
import { cn } from "@/lib/utils";

type Props = {
  view: StopCommandCenterView;
};

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-24">
      <h2 className="mb-4 font-heading text-xl font-bold text-[var(--ep-navy)]">{title}</h2>
      {children}
    </section>
  );
}

function ReadinessBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="font-semibold uppercase tracking-wide text-[var(--ep-navy-muted)]">{label}</span>
        <span className="tabular-nums font-semibold">{value}%</span>
      </div>
      <div className="ep-progress mt-1">
        <div className="ep-progress-bar" style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

export function ForwardMotionStopCommandCenterPanel({ view }: Props) {
  const thankYouDoctrine = getThankYouDoctrine();
  const [tracking, setTracking] = useState<StopCommandCenterTracking>(() =>
    loadStopCommandCenterTracking(view.stop.eventId),
  );

  useEffect(() => {
    saveStopCommandCenterTracking(view.stop.eventId, tracking);
  }, [tracking, view.stop.eventId]);

  const readiness = useMemo(() => mergeReadinessWithTracking(view, tracking), [view, tracking]);

  const updatePct = (key: keyof StopCommandCenterTracking, value: number) => {
    setTracking((t) => ({ ...t, [key]: Math.min(100, Math.max(0, value)) }));
  };

  const updatePo5Actual = (id: string, value: number) => {
    setTracking((t) => ({
      ...t,
      powerOf5Actuals: { ...t.powerOf5Actuals, [id]: value },
      volunteerRecruitmentPct: Math.min(
        100,
        Math.round(
          (Object.values({ ...t.powerOf5Actuals, [id]: value }).reduce((s, n) => s + n, 0) /
            view.powerOf5Goals.reduce((s, g) => s + g.goal, 0)) *
            100,
        ),
      ),
    }));
  };

  const toggleHouseParty = (id: string) => {
    setTracking((t) => {
      const next = { ...t.housePartyPlanned, [id]: !t.housePartyPlanned[id] };
      const planned = Object.values(next).filter(Boolean).length;
      return {
        ...t,
        housePartyPlanned: next,
        housePartyPlanPct: Math.round((planned / view.housePartyFormats.length) * 100),
      };
    });
  };

  return (
    <section>
      <Link href={forwardMotionHubHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Forward Motion
      </Link>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">Stop command center · Phase 13.2</p>
          <h1 className="font-heading text-3xl font-bold text-[var(--ep-navy)]">{view.stop.eventName}</h1>
          <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
            {view.stop.date}
            {view.timeLabel ? ` · ${view.timeLabel}` : ""} · {view.stop.county}
            {view.stop.city !== "TBD" ? ` · ${view.stop.city}` : ""}
          </p>
        </div>
        <div className="ep-card min-w-[12rem] text-center">
          <p className="text-xs font-semibold uppercase text-[var(--ep-navy-muted)]">Stop readiness</p>
          <p className="font-heading text-4xl font-bold text-[var(--ep-navy)]">{readiness.composite}%</p>
          <p className="mt-1 text-[10px] text-[var(--ep-navy-muted)]">Are we fully exploiting this opportunity?</p>
        </div>
      </div>

      <KellyStopBriefPanel view={view} />

      <nav className="my-6 flex flex-wrap gap-2 text-xs">
        {[
          ["header", "Overview"],
          ["why", "Why it matters"],
          ["county", "County brief"],
          ["city", "City brief"],
          ["coalition", "Coalition"],
          ["promotion", "Promotion"],
          ["story", "Storytelling"],
          ["po5", "Power of 5"],
          ["house", "House parties"],
          ["campus", "College"],
          ["endorse", "Endorsements"],
        ].map(([id, label]) => (
          <a
            key={id}
            href={`#${id}`}
            className="rounded-full border border-[var(--ep-border)] bg-white px-3 py-1 font-semibold text-[var(--ep-navy)] hover:bg-[var(--ep-cream)]"
          >
            {label}
          </a>
        ))}
      </nav>

      {view.mobilizeEnforcement.warning ? (
        <div className="mb-6 rounded-lg border-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-bold uppercase tracking-wide">{view.mobilizeEnforcement.warning}</p>
          <p className="mt-1">
            Mobilize is required for this stop ({view.mobilizeEnforcement.reasons.join(" · ")}). Status:{" "}
            {formatPromotionStatus(view.stop.mobilizeStatus)}.
          </p>
        </div>
      ) : null}

      <Section id="header" title="Event header">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["County", view.stop.county.replace(/\s+County$/i, "")],
            ["City", view.stop.city !== "TBD" ? view.stop.city : "—"],
            ["Date", view.stop.date],
            ["Time", view.timeLabel ?? "TBD"],
            ["Venue", view.venue ?? "TBD"],
            ["Assigned owner", view.stop.assignment],
            ["Priority score", String(view.stop.effectiveScore)],
            ["VCI impact", view.county ? `#${view.county.vciRank} · ${formatVotes(view.county.vci)}` : "—"],
            ["Coalition importance", view.coalitionImportance.split("—")[0].trim()],
            ["Attendance est.", view.attendanceEstimate ?? "TBD"],
            ["Activation readiness", `${view.stop.activationReadinessPct}%`],
            ["Verification", view.stop.verificationStatus.replace(/_/g, " ")],
          ].map(([label, value]) => (
            <div key={label} className="ep-card">
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">{label}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--ep-navy)]">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          {view.countyPlaybookHref ? (
            <Link href={view.countyPlaybookHref} className="ep-chapter-link">
              County playbook →
            </Link>
          ) : null}
          {view.cityBriefHref ? (
            <Link href={view.cityBriefHref} className="ep-chapter-link">
              City location brief →
            </Link>
          ) : null}
          {view.fieldWorksheetHref ? (
            <Link href={view.fieldWorksheetHref} className="ep-chapter-link">
              Field worksheet →
            </Link>
          ) : null}
          <Link href={eventApprovalsHref({ county: view.stop.county })} className="ep-chapter-link">
            Event approvals →
          </Link>
        </div>
      </Section>

      <Section id="why" title="Why this stop matters">
        <blockquote className="ep-card-glass border-l-4 border-[var(--ep-gold)] pl-4 text-sm leading-relaxed italic">
          {view.whyItMatters}
        </blockquote>
        <p className="mt-3 text-sm text-[var(--ep-navy-muted)]">
          Primary lane: <strong>{view.stop.primaryLane}</strong> · Cluster: {view.stop.cluster} · Next action:{" "}
          {view.stop.nextAction}
        </p>
      </Section>

      <Section id="readiness" title="Stop readiness score">
        <div className="ep-card space-y-3">
          <ReadinessBar label="Promotion readiness" value={readiness.promotion} />
          <ReadinessBar label="Coalition outreach" value={readiness.coalition} />
          <ReadinessBar label="Volunteer recruitment" value={readiness.volunteers} />
          <ReadinessBar label="Story plan" value={readiness.story} />
          <ReadinessBar label="House party plan" value={readiness.houseParties} />
          <ReadinessBar label="Endorsement pipeline" value={readiness.endorsements} />
        </div>
      </Section>

      <Section id="county" title="County brief">
        {view.county ? (
          <div className="ep-card space-y-3 text-sm">
            <p>
              <span className="font-semibold">Mission:</span> {view.county.primaryMission} · {view.county.secondaryMission}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs uppercase text-[var(--ep-navy-muted)]">VCI rank</p>
                <p className="font-semibold">#{view.county.vciRank}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Last visit</p>
                <p className="font-semibold">{view.lastVisitDate ?? "None logged"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Vote opportunity</p>
                <p className="font-semibold">Lane 2 @ 50%: {formatVotes(view.county.lane2Recovery50)}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Registration goal</p>
                <p className="font-semibold">{formatVotes(view.county.registrationGoal)}</p>
              </div>
            </div>
            <p className="text-[var(--ep-navy-muted)]">{view.county.recommendedAction}</p>
          </div>
        ) : (
          <p className="text-sm text-[var(--ep-navy-muted)]">County KPI not found in workbench snapshot.</p>
        )}
      </Section>

      <Section id="city" title="City brief">
        {view.cityBrief ? (
          <div className="ep-card space-y-3 text-sm">
            <p className="font-semibold">{view.cityBrief.name} · #{view.cityBrief.rank} priority city</p>
            <p>{view.cityBrief.briefBoard}</p>
            <p>
              <span className="font-semibold">Penetration:</span> {view.cityBrief.penetration}
            </p>
          </div>
        ) : view.priorityCities.length > 0 ? (
          <div className="ep-card text-sm">
            <p className="mb-3 text-[var(--ep-navy-muted)]">No city-specific brief for this stop. Priority cities in county:</p>
            <ul className="space-y-2">
              {view.priorityCities.map((c) => (
                <li key={c.slug}>
                  <Link href={`/election-plan/cities/${c.slug}`} className="font-semibold text-[var(--ep-navy)] underline">
                    {c.name}
                  </Link>
                  <span className="text-[var(--ep-navy-muted)]"> · {formatVotes(c.targetVotes)} vote target</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-[var(--ep-navy-muted)]">
            County-seat and community event focus — no Top 75 city brief. Use county playbook and coalition targets.
          </p>
        )}
      </Section>

      <Section id="coalition" title="Coalition targets">
        <div className="mb-4 flex items-center gap-3">
          <label className="text-sm font-semibold">Coalition outreach progress</label>
          <input
            type="range"
            min={0}
            max={100}
            value={tracking.coalitionOutreachPct}
            onChange={(e) => updatePct("coalitionOutreachPct", Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm tabular-nums">{tracking.coalitionOutreachPct}%</span>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {view.coalitionTargets.map((lane) => (
            <div key={lane.id} className="ep-card">
              <h3 className="font-heading font-bold">{lane.label}</h3>
              <p className="mt-1 text-xs text-[var(--ep-gold)]">Owner: {lane.owner}</p>
              <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">Who should be invited? {lane.invitePrompt}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="promotion" title="Promotion readiness">
        <div className="overflow-x-auto ep-card">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
                <th className="py-2 pr-3">Item</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {view.promotionItems.map((item) => (
                <tr key={item.id} className="border-b border-[var(--ep-border)] last:border-0">
                  <td className="py-2 pr-3 font-medium">{item.label}</td>
                  <td className="py-2 pr-3 text-xs">{formatPromotionStatus(item.status)}</td>
                  <td className="py-2 tabular-nums">{item.score}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <h3 className="mb-3 mt-8 font-heading font-bold">Event promotion timeline</h3>
        <div className="space-y-3">
          {view.promotionTimeline.map((m) => (
            <div
              key={m.label}
              className={cn("ep-card", m.isPast && "opacity-70")}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="font-semibold">{m.label}</h4>
                <span className="font-mono text-xs text-[var(--ep-navy-muted)]">{m.dueDate}</span>
              </div>
              <ul className="mt-2 list-inside list-disc text-sm text-[var(--ep-navy-muted)]">
                {m.tasks.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section id="story" title="Storytelling">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="ep-card">
            <h3 className="font-heading font-bold">Story targets (before visit)</h3>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
              {view.storyTargets.map((t) => (
                <li key={t.id}>{t.label}</li>
              ))}
            </ul>
          </div>
          <div className="ep-card">
            <h3 className="font-heading font-bold">Content required (after visit)</h3>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm">
              {view.contentRequired.map((t) => (
                <li key={t.id}>{t.label}</li>
              ))}
            </ul>
            {view.substackAngle ? (
              <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
                Substack angle: <em>{view.substackAngle}</em>
              </p>
            ) : null}
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--ep-navy-muted)]">
          Story workflow: {formatPromotionStatus(view.stop.storyWorkflowStatus)} · Phase 12 handoff
        </p>
      </Section>

      <Section id="po5" title="Power of 5">
        <div className="overflow-x-auto ep-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--ep-border)] text-xs uppercase text-[var(--ep-navy-muted)]">
                <th className="py-2 pr-3">Goal</th>
                <th className="py-2 pr-3">Target</th>
                <th className="py-2">Actual</th>
              </tr>
            </thead>
            <tbody>
              {view.powerOf5Goals.map((row) => (
                <tr key={row.id} className="border-b border-[var(--ep-border)] last:border-0">
                  <td className="py-2 pr-3 font-medium">{row.label}</td>
                  <td className="py-2 pr-3 tabular-nums">{row.goal}</td>
                  <td className="py-2">
                    <input
                      type="number"
                      min={0}
                      className="w-20 rounded border border-[var(--ep-border)] px-2 py-1 text-sm"
                      value={tracking.powerOf5Actuals[row.id] ?? 0}
                      onChange={(e) => updatePo5Actual(row.id, Number(e.target.value) || 0)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="conversation-ladder" title="Conversation ladder · relationship leaders">
        <p className="mb-3 text-sm text-[var(--ep-navy-muted)]">
          {getArkansasConversationStrategy().stopCommandCenterPrompt}
        </p>
        <div className="ep-card border-l-4 border-[var(--ep-gold)]">
          <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Not just attendance</p>
          <p className="mt-1 text-sm font-medium text-[var(--ep-navy)]">
            {getArkansasConversationStrategy().successQuestion}
          </p>
          <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
            Large events create visibility. Small events create votes.
          </p>
          <Link href={conversationStrategyHref()} className="mt-3 inline-block text-xs font-semibold underline">
            Arkansas Conversation Strategy →
          </Link>
        </div>
      </Section>

      <Section id="house" title="House party engine">
        <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">
          How many eyeball-to-eyeball conversations can we create around this stop — not just how many events we attend?
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {view.housePartyFormats.map((fmt) => (
            <label key={fmt.id} className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--ep-border)] bg-white px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(tracking.housePartyPlanned[fmt.id])}
                onChange={() => toggleHouseParty(fmt.id)}
              />
              {fmt.label}
            </label>
          ))}
        </div>
      </Section>

      {view.campusActivation ? (
        <Section id="campus" title="College activation">
          <div className="ep-card grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Campus</p>
              <p className="font-semibold">{view.campusActivation.campus}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Campus captain</p>
              <p className="font-semibold">{view.campusActivation.captain ?? "Unassigned"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Student recruitment goal</p>
              <p className="font-semibold">{view.campusActivation.studentRecruitmentGoal}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--ep-navy-muted)]">Registration goal</p>
              <p className="font-semibold">{view.campusActivation.registrationGoal}</p>
            </div>
            <p className="sm:col-span-2 text-[var(--ep-navy-muted)]">{view.campusActivation.freshmanWeekOpportunity}</p>
            <p className="sm:col-span-2 text-[var(--ep-navy-muted)]">{view.campusActivation.fundraiserOpportunity}</p>
          </div>
        </Section>
      ) : null}

      <Section id="endorse" title="Endorsement opportunities">
        <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {view.endorsementRoles.map((role) => (
            <div key={role.id} className="ep-card text-sm">
              <p className="font-semibold">{role.label}</p>
              <select
                className="mt-2 w-full rounded border border-[var(--ep-border)] px-2 py-1 text-xs"
                value={tracking.endorsementStatus[role.id] ?? ""}
                onChange={(e) => {
                  const endorsementStatus = {
                    ...tracking.endorsementStatus,
                    [role.id]: e.target.value as StopCommandCenterTracking["endorsementStatus"][string],
                  };
                  const filled = Object.values(endorsementStatus).filter(Boolean).length;
                  setTracking({
                    ...tracking,
                    endorsementStatus,
                    endorsementPipelinePct: Math.round((filled / view.endorsementRoles.length) * 100),
                  });
                }}
              >
                <option value="">—</option>
                <option value="requested">Requested</option>
                <option value="scheduled">Meeting scheduled</option>
                <option value="pending">Pending</option>
                <option value="endorsed">Endorsed</option>
              </select>
            </div>
          ))}
        </div>
        {view.countyEndorsementTargets.length > 0 ? (
          <div className="ep-card text-sm">
            <h3 className="font-heading font-bold">County endorsement pipeline</h3>
            <ul className="mt-3 space-y-2">
              {view.countyEndorsementTargets.map((t) => (
                <li key={`${t.name}-${t.organization}`}>
                  <span className="font-medium">{t.name}</span>
                  <span className="text-[var(--ep-navy-muted)]">
                    {" "}
                    · {t.organization} · tier {t.tier} · {t.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>

      <Section id="thank-you" title="Event closeout · Thank-you doctrine">
        <p className="mb-4 text-sm text-[var(--ep-navy-muted)]">{thankYouDoctrine.doctrine}</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="ep-card">
            <h3 className="font-heading font-bold">Host thank-you</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {thankYouDoctrine.hostThankYou.items.map((item) => (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(tracking.thankYouCloseout[`host-${item.id}`])}
                      onChange={() =>
                        setTracking((t) => ({
                          ...t,
                          thankYouCloseout: {
                            ...t.thankYouCloseout,
                            [`host-${item.id}`]: !t.thankYouCloseout[`host-${item.id}`],
                          },
                        }))
                      }
                    />
                    {item.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="ep-card">
            <h3 className="font-heading font-bold">Volunteer lead thank-you</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {thankYouDoctrine.volunteerLeadThankYou.items.map((item) => (
                <li key={item.id}>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={Boolean(tracking.thankYouCloseout[`lead-${item.id}`])}
                      onChange={() =>
                        setTracking((t) => ({
                          ...t,
                          thankYouCloseout: {
                            ...t.thankYouCloseout,
                            [`lead-${item.id}`]: !t.thankYouCloseout[`lead-${item.id}`],
                          },
                        }))
                      }
                    />
                    {item.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <p className="text-xs text-[var(--ep-navy-muted)]">
        Tracking saved in this browser · Draft/review only — no live publishing from this page.
      </p>
    </section>
  );
}
