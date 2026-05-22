"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CalendarSurfaceRow } from "@/lib/campaign-events/load-campaign-calendar-events";
import type { HotWashIntelligenceData } from "@/lib/campaign-events/hot-wash-intelligence/hot-wash-intelligence-types";
import {
  buildFollowUpRecommendations,
  scoreEventEnergy,
} from "@/lib/campaign-events/hot-wash-intelligence/event-intelligence-helpers";
import {
  completeHotWashIntelligenceAction,
  generateBlueprintFromHotWashAction,
  loadCountyMemoryPreviewAction,
  saveHotWashIntelligenceAction,
} from "@/app/admin/(board)/campaign-events/hot-wash-intelligence-actions";
import { Field, PlanningSection } from "../planning/PlanningSection";

export function HotWashIntelligenceWorkspace({
  row,
  initial,
}: {
  row: CalendarSurfaceRow;
  initial: HotWashIntelligenceData;
}) {
  const router = useRouter();
  const [intel, setIntel] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [countyPreview, setCountyPreview] = useState<string | null>(null);

  const energy = useMemo(() => scoreEventEnergy(intel), [intel]);
  const followUps = useMemo(() => buildFollowUpRecommendations(intel), [intel]);

  const save = () => {
    startTransition(async () => {
      await saveHotWashIntelligenceAction(row.recordId, intel);
      setMessage("Saved.");
      router.refresh();
    });
  };

  const complete = () => {
    startTransition(async () => {
      const res = await completeHotWashIntelligenceAction(row.recordId, intel);
      setMessage(
        res.loop.blueprintCreated
          ? "Hot wash complete — county memory updated, blueprint created."
          : "Hot wash complete — county memory updated.",
      );
      router.refresh();
    });
  };

  const patchOutcome = (key: keyof HotWashIntelligenceData["outcome"], v: string) =>
    setIntel((p) => ({ ...p, outcome: { ...p.outcome, [key]: v } }));

  return (
    <div className="flex flex-col gap-4">
      <header className="rounded-2xl border border-kelly-navy/20 bg-kelly-navy/[0.04] p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-kelly-slate">Post-event intelligence review</p>
        <p className="mt-2 font-body text-sm text-kelly-muted">
          Reflect, capture lessons, and feed county memory. Nothing publishes automatically — complete review runs the
          learning loop (county memory + optional blueprint).
        </p>
        {intel.executiveSummary ? (
          <p className="mt-3 rounded-lg bg-white/80 p-3 font-body text-sm">{intel.executiveSummary}</p>
        ) : null}
        {intel.topFindings.length ? (
          <ul className="mt-2 list-disc pl-5 font-body text-xs text-kelly-navy">
            {intel.topFindings.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        ) : null}
      </header>

      {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-950">{message}</p> : null}

      <PlanningSection title="1. Event outcome summary" subtitle="Attendance, quality, energy, performance." defaultOpen>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Attendance estimate" value={intel.outcome.attendanceEstimate} onChange={(v) => patchOutcome("attendanceEstimate", v)} />
          <Field label="Energy score (1–10 or words)" value={intel.outcome.energyScore} onChange={(v) => patchOutcome("energyScore", v)} hint={energy.label} />
          <Field label="Audience quality" value={intel.outcome.audienceQuality} onChange={(v) => patchOutcome("audienceQuality", v)} />
          <Field label="Persuasion quality" value={intel.outcome.persuasionQuality} onChange={(v) => patchOutcome("persuasionQuality", v)} />
          <Field label="Volunteer quality" value={intel.outcome.volunteerQuality} onChange={(v) => patchOutcome("volunteerQuality", v)} />
          <Field label="Donor quality" value={intel.outcome.donorQuality} onChange={(v) => patchOutcome("donorQuality", v)} />
          <Field label="Media outcome" value={intel.outcome.mediaOutcome} onChange={(v) => patchOutcome("mediaOutcome", v)} />
          <Field label="Candidate performance" value={intel.outcome.candidatePerformance} onChange={(v) => patchOutcome("candidatePerformance", v)} />
          <Field label="Organizer performance" value={intel.outcome.organizerPerformance} onChange={(v) => patchOutcome("organizerPerformance", v)} />
          <Field label="Strategic value" value={intel.outcome.strategicValue} onChange={(v) => patchOutcome("strategicValue", v)} multiline />
        </div>
      </PlanningSection>

      <PlanningSection title="2. Lessons learned" subtitle="What worked, failed, and what to do differently." defaultOpen={false}>
        <div className="grid gap-3">
          {(
            [
              ["whatWorked", "What worked"],
              ["whatFailed", "What failed"],
              ["surprises", "Surprises"],
              ["timingIssues", "Timing issues"],
              ["venueIssues", "Venue issues"],
              ["messagingReactions", "Messaging reactions"],
              ["volunteerObservations", "Volunteer observations"],
              ["futureRecommendations", "Future recommendations"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={intel.lessons[key]}
              onChange={(v) => setIntel((p) => ({ ...p, lessons: { ...p.lessons, [key]: v } }))}
              multiline
            />
          ))}
        </div>
      </PlanningSection>

      <PlanningSection title="3. Messaging intelligence" defaultOpen={false}>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["strongestReactions", "Strongest reactions"],
              ["applauseLines", "Applause lines"],
              ["strongestIssues", "Strongest issues"],
              ["concernsRaised", "Concerns raised"],
              ["oppositionThemes", "Opposition themes"],
              ["localIssuePatterns", "Local issue patterns"],
              ["emotionalTone", "Emotional tone"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={intel.messaging[key]}
              onChange={(v) => setIntel((p) => ({ ...p, messaging: { ...p.messaging, [key]: v } }))}
              multiline={key !== "emotionalTone"}
            />
          ))}
        </div>
      </PlanningSection>

      <PlanningSection title="4. Relationship intelligence" defaultOpen={false}>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["newLeadersMet", "New leaders met"],
              ["influentialAttendees", "Influential attendees"],
              ["volunteerProspects", "Volunteer prospects"],
              ["donorProspects", "Donor prospects"],
              ["coalitionOpportunities", "Coalition opportunities"],
              ["hostileAttendees", "Hostile attendees"],
              ["followUpNeeds", "Follow-up needs"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={intel.relationships[key]}
              onChange={(v) => setIntel((p) => ({ ...p, relationships: { ...p.relationships, [key]: v } }))}
              multiline
            />
          ))}
        </div>
      </PlanningSection>

      <PlanningSection title="5. County strategic signals" defaultOpen={false}>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["enthusiasm", "Enthusiasm"],
              ["turnoutPotential", "Turnout potential"],
              ["persuasionPotential", "Persuasion potential"],
              ["organizationalStrength", "Organizational strength"],
              ["volunteerDepth", "Volunteer depth"],
              ["issueEnvironment", "Issue environment"],
              ["oppositionVisibility", "Opposition visibility"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={intel.countySignals[key]}
              onChange={(v) => setIntel((p) => ({ ...p, countySignals: { ...p.countySignals, [key]: v } }))}
            />
          ))}
        </div>
        {row.county ? (
          <button
            type="button"
            className="mt-2 text-xs font-bold text-kelly-navy underline"
            onClick={() =>
              startTransition(async () => {
                const res = await loadCountyMemoryPreviewAction(row.county!);
                setCountyPreview(`County memory: ${res.memory.eventCount} events · issues: ${res.memory.recurringIssues.slice(0, 3).join(", ") || "—"}`);
              })
            }
          >
            Preview county memory ({row.county})
          </button>
        ) : null}
        {countyPreview ? <p className="mt-1 text-xs text-kelly-muted">{countyPreview}</p> : null}
      </PlanningSection>

      <PlanningSection
        title="6. Follow-up actions"
        defaultOpen={false}
        footer={
          <>
            <button type="button" disabled={pending} className="rounded-full border px-4 py-2 text-xs font-bold" onClick={save}>
              Save draft
            </button>
            <button
              type="button"
              disabled={pending}
              className="rounded-full border px-4 py-2 text-xs font-bold"
              onClick={() =>
                startTransition(async () => {
                  const res = await generateBlueprintFromHotWashAction(row.recordId, intel);
                  setMessage(res.blueprint ? `Blueprint: ${res.blueprint.title}` : "No blueprint type matched this event.");
                })
              }
            >
              Generate blueprint
            </button>
            <button type="button" disabled={pending} className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={complete}>
              Complete review &amp; update memory
            </button>
          </>
        }
      >
        <ul className="mb-3 font-body text-xs text-amber-900">
          {followUps.map((t) => (
            <li key={t}>→ {t}</li>
          ))}
        </ul>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["thankYouNeeded", "Thank-you needed"],
              ["donorFollowUp", "Donor follow-up"],
              ["volunteerOnboarding", "Volunteer onboarding"],
              ["pressFollowUp", "Press follow-up"],
              ["hostFollowUp", "Host follow-up"],
              ["countyOrganizerTasks", "County organizer tasks"],
              ["futureEventRecommendation", "Future event recommendation"],
            ] as const
          ).map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={intel.followUp[key]}
              onChange={(v) => setIntel((p) => ({ ...p, followUp: { ...p.followUp, [key]: v } }))}
              multiline
            />
          ))}
        </div>
      </PlanningSection>
    </div>
  );
}
