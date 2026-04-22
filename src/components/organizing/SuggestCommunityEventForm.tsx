"use client";

import { useId } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { suggestCommunityEventAction, type SuggestCommunityEventResult } from "@/app/(site)/events/suggest-community-event-action";
import { cn } from "@/lib/utils";

type CountyOption = { id: string; displayName: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded-md bg-red-dirt px-4 py-2.5 font-body text-sm font-bold text-cream-canvas shadow-sm transition hover:opacity-95 disabled:opacity-50"
      disabled={pending}
    >
      {pending ? "Sending…" : "Submit for review"}
    </button>
  );
}

const initial: SuggestCommunityEventResult | null = null;

type Props = { counties: CountyOption[]; idPrefix: string };

export function SuggestCommunityEventForm({ counties, idPrefix }: Props) {
  const [state, formAction] = useFormState(suggestCommunityEventAction, initial);
  const uid = useId();
  const p = (name: string) => `${idPrefix}-${uid}-${name}`;

  return (
    <form action={formAction} className="mt-4 space-y-4 font-body" noValidate>
      {state && !state.ok && state.error ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950" role="alert">
          {state.error}
        </p>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm" htmlFor={p("eventName")}>
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Event name *</span>
          <input
            id={p("eventName")}
            name="eventName"
            required
            maxLength={200}
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
            autoComplete="off"
          />
          {state && !state.ok && state.fieldErrors?.eventName ? (
            <span className="mt-0.5 block text-xs text-red-800">{state.fieldErrors.eventName}</span>
          ) : null}
        </label>
        <label className="block text-sm" htmlFor={p("venueName")}>
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Venue (optional)</span>
          <input
            id={p("venueName")}
            name="venueName"
            maxLength={200}
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
            autoComplete="off"
          />
        </label>
      </div>
      <p className="text-xs text-deep-soil/60">All times are U.S. Central (Arkansas).</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm" htmlFor={p("startDate")}>
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Start date *</span>
          <input
            id={p("startDate")}
            name="startDate"
            type="date"
            required
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm" htmlFor={p("startTime")}>
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Start time *</span>
          <input
            id={p("startTime")}
            name="startTime"
            type="time"
            required
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
          />
          {state && !state.ok && state.fieldErrors?.startTime ? (
            <span className="mt-0.5 block text-xs text-red-800">{state.fieldErrors.startTime}</span>
          ) : null}
        </label>
        <label className="block text-sm" htmlFor={p("endDate")}>
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">End date *</span>
          <input
            id={p("endDate")}
            name="endDate"
            type="date"
            required
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm" htmlFor={p("endTime")}>
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">End time *</span>
          <input
            id={p("endTime")}
            name="endTime"
            type="time"
            required
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
          />
          {state && !state.ok && state.fieldErrors?.endTime ? (
            <span className="mt-0.5 block text-xs text-red-800">{state.fieldErrors.endTime}</span>
          ) : null}
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm" htmlFor={p("city")}>
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">City or town (optional)</span>
          <input
            id={p("city")}
            name="city"
            maxLength={120}
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
            autoComplete="address-level2"
          />
        </label>
        <label className="block text-sm" htmlFor={p("countyId")}>
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">County (optional)</span>
          <select
            id={p("countyId")}
            name="countyId"
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
            defaultValue=""
          >
            <option value="">—</option>
            {counties.map((c) => (
              <option key={c.id} value={c.id}>
                {c.displayName}
              </option>
            ))}
          </select>
          {state && !state.ok && state.fieldErrors?.countyId ? (
            <span className="mt-0.5 block text-xs text-red-800">{state.fieldErrors.countyId}</span>
          ) : null}
        </label>
      </div>
      <label className="block text-sm" htmlFor={p("infoUrl")}>
        <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Link to details (optional)</span>
        <input
          id={p("infoUrl")}
          name="infoUrl"
          type="url"
          inputMode="url"
          placeholder="https://"
          className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
        />
        {state && !state.ok && state.fieldErrors?.infoUrl ? (
          <span className="mt-0.5 block text-xs text-red-800">{state.fieldErrors.infoUrl}</span>
        ) : null}
      </label>
      <label className="block text-sm" htmlFor={p("shortDescription")}>
        <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">What is it? (optional)</span>
        <textarea
          id={p("shortDescription")}
          name="shortDescription"
          rows={3}
          maxLength={2000}
          className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
        />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm" htmlFor={p("submitterName")}>
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Your name *</span>
          <input
            id={p("submitterName")}
            name="submitterName"
            required
            maxLength={120}
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
            autoComplete="name"
          />
          {state && !state.ok && state.fieldErrors?.submitterName ? (
            <span className="mt-0.5 block text-xs text-red-800">{state.fieldErrors.submitterName}</span>
          ) : null}
        </label>
        <label className="block text-sm" htmlFor={p("submitterEmail")}>
          <span className="text-xs font-semibold uppercase tracking-wider text-deep-soil/55">Your email *</span>
          <input
            id={p("submitterEmail")}
            name="submitterEmail"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-deep-soil/15 bg-white px-3 py-2 text-sm"
            autoComplete="email"
          />
          {state && !state.ok && state.fieldErrors?.submitterEmail ? (
            <span className="mt-0.5 block text-xs text-red-800">{state.fieldErrors.submitterEmail}</span>
          ) : null}
        </label>
      </div>
      <div className="hidden" aria-hidden>
        <label htmlFor={p("website")}>Company website</label>
        <input id={p("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <p className="text-xs text-deep-soil/60">
        Submissions are reviewed before anything appears on the public calendar. This is for neighborhood fairs, festivals, and
        public gatherings—not campaign scheduling (see{" "}
        <a href="/host-a-gathering" className="font-semibold text-red-dirt underline">
          host a gathering
        </a>
        ).
      </p>
      <SubmitButton />
    </form>
  );
}
