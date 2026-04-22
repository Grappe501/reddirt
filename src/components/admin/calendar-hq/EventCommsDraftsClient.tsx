"use client";

import { useFormState } from "react-dom";
import { useEffect, useRef } from "react";
import {
  generateEventCommsDraftAction,
  type EventCommsDraftResult,
} from "@/app/admin/event-comms-actions";

const initial: EventCommsDraftResult = { ok: false, error: "" };

type Kind = "reminder_sms" | "reminder_email" | "cancellation" | "thank_you" | "volunteer_followup";

const BTN =
  "rounded border border-deep-soil/15 bg-white px-1 py-0.5 text-[7px] font-bold leading-tight text-deep-soil/90 hover:border-red-dirt/30";

export function EventCommsDraftsClient({ eventId }: { eventId: string }) {
  const [state, formAction] = useFormState(generateEventCommsDraftAction, initial);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  useEffect(() => {
    if (state && "ok" in state && state.ok) taRef.current?.focus();
  }, [state]);

  return (
    <div className="mt-1 space-y-1">
      {(
        [
          ["reminder_sms", "SMS reminder"],
          ["reminder_email", "Email reminder"],
          ["cancellation", "Cancel notice"],
          ["thank_you", "Thank-you"],
          ["volunteer_followup", "Vol. follow-up"],
        ] as [Kind, string][]
      ).map(([kind, label]) => (
        <form key={kind} action={formAction} className="flex flex-wrap items-end gap-0.5">
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="kind" value={kind} />
          <button type="submit" className={BTN} title="AI draft (OpenAI)">
            {label} →
          </button>
        </form>
      ))}
      {state && "ok" in state && !state.ok && state.error ? <p className="text-[8px] text-rose-800">{state.error}</p> : null}
      {state && "ok" in state && state.ok ? (
        <textarea
          ref={taRef}
          readOnly
          className="mt-0.5 min-h-[72px] w-full resize-y border border-field-green/30 bg-white p-1 font-mono text-[8px] text-deep-soil/90"
          value={state.text}
        />
      ) : null}
    </div>
  );
}
