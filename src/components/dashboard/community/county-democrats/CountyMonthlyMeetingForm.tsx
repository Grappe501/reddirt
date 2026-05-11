"use client";

import { useFormState } from "react-dom";

import {
  createCountyPartyMonthlyMeetingAction,
  type CreateCountyPartyMeetingState,
} from "@/lib/volunteer-ops/county-party-meeting-actions";

const initial: CreateCountyPartyMeetingState = { ok: false, message: "" };

export function CountyMonthlyMeetingForm({ countySlug, countyDisplayName }: { countySlug: string; countyDisplayName: string }) {
  const [state, formAction] = useFormState(createCountyPartyMonthlyMeetingAction, initial);

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6">
      <input type="hidden" name="countySlug" value={countySlug} />
      <h3 className="font-heading text-lg font-bold text-kelly-navy">Schedule or update monthly meeting</h3>
      <p className="font-body text-sm text-kelly-text/80">
        Creates a <span className="font-semibold">MEETING</span> on the campaign calendar for {countyDisplayName} with{" "}
        <span className="font-mono text-xs">campaignIntent = county_party_monthly</span>. On save, the{" "}
        <span className="font-semibold">EVENT_CREATED</span> workflow spawns a three-step action queue (P5 invites → RSVP nudge →
        post-meeting debrief). Staff can link Email Automation sends to those tasks in the Communication Command Center.
      </p>

      <div>
        <label htmlFor="cd-title" className="font-body text-xs font-bold uppercase text-kelly-text/55">
          Title (optional)
        </label>
        <input
          id="cd-title"
          name="title"
          className="mt-1 w-full rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
          placeholder={`[County Democratic Party] ${countyDisplayName} — Monthly meeting`}
        />
      </div>
      <div>
        <label htmlFor="cd-start" className="font-body text-xs font-bold uppercase text-kelly-text/55">
          Start *
        </label>
        <input
          id="cd-start"
          name="startAt"
          type="datetime-local"
          required
          className="mt-1 w-full rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
        />
      </div>
      <div>
        <label htmlFor="cd-loc" className="font-body text-xs font-bold uppercase text-kelly-text/55">
          Venue
        </label>
        <input
          id="cd-loc"
          name="locationName"
          className="mt-1 w-full rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
          placeholder="Union hall, library, party HQ…"
        />
      </div>
      <div>
        <label htmlFor="cd-agenda" className="font-body text-xs font-bold uppercase text-kelly-text/55">
          Agenda
        </label>
        <textarea
          id="cd-agenda"
          name="agenda"
          rows={4}
          className="mt-1 w-full rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
          placeholder="Call to order, officer reports, guest speakers, new business…"
        />
      </div>
      <div>
        <label htmlFor="cd-speakers" className="font-body text-xs font-bold uppercase text-kelly-text/55">
          Featured speakers
        </label>
        <input
          id="cd-speakers"
          name="featuredSpeakers"
          className="mt-1 w-full rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cd-rsvp" className="font-body text-xs font-bold uppercase text-kelly-text/55">
            RSVP goal
          </label>
          <input id="cd-rsvp" name="rsvpGoal" type="number" min={0} className="mt-1 w-full rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm" />
        </div>
        <div>
          <label htmlFor="cd-new" className="font-body text-xs font-bold uppercase text-kelly-text/55">
            New attendee goal
          </label>
          <input
            id="cd-new"
            name="newAttendeeGoal"
            type="number"
            min={0}
            className="mt-1 w-full rounded-lg border border-kelly-text/15 bg-white px-3 py-2 font-body text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        className="rounded-lg bg-kelly-navy px-4 py-2.5 font-body text-sm font-semibold text-white hover:bg-kelly-deep"
      >
        Create meeting &amp; action queue
      </button>

      {state.message ? (
        <p
          className={`rounded-lg px-3 py-2 font-body text-sm ${state.ok ? "bg-kelly-success/15 text-kelly-deep" : "bg-kelly-gold/20 text-kelly-deep"}`}
        >
          {state.message}
          {state.ok ? <span className="mt-1 block font-mono text-[11px] text-kelly-text/70">event id: {state.eventId}</span> : null}
        </p>
      ) : null}
    </form>
  );
}
