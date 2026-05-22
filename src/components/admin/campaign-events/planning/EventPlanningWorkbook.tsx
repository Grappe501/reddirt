"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CalendarSurfaceRow } from "@/lib/campaign-events/load-campaign-calendar-events";
import type { EventPlanningData, RunOfShowRow } from "@/lib/campaign-events/event-planning/event-planning-types";
import {
  detectContactGaps,
  detectRunOfShowGaps,
  mergePlanningFromRow,
  planFundraiserEvent,
  planHouseMeetGreet,
  planSpeakingEvent,
  scanEventRisks,
  scoreEventPlanningReadiness,
  suggestOwnerAssignments,
} from "@/lib/campaign-events/event-planning/event-planning-helpers";
import {
  generateCandidateBriefAction,
  generateCmBriefAction,
  generatePackListAction,
  generateRunOfShowAction,
  markPlanningSectionCompleteAction,
  saveEventPlanningSectionAction,
  seedContactsAction,
  seedVolunteerPlanAction,
} from "@/app/admin/(board)/campaign-events/event-planning-actions";
import { reimbursementHref } from "@/lib/campaign-events/travel-reimbursement/travel-reimbursement-links";
import { CountyWorkbenchLink } from "@/components/admin/CountyWorkbenchLink";
import { CalendarSyncTruthPanel } from "../CalendarSyncTruthPanel";
import { Field, PlanningSection } from "./PlanningSection";
import { useAgentObservation } from "@/components/agents/AgentObservationTracker";

function newRosId() {
  return `ros-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function EventPlanningWorkbook({
  row,
  initialPlanning,
  returnMonth,
}: {
  row: CalendarSurfaceRow;
  initialPlanning: EventPlanningData;
  returnMonth?: string;
}) {
  const router = useRouter();
  const { track } = useAgentObservation();
  const [pending, startTransition] = useTransition();
  const [planning, setPlanning] = useState<EventPlanningData>(() =>
    mergePlanningFromRow(row, initialPlanning),
  );
  const [message, setMessage] = useState<string | null>(null);

  const month = returnMonth ?? row.dateYmd.slice(0, 7);
  const readiness = useMemo(() => scoreEventPlanningReadiness(row, planning), [row, planning]);
  const risks = useMemo(() => scanEventRisks(row, planning), [row, planning]);
  const contactGaps = useMemo(() => detectContactGaps(planning.contacts, row), [planning.contacts, row]);
  const rosGaps = useMemo(() => detectRunOfShowGaps(planning.runOfShow), [planning.runOfShow]);
  const nextAction = readiness.nextRecommendations[0] ?? "Review planning sections below";

  const save = (next: EventPlanningData, done?: keyof EventPlanningData["sectionCompleted"]) => {
    startTransition(async () => {
      setMessage(null);
      const payload = done
        ? { ...next, sectionCompleted: { ...next.sectionCompleted, [done]: true } }
        : next;
      const res = await saveEventPlanningSectionAction(row.recordId, payload);
      setPlanning(payload);
      setMessage("Saved.");
      if (done) {
        await markPlanningSectionCompleteAction(row.recordId, done, payload);
        track("planning_section_completed", { section: done });
      }
      router.refresh();
    });
  };

  const runAi = (fn: () => Promise<{ planning: EventPlanningData; message?: string }>) => {
    startTransition(async () => {
      setMessage(null);
      const res = await fn();
      setPlanning(res.planning);
      setMessage(res.message ?? "Updated.");
      router.refresh();
    });
  };

  const updateRos = (rows: RunOfShowRow[]) => setPlanning((p) => ({ ...p, runOfShow: rows }));

  const eventTypeHints = useMemo(() => {
    const t = `${row.factCard.why.eventType} ${row.calendar.title}`.toLowerCase();
    if (/house|meet|greet/.test(t)) return planHouseMeetGreet(row);
    if (/fundrais|dinner|gal/.test(t)) return planFundraiserEvent(row);
    if (/speak|forum|debate/.test(t)) return planSpeakingEvent(row);
    return [];
  }, [row]);

  return (
    <div className="flex flex-col gap-5 print:gap-4">
      <header className="rounded-3xl border border-kelly-navy/20 bg-gradient-to-br from-kelly-navy/[0.06] to-kelly-page p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-slate">Event planning workbook</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-kelly-navy md:text-3xl">{row.calendar.title}</h1>
        <p className="mt-2 font-body text-sm text-kelly-text/70">
          {row.dateYmd} · {row.timeLabel} · {row.classificationLabel}
          {row.county ? (
            <>
              {" "}
              · <CountyWorkbenchLink countyLabel={row.county} />
            </>
          ) : null}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <Link
            href={`/admin/campaign-events/review?month=${month}&focus=${row.recordId}`}
            className="rounded-full border px-3 py-1.5 text-kelly-navy underline"
          >
            Review / edit fact card
          </Link>
          <Link href={reimbursementHref(month)} className="rounded-full border px-3 py-1.5">
            Reimbursement report
          </Link>
          <Link href={`/admin/campaign-events/workbench?month=${month}`} className="rounded-full border px-3 py-1.5">
            Workbench
          </Link>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border-2 border-kelly-navy/25 bg-white p-4 lg:col-span-1">
          <p className="text-[10px] font-bold uppercase text-kelly-slate">Planning readiness</p>
          <p className="mt-2 font-heading text-4xl font-bold text-kelly-navy">{readiness.scorePercent}%</p>
          <p className="font-body text-sm font-semibold text-kelly-text/70">{readiness.bandLabel}</p>
          {readiness.blockers.length ? (
            <ul className="mt-3 list-disc pl-4 font-body text-xs text-amber-950">
              {readiness.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="rounded-2xl border border-amber-700/25 bg-amber-50/80 p-4 lg:col-span-2">
          <p className="text-[10px] font-bold uppercase text-amber-900">Next best action</p>
          <p className="mt-2 font-body text-sm font-semibold text-amber-950">{nextAction}</p>
          <ul className="mt-2 font-body text-xs text-amber-900/80">
            {readiness.nextRecommendations.slice(1, 4).map((a) => (
              <li key={a}>→ {a}</li>
            ))}
          </ul>
        </div>
      </section>

      {message ? (
        <p className="rounded-lg border border-emerald-700/30 bg-emerald-50 px-3 py-2 font-body text-sm text-emerald-950">{message}</p>
      ) : null}

      <PlanningSection
        title="1. Event overview"
        subtitle="Status, location, approval, calendar, and travel at a glance."
        defaultOpen
        complete={planning.sectionCompleted.overview}
      >
        <dl className="grid gap-3 font-body text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-kelly-text/50">Date / time</dt>
            <dd className="font-semibold">
              {row.dateYmd} · {row.timeLabel}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-kelly-text/50">Status</dt>
            <dd>{row.rawEventStatus}</dd>
          </div>
          <div>
            <dt className="text-xs text-kelly-text/50">City / county</dt>
            <dd>
              {row.likelyCity ?? "—"} / {row.county ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-kelly-text/50">Host</dt>
            <dd>{row.factCard.who.hostName ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-kelly-text/50">Location</dt>
            <dd>{row.factCard.where.venueName ?? row.calendar.location ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-kelly-text/50">Candidate role</dt>
            <dd>{row.factCard.what.candidateRole ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-kelly-text/50">Approval</dt>
            <dd>{row.decisionLabel ?? "Pending"}</dd>
          </div>
          <div>
            <dt className="text-xs text-kelly-text/50">Calendar sync</dt>
            <dd>{row.calendarTruthLabel}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-kelly-text/50">Travel</dt>
            <dd>{row.travelLine}</dd>
          </div>
        </dl>
        {risks.length ? (
          <ul className="mt-3 rounded-lg border border-red-800/20 bg-red-50/50 p-3 font-body text-xs text-red-900">
            {risks.map((r) => (
              <li key={r}>⚠ {r}</li>
            ))}
          </ul>
        ) : null}
        <div className="mt-4">
          <CalendarSyncTruthPanel row={row} />
        </div>
        footer={
          <button
            type="button"
            disabled={pending}
            className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white"
            onClick={() => save(planning, "overview")}
          >
            Mark overview reviewed
          </button>
        }
      />

      <PlanningSection
        title="2. Run of show"
        subtitle="Timeline — add, edit, reorder. Generate a draft from the fact card first."
        complete={planning.sectionCompleted.run_of_show}
      >
        {rosGaps.length ? <p className="mb-2 text-xs text-amber-900">{rosGaps.join(" · ")}</p> : null}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse font-body text-xs">
            <thead>
              <tr className="text-left uppercase text-kelly-slate">
                <th className="p-2">Time</th>
                <th className="p-2">Action</th>
                <th className="p-2">Owner</th>
                <th className="p-2">Location</th>
                <th className="p-2">Materials</th>
                <th className="p-2">Status</th>
                <th className="p-2" />
              </tr>
            </thead>
            <tbody>
              {planning.runOfShow.map((r, idx) => (
                <tr key={r.id} className="border-t border-kelly-text/10">
                  <td className="p-1">
                    <input
                      className="w-full rounded border px-2 py-1"
                      value={r.time}
                      onChange={(e) => {
                        const rows = [...planning.runOfShow];
                        rows[idx] = { ...r, time: e.target.value };
                        updateRos(rows);
                      }}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      className="w-full rounded border px-2 py-1"
                      value={r.action}
                      onChange={(e) => {
                        const rows = [...planning.runOfShow];
                        rows[idx] = { ...r, action: e.target.value };
                        updateRos(rows);
                      }}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      className="w-full rounded border px-2 py-1"
                      value={r.owner}
                      onChange={(e) => {
                        const rows = [...planning.runOfShow];
                        rows[idx] = { ...r, owner: e.target.value };
                        updateRos(rows);
                      }}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      className="w-full rounded border px-2 py-1"
                      value={r.location}
                      onChange={(e) => {
                        const rows = [...planning.runOfShow];
                        rows[idx] = { ...r, location: e.target.value };
                        updateRos(rows);
                      }}
                    />
                  </td>
                  <td className="p-1">
                    <input
                      className="w-full rounded border px-2 py-1"
                      value={r.materials}
                      onChange={(e) => {
                        const rows = [...planning.runOfShow];
                        rows[idx] = { ...r, materials: e.target.value };
                        updateRos(rows);
                      }}
                    />
                  </td>
                  <td className="p-1">
                    <select
                      className="rounded border px-2 py-1"
                      value={r.status}
                      onChange={(e) => {
                        const rows = [...planning.runOfShow];
                        rows[idx] = { ...r, status: e.target.value as RunOfShowRow["status"] };
                        updateRos(rows);
                      }}
                    >
                      <option value="planned">Planned</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="done">Done</option>
                      <option value="skipped">Skipped</option>
                    </select>
                  </td>
                  <td className="p-1 whitespace-nowrap">
                    <button
                      type="button"
                      className="text-[10px] font-bold text-kelly-navy"
                      onClick={() => {
                        const rows = [...planning.runOfShow];
                        if (idx > 0) {
                          [rows[idx - 1], rows[idx]] = [rows[idx], rows[idx - 1]];
                          updateRos(rows);
                        }
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="ml-1 text-[10px] font-bold text-red-800"
                      onClick={() => updateRos(planning.runOfShow.filter((x) => x.id !== r.id))}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          className="mt-2 text-xs font-bold text-kelly-navy underline"
          onClick={() =>
            updateRos([
              ...planning.runOfShow,
              {
                id: newRosId(),
                time: "",
                action: "",
                owner: "",
                location: "",
                materials: "",
                notes: "",
                status: "planned",
              },
            ])
          }
        >
          + Add row
        </button>
        footer={
          <>
            <button
              type="button"
              disabled={pending}
              className="rounded-full border px-4 py-2 text-xs font-bold"
              onClick={() =>
                runAi(async () => {
                  const res = await generateRunOfShowAction(row.recordId, planning);
                  return { planning: res.planning };
                })
              }
            >
              Generate draft
            </button>
            <button
              type="button"
              disabled={pending}
              className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white"
              onClick={() => save(planning, "run_of_show")}
            >
              Save run of show
            </button>
          </>
        }
      />

      <PlanningSection title="3. Materials / pack list" subtitle="Mark needed, packed, or not needed." complete={planning.sectionCompleted.materials}>
        <ul className="grid gap-2">
          {planning.packList.map((item, idx) => (
            <li key={item.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-kelly-text/10 p-2">
              <span className="min-w-[140px] font-body text-sm font-semibold">{item.label}</span>
              <select
                className="rounded border px-2 py-1 text-xs"
                value={item.status}
                onChange={(e) => {
                  const packList = [...planning.packList];
                  packList[idx] = { ...item, status: e.target.value as typeof item.status };
                  setPlanning((p) => ({ ...p, packList }));
                }}
              >
                <option value="needed">Needed</option>
                <option value="packed">Packed</option>
                <option value="not_needed">Not needed</option>
              </select>
              <input
                className="min-w-[120px] flex-1 rounded border px-2 py-1 text-xs"
                placeholder="Notes"
                value={item.notes ?? ""}
                onChange={(e) => {
                  const packList = [...planning.packList];
                  packList[idx] = { ...item, notes: e.target.value };
                  setPlanning((p) => ({ ...p, packList }));
                }}
              />
            </li>
          ))}
        </ul>
        footer={
          <>
            <button
              type="button"
              disabled={pending}
              className="rounded-full border px-4 py-2 text-xs font-bold"
              onClick={() =>
                runAi(async () => {
                  const res = await generatePackListAction(row.recordId, planning);
                  return { planning: res.planning };
                })
              }
            >
              Generate from event
            </button>
            <button type="button" disabled={pending} className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => save(planning, "materials")}>
              Save pack list
            </button>
          </>
        }
      />

      <PlanningSection title="4. Volunteer plan" subtitle="Headcount, roles, captain, meetup — reminders are scaffold only." complete={planning.sectionCompleted.volunteers}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Volunteers needed?" value={planning.volunteerPlan.volunteersNeeded} onChange={(v) => setPlanning((p) => ({ ...p, volunteerPlan: { ...p.volunteerPlan, volunteersNeeded: v } }))} />
          <Field label="Number needed" value={planning.volunteerPlan.numberNeeded} onChange={(v) => setPlanning((p) => ({ ...p, volunteerPlan: { ...p.volunteerPlan, numberNeeded: v } }))} />
          <Field label="Roles" value={planning.volunteerPlan.roles} onChange={(v) => setPlanning((p) => ({ ...p, volunteerPlan: { ...p.volunteerPlan, roles: v } }))} multiline />
          <Field label="Volunteer captain" value={planning.volunteerPlan.volunteerCaptain} onChange={(v) => setPlanning((p) => ({ ...p, volunteerPlan: { ...p.volunteerPlan, volunteerCaptain: v } }))} />
          <Field label="Arrival time" value={planning.volunteerPlan.arrivalTime} onChange={(v) => setPlanning((p) => ({ ...p, volunteerPlan: { ...p.volunteerPlan, arrivalTime: v } }))} />
          <Field label="Meetup location" value={planning.volunteerPlan.meetupLocation} onChange={(v) => setPlanning((p) => ({ ...p, volunteerPlan: { ...p.volunteerPlan, meetupLocation: v } }))} />
          <Field label="Reminder status" value={planning.volunteerPlan.reminderStatus} onChange={(v) => setPlanning((p) => ({ ...p, volunteerPlan: { ...p.volunteerPlan, reminderStatus: v } }))} hint="Scaffold — no SMS sent" />
        </div>
        footer={
          <>
            <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => runAi(async () => ({ planning: (await seedVolunteerPlanAction(row.recordId, planning)).planning }))}>
              Estimate needs
            </button>
            <button type="button" disabled={pending} className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => save(planning, "volunteers")}>
              Save volunteer plan
            </button>
          </>
        }
      />

      <PlanningSection title="5. Contacts" subtitle="Host, venue, CM, media, emergency." complete={planning.sectionCompleted.contacts}>
        {contactGaps.length ? <p className="mb-2 text-xs text-amber-900">Gaps: {contactGaps.join(" · ")}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["host", "Host"],
              ["hostPhone", "Host phone"],
              ["venue", "Venue"],
              ["campaignPointPerson", "Campaign point person"],
              ["volunteerCaptain", "Volunteer captain"],
              ["candidateHandler", "Candidate handler"],
              ["mediaContact", "Media contact"],
              ["emergencyContact", "Emergency contact"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={planning.contacts[key]}
              onChange={(v) => setPlanning((p) => ({ ...p, contacts: { ...p.contacts, [key]: v } }))}
            />
          ))}
        </div>
        footer={
          <>
            <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => runAi(async () => ({ planning: (await seedContactsAction(row.recordId, planning)).planning }))}>
              Pull from fact card
            </button>
            <button type="button" disabled={pending} className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => save(planning, "contacts")}>
              Save contacts
            </button>
          </>
        }
      />

      <PlanningSection title="6. Candidate brief" subtitle="For Kelly — generate then edit before sharing." complete={planning.sectionCompleted.candidate_brief}>
        <div className="grid gap-3">
          <Field label="Summary" value={planning.candidateBrief.summary} onChange={(v) => setPlanning((p) => ({ ...p, candidateBrief: { ...p.candidateBrief, summary: v } }))} multiline />
          <Field label="Talking points" value={planning.candidateBrief.talkingPoints} onChange={(v) => setPlanning((p) => ({ ...p, candidateBrief: { ...p.candidateBrief, talkingPoints: v } }))} multiline />
          <Field label="People to know" value={planning.candidateBrief.peopleToKnow} onChange={(v) => setPlanning((p) => ({ ...p, candidateBrief: { ...p.candidateBrief, peopleToKnow: v } }))} />
          <Field label="Strategic purpose" value={planning.candidateBrief.strategicPurpose} onChange={(v) => setPlanning((p) => ({ ...p, candidateBrief: { ...p.candidateBrief, strategicPurpose: v } }))} multiline />
          <Field label="Travel notes" value={planning.candidateBrief.travelNotes} onChange={(v) => setPlanning((p) => ({ ...p, candidateBrief: { ...p.candidateBrief, travelNotes: v } }))} />
          <Field label="Timing notes" value={planning.candidateBrief.timingNotes} onChange={(v) => setPlanning((p) => ({ ...p, candidateBrief: { ...p.candidateBrief, timingNotes: v } }))} multiline />
          <Field label="Risks / watchouts" value={planning.candidateBrief.risks} onChange={(v) => setPlanning((p) => ({ ...p, candidateBrief: { ...p.candidateBrief, risks: v } }))} multiline />
        </div>
        footer={
          <>
            <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => runAi(async () => ({ planning: (await generateCandidateBriefAction(row.recordId, planning)).planning }))}>
              Generate brief
            </button>
            <button type="button" disabled={pending} className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => save(planning, "candidate_brief")}>
              Save candidate brief
            </button>
          </>
        }
      />

      <PlanningSection title="7. Campaign manager brief" subtitle="Logistics, owners, deadlines — human-controlled." complete={planning.sectionCompleted.cm_brief}>
        <div className="grid gap-3">
          <Field label="Logistics summary" value={planning.cmBrief.logisticsSummary} onChange={(v) => setPlanning((p) => ({ ...p, cmBrief: { ...p.cmBrief, logisticsSummary: v } }))} multiline />
          <Field label="Missing items" value={planning.cmBrief.missingItems} onChange={(v) => setPlanning((p) => ({ ...p, cmBrief: { ...p.cmBrief, missingItems: v } }))} multiline />
          <Field label="Owner assignments" value={planning.cmBrief.ownerAssignments || suggestOwnerAssignments(planning)} onChange={(v) => setPlanning((p) => ({ ...p, cmBrief: { ...p.cmBrief, ownerAssignments: v } }))} multiline />
          <Field label="Deadlines" value={planning.cmBrief.deadlines} onChange={(v) => setPlanning((p) => ({ ...p, cmBrief: { ...p.cmBrief, deadlines: v } }))} multiline />
          <Field label="Risks" value={planning.cmBrief.risks} onChange={(v) => setPlanning((p) => ({ ...p, cmBrief: { ...p.cmBrief, risks: v } }))} multiline />
          <Field label="Next actions" value={planning.cmBrief.nextActions} onChange={(v) => setPlanning((p) => ({ ...p, cmBrief: { ...p.cmBrief, nextActions: v } }))} multiline />
        </div>
        {eventTypeHints.length ? (
          <ul className="mt-3 rounded-lg bg-kelly-wash/50 p-3 font-body text-xs">
            {eventTypeHints.map((h) => (
              <li key={h}>• {h}</li>
            ))}
          </ul>
        ) : null}
        footer={
          <>
            <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => runAi(async () => ({ planning: (await generateCmBriefAction(row.recordId, planning)).planning }))}>
              Generate CM brief
            </button>
            <button type="button" disabled={pending} className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => save(planning, "cm_brief")}>
              Save CM brief
            </button>
          </>
        }
      />

      <PlanningSection title="8. Cost / budget" subtitle="Estimates and reimbursement link — not FIN-1 posting." complete={planning.sectionCompleted.budget}>
        <div className="grid gap-3">
          <Field label="Estimated costs" value={planning.budget.estimatedCosts} onChange={(v) => setPlanning((p) => ({ ...p, budget: { ...p.budget, estimatedCosts: v } }))} multiline />
          <Field label="Actual costs" value={planning.budget.actualCosts} onChange={(v) => setPlanning((p) => ({ ...p, budget: { ...p.budget, actualCosts: v } }))} multiline />
          <Field label="Reimbursement notes" value={planning.budget.reimbursementNotes} onChange={(v) => setPlanning((p) => ({ ...p, budget: { ...p.budget, reimbursementNotes: v } }))} hint={`Travel: ${row.travelLine}`} />
          <Field label="Receipts placeholder" value={planning.budget.receiptsPlaceholder} onChange={(v) => setPlanning((p) => ({ ...p, budget: { ...p.budget, receiptsPlaceholder: v } }))} />
          <Field label="Notes" value={planning.budget.notes} onChange={(v) => setPlanning((p) => ({ ...p, budget: { ...p.budget, notes: v } }))} multiline />
        </div>
        <Link href={reimbursementHref(month)} className="mt-2 inline-block text-xs font-bold text-kelly-navy underline">
          Open {month} reimbursement report →
        </Link>
        footer={
          <button type="button" disabled={pending} className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => save(planning, "budget")}>
            Save budget notes
          </button>
        }
      />

      <p className="font-body text-[11px] text-kelly-text/45 print:hidden">
        Saves write to the campaign event ledger only. High-risk actions (email send, calendar write, approval decisions) stay on
        their gated screens.
      </p>
    </div>
  );
}
