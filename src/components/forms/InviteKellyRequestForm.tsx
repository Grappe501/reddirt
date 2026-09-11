"use client";

import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/components/forms/FormField";
import { FormLabel } from "@/components/forms/FormLabel";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { Button } from "@/components/ui/Button";
import { FormErrorSummary, FormSuccessPanel } from "@/components/forms/FormMessages";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import {
  INVITE_KELLY_AUDIENCE_BANDS,
  INVITE_KELLY_AUDIENCE_LABELS,
  INVITE_KELLY_ROLE_LABELS,
  INVITE_KELLY_ROLES,
  INVITE_KELLY_TIME_LABELS,
  INVITE_KELLY_TIME_WINDOWS,
  PUBLIC_SCHEDULE_EVENT_TYPE_LABELS,
  PUBLIC_SCHEDULE_EVENT_TYPES,
  scheduleCampaignEventBodySchema,
  type ScheduleCampaignEventBody,
} from "@/lib/forms/public-schedule-schema";

const selectClass =
  "w-full rounded-btn border border-kelly-border bg-[var(--color-surface-elevated)] px-4 py-3 text-base text-kelly-text focus:border-kelly-navy focus:outline-none focus:ring-2 focus:ring-kelly-navy/25";

const MAX_DATES = 8;

type ApiOk = {
  ok: true;
  publicAssistant: {
    intakeStatus: string;
    publicMessage: string;
    suggestedWindows: { label: string; startAt: string; endAt: string; reasonPublic: string }[];
  };
};

function emptyDates(): string[] {
  return ["", "", ""];
}

export function InviteKellyRequestForm({ id = "invite-form" }: { id?: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [assistant, setAssistant] = useState<ApiOk["publicAssistant"] | null>(null);
  const [dateSlots, setDateSlots] = useState<string[]>(emptyDates());

  const form = useForm<ScheduleCampaignEventBody>({
    resolver: zodResolver(scheduleCampaignEventBodySchema),
    defaultValues: {
      requesterName: "",
      organization: "",
      email: "",
      phone: "",
      eventTitle: "",
      eventType: "house_party",
      kellyRole: "not_sure",
      audienceBand: "not_sure",
      timeWindow: "flexible",
      county: "",
      city: "",
      address: "",
      preferredDate: "",
      alternateDates: [],
      alternateDatesText: "",
      preferredStartTime: "",
      preferredEndTime: "",
      flexibility: "same_month",
      audienceSize: undefined,
      eventPurpose: "",
      eventVisibility: "public",
      pressInvited: false,
      pressReleaseInterest: "staff_decide",
      localIssueAngle: "",
      speakingRequested: false,
      localHostAvailable: true,
      notes: "",
      permissionToContact: false,
      website: "",
    },
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const filled = dateSlots.map((d) => d.trim()).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d));
    form.setValue("preferredDate", filled[0] ?? "");
    form.setValue("alternateDates", filled.slice(1));
    await form.handleSubmit(async (data) => {
    setServerError(null);
    setAssistant(null);
    const payload = {
      ...data,
      preferredDate: filled[0] ?? "",
      alternateDates: filled.slice(1),
    };
    const res = await fetch("/api/forms/schedule-campaign-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as ApiOk & { ok?: boolean; error?: string; fields?: Record<string, string> };
    if (!res.ok) {
      if (json.fields) {
        Object.entries(json.fields).forEach(([k, v]) => {
          form.setError(k as keyof ScheduleCampaignEventBody, { message: v });
        });
      }
      setServerError(json.error === "rate_limited" ? "Please wait a moment and try again." : (json.error ?? "Something went wrong."));
      return;
    }
    if (json.ok) {
      setAssistant(json.publicAssistant);
      setShowSuccess(true);
    }
    })();
  };

  if (showSuccess && assistant) {
    return (
      <div id={id} className="space-y-6">
        <FormSuccessPanel title="We have your invitation">
          <p className="font-semibold text-kelly-text">{assistant.publicMessage}</p>
          {assistant.suggestedWindows.length ? (
            <div className="mt-4">
              <p className="font-body text-sm font-semibold text-kelly-navy">Dates that look more open</p>
              <ul className="mt-2 list-inside list-disc text-sm text-kelly-text/85">
                {assistant.suggestedWindows.map((w) => (
                  <li key={w.startAt + w.label}>
                    <span className="font-semibold">{w.label}</span>
                    {w.reasonPublic ? ` — ${w.reasonPublic}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p className="mt-4 font-body text-sm text-kelly-text/75">
            Someone from the campaign will follow up by email. Nothing is booked until you hear from us.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => {
              setShowSuccess(false);
              setAssistant(null);
              setDateSlots(emptyDates());
              form.reset();
            }}
          >
            Send another invitation
          </Button>
        </FormSuccessPanel>
      </div>
    );
  }

  return (
    <div id={id} className="scroll-mt-24">
      <form onSubmit={submit} className="space-y-10">
        <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...form.register("website")} />

        {serverError ? <FormErrorSummary errors={{ server: serverError }} /> : null}

        <section className="space-y-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-kelly-ink">1. Who you are</h2>
            <p className="mt-1 font-body text-sm text-kelly-text/70">So we can get back to you.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField>
              <FormLabel htmlFor="ik-name">Your name</FormLabel>
              <Input id="ik-name" {...form.register("requesterName")} autoComplete="name" />
              {form.formState.errors.requesterName ? (
                <p className="text-sm text-kelly-navy">{form.formState.errors.requesterName.message}</p>
              ) : null}
            </FormField>
            <FormField>
              <FormLabel htmlFor="ik-org">Group or organization (optional)</FormLabel>
              <Input id="ik-org" {...form.register("organization")} placeholder="County party, club, church, or leave blank" />
            </FormField>
            <FormField>
              <FormLabel htmlFor="ik-email">Email</FormLabel>
              <Input id="ik-email" type="email" {...form.register("email")} autoComplete="email" />
              {form.formState.errors.email ? (
                <p className="text-sm text-kelly-navy">{form.formState.errors.email.message}</p>
              ) : null}
            </FormField>
            <FormField>
              <FormLabel htmlFor="ik-phone">Phone</FormLabel>
              <Input id="ik-phone" type="tel" {...form.register("phone")} autoComplete="tel" />
              {form.formState.errors.phone ? (
                <p className="text-sm text-kelly-navy">{form.formState.errors.phone.message}</p>
              ) : null}
            </FormField>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-kelly-ink">2. What you want to host</h2>
            <p className="mt-1 font-body text-sm text-kelly-text/70">Pick the closest fit. You can add details below.</p>
          </div>
          <FormField>
            <FormLabel htmlFor="ik-type">Kind of gathering</FormLabel>
            <select id="ik-type" className={selectClass} {...form.register("eventType")}>
              {PUBLIC_SCHEDULE_EVENT_TYPES.map((k) => (
                <option key={k} value={k}>
                  {PUBLIC_SCHEDULE_EVENT_TYPE_LABELS[k]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField>
            <FormLabel htmlFor="ik-role">What should Kelly do?</FormLabel>
            <select id="ik-role" className={selectClass} {...form.register("kellyRole")}>
              {INVITE_KELLY_ROLES.map((k) => (
                <option key={k} value={k}>
                  {INVITE_KELLY_ROLE_LABELS[k]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField>
            <FormLabel htmlFor="ik-vis">Who is invited?</FormLabel>
            <select id="ik-vis" className={selectClass} {...form.register("eventVisibility")}>
              <option value="public">Open to the public</option>
              <option value="private">Private / invitation only</option>
            </select>
          </FormField>
          <FormField>
            <FormLabel htmlFor="ik-crowd">About how many people?</FormLabel>
            <select id="ik-crowd" className={selectClass} {...form.register("audienceBand")}>
              {INVITE_KELLY_AUDIENCE_BANDS.map((k) => (
                <option key={k} value={k}>
                  {INVITE_KELLY_AUDIENCE_LABELS[k]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField>
            <FormLabel htmlFor="ik-purpose">What should neighbors walk away knowing? (optional)</FormLabel>
            <Textarea
              id="ik-purpose"
              rows={3}
              {...form.register("eventPurpose")}
              placeholder="A sentence or two is enough."
            />
          </FormField>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-kelly-ink">3. Where</h2>
            <p className="mt-1 font-body text-sm text-kelly-text/70">County first. Venue can be “my house” or a hall name.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField>
              <FormLabel htmlFor="ik-county">County</FormLabel>
              <select id="ik-county" className={selectClass} {...form.register("county")}>
                <option value="">Choose a county</option>
                {ARKANSAS_COUNTY_REGISTRY.map((c) => (
                  <option key={c.slug} value={c.displayName}>
                    {c.displayName}
                  </option>
                ))}
              </select>
              {form.formState.errors.county ? (
                <p className="text-sm text-kelly-navy">{form.formState.errors.county.message}</p>
              ) : null}
            </FormField>
            <FormField>
              <FormLabel htmlFor="ik-city">City or town</FormLabel>
              <Input id="ik-city" {...form.register("city")} />
            </FormField>
          </div>
          <FormField>
            <FormLabel htmlFor="ik-address">Venue (optional)</FormLabel>
            <Input id="ik-address" {...form.register("address")} placeholder="Living room, church hall, fairgrounds…" />
          </FormField>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-kelly-ink">4. Dates that could work</h2>
            <p className="mt-1 font-body text-sm text-kelly-text/70">
              Give us as many options as you can. More dates make it much easier to fit the calendar.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {dateSlots.map((value, i) => (
              <FormField key={`date-${i}`}>
                <FormLabel htmlFor={`ik-date-${i}`}>{i === 0 ? "First choice" : `Another date ${i}`}</FormLabel>
                <Input
                  id={`ik-date-${i}`}
                  type="date"
                  value={value}
                  onChange={(e) => {
                    const next = [...dateSlots];
                    next[i] = e.target.value;
                    setDateSlots(next);
                    const filled = next.filter((d) => d);
                    form.setValue("preferredDate", filled[0] ?? "", { shouldValidate: true });
                  }}
                />
              </FormField>
            ))}
          </div>
          {form.formState.errors.preferredDate ? (
            <p className="text-sm text-kelly-navy">Add at least one date, or choose “Any date we can find.”</p>
          ) : null}
          {dateSlots.length < MAX_DATES ? (
            <button
              type="button"
              className="font-body text-sm font-semibold text-kelly-navy underline underline-offset-2"
              onClick={() => setDateSlots((d) => [...d, ""])}
            >
              Add another date
            </button>
          ) : null}
          <FormField>
            <FormLabel htmlFor="ik-time">Time of day</FormLabel>
            <select id="ik-time" className={selectClass} {...form.register("timeWindow")}>
              {INVITE_KELLY_TIME_WINDOWS.map((k) => (
                <option key={k} value={k}>
                  {INVITE_KELLY_TIME_LABELS[k]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField>
            <FormLabel htmlFor="ik-flex">If those dates are tight</FormLabel>
            <select id="ik-flex" className={selectClass} {...form.register("flexibility")}>
              <option value="same_week">Nearby days that same week are fine</option>
              <option value="same_month">Other days that month are fine</option>
              <option value="campaign_suggests">Any date we can find</option>
              <option value="exact_date_only">Only the dates I listed</option>
            </select>
          </FormField>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="font-heading text-xl font-bold text-kelly-ink">5. Anything else?</h2>
          </div>
          <label className="flex items-start gap-2 font-body text-sm text-kelly-text">
            <input type="checkbox" {...form.register("localHostAvailable")} className="mt-1" />
            <span>I can be there to host or greet people.</span>
          </label>
          <label className="flex items-start gap-2 font-body text-sm text-kelly-text">
            <input type="checkbox" {...form.register("pressInvited")} className="mt-1" />
            <span>Local press or a reporter may be there.</span>
          </label>
          <FormField>
            <FormLabel htmlFor="ik-notes">Notes (optional)</FormLabel>
            <Textarea id="ik-notes" rows={3} {...form.register("notes")} placeholder="Parking, accessibility, other candidates, or anything we should know." />
          </FormField>
          <FormField>
            <label className="flex items-start gap-2 font-body text-sm text-kelly-text">
              <input type="checkbox" {...form.register("permissionToContact")} className="mt-1" />
              <span>You may contact me about this invitation.</span>
            </label>
            {form.formState.errors.permissionToContact ? (
              <p className="text-sm text-kelly-navy">{form.formState.errors.permissionToContact.message}</p>
            ) : null}
          </FormField>
        </section>

        <Button type="submit" variant="primary" className="min-h-[52px] w-full sm:w-auto" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Sending…" : "Send invitation"}
        </Button>
      </form>
    </div>
  );
}

export { InviteKellyRequestForm as ScheduleCampaignEventForm };
