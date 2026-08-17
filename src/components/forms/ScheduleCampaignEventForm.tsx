"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { FormField } from "@/components/forms/FormField";
import { FormLabel } from "@/components/forms/FormLabel";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { Button } from "@/components/ui/Button";
import { FormErrorSummary, FormSuccessPanel } from "@/components/forms/FormMessages";
import {
  PUBLIC_SCHEDULE_EVENT_TYPE_LABELS,
  scheduleCampaignEventBodySchema,
  type ScheduleCampaignEventBody,
} from "@/lib/forms/public-schedule-schema";
import { useLocale } from "@/i18n/client";
import { scheduleFormText } from "@/i18n/forms/public-forms";
import { withLocaleHref } from "@/i18n/path";
import { chromeText } from "@/i18n/chrome";

type ApiOk = {
  ok: true;
  mode: "database" | "staged";
  workflowIntakeId: string | null;
  stagedId?: string;
  publicAssistant: {
    intakeStatus: string;
    publicMessage: string;
    missingFields: string[];
    suggestedWindows: { label: string; startAt: string; endAt: string; reasonPublic: string }[];
    recommendedTentativeEvent: { title: string; startAt?: string; endAt?: string; calendarLane: string };
  };
};

export function ScheduleCampaignEventForm({ id }: { id?: string }) {
  const locale = useLocale();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [assistant, setAssistant] = useState<ApiOk["publicAssistant"] | null>(null);

  const form = useForm<ScheduleCampaignEventBody>({
    resolver: zodResolver(scheduleCampaignEventBodySchema),
    defaultValues: {
      requesterName: "",
      organization: "",
      email: "",
      phone: "",
      eventTitle: "",
      eventType: "other",
      county: "",
      city: "",
      address: "",
      preferredDate: "",
      alternateDates: [],
      alternateDatesText: "",
      preferredStartTime: "",
      preferredEndTime: "",
      flexibility: "same_week",
      audienceSize: undefined,
      eventPurpose: "",
      eventVisibility: "public",
      pressInvited: false,
      pressReleaseInterest: "staff_decide",
      localIssueAngle: "",
      speakingRequested: false,
      localHostAvailable: false,
      notes: "",
      permissionToContact: false,
      website: "",
    },
  });

  const submit = form.handleSubmit(async (data) => {
    setServerError(null);
    setAssistant(null);
    const res = await fetch("/api/forms/schedule-campaign-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as ApiOk & { ok?: boolean; error?: string; fields?: Record<string, string> };
    if (!res.ok) {
      if (json.fields) {
        Object.entries(json.fields).forEach(([k, v]) => {
          form.setError(k as keyof ScheduleCampaignEventBody, { message: v });
        });
      }
      setServerError(json.error ?? scheduleFormText("serverError", locale));
      return;
    }
    if (json.ok) {
      setAssistant(json.publicAssistant);
      setShowSuccess(true);
      form.reset({ ...form.getValues(), website: "" });
    }
  });

  if (showSuccess && assistant) {
    return (
      <div id={id} className="space-y-6">
        <FormSuccessPanel title={scheduleFormText("successTitle", locale)}>
          <p className="font-semibold text-kelly-text">{assistant.publicMessage}</p>
          {assistant.suggestedWindows.length ? (
            <ul className="mt-3 list-inside list-disc text-sm text-kelly-text/85">
              {assistant.suggestedWindows.map((w) => (
                <li key={w.startAt + w.label}>
                  <span className="font-semibold">{w.label}</span> — {w.reasonPublic}
                </li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 text-xs text-kelly-text/65">Status: {assistant.intakeStatus.replace(/_/g, " ")}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => setShowSuccess(false)}>
            {scheduleFormText("submitAnother", locale)}
          </Button>
        </FormSuccessPanel>
      </div>
    );
  }

  return (
    <div id={id} className="space-y-8">
      <div className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-8">
        <p className="font-body text-sm leading-relaxed text-kelly-text/80">
          {scheduleFormText("introLead", locale)}
        </p>
        <p className="mt-2 font-body text-xs text-kelly-text/65">
          {locale === "es" ? "¿Preguntas?" : "Questions?"}{" "}
          <Link href={withLocaleHref("/contact", locale)}>{chromeText("contactCampaign", locale)}</Link>
          {locale === "es" ? " o vea " : " or see "}
          <Link href={withLocaleHref("/host-a-gathering", locale)}>
            {locale === "es" ? "organizar una reunión" : "host a gathering"}
          </Link>
          {locale === "es" ? " para formatos vecinales." : " for neighbor-led formats."}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-8">
        <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...form.register("website")} />

        {serverError ? <FormErrorSummary errors={{ server: serverError }} /> : null}

        <section className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-kelly-text">{scheduleFormText("contactHeading", locale)}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField>
              <FormLabel htmlFor="ps-name">{scheduleFormText("name", locale)}</FormLabel>
              <Input id="ps-name" {...form.register("requesterName")} autoComplete="name" />
              {form.formState.errors.requesterName ? (
                <p className="text-sm text-kelly-navy">{form.formState.errors.requesterName.message}</p>
              ) : null}
            </FormField>
            <FormField>
              <FormLabel htmlFor="ps-org">{scheduleFormText("organization", locale)}</FormLabel>
              <Input id="ps-org" {...form.register("organization")} />
            </FormField>
            <FormField>
              <FormLabel htmlFor="ps-email">{scheduleFormText("email", locale)}</FormLabel>
              <Input id="ps-email" type="email" {...form.register("email")} autoComplete="email" />
              {form.formState.errors.email ? (
                <p className="text-sm text-kelly-navy">{form.formState.errors.email.message}</p>
              ) : null}
            </FormField>
            <FormField>
              <FormLabel htmlFor="ps-phone">{scheduleFormText("phone", locale)}</FormLabel>
              <Input id="ps-phone" type="tel" {...form.register("phone")} autoComplete="tel" />
              {form.formState.errors.phone ? (
                <p className="text-sm text-kelly-navy">{form.formState.errors.phone.message}</p>
              ) : null}
            </FormField>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-kelly-text">{scheduleFormText("eventHeading", locale)}</h2>
          <FormField>
            <FormLabel htmlFor="ps-title">{scheduleFormText("eventTitle", locale)}</FormLabel>
            <Input id="ps-title" {...form.register("eventTitle")} />
            {form.formState.errors.eventTitle ? (
              <p className="text-sm text-kelly-navy">{form.formState.errors.eventTitle.message}</p>
            ) : null}
          </FormField>
          <FormField>
            <FormLabel htmlFor="ps-type">{scheduleFormText("eventType", locale)}</FormLabel>
            <select
              id="ps-type"
              className="w-full rounded-md border border-kelly-text/20 bg-white px-3 py-2 font-body text-sm text-kelly-text"
              {...form.register("eventType")}
            >
              {(Object.keys(PUBLIC_SCHEDULE_EVENT_TYPE_LABELS) as (keyof typeof PUBLIC_SCHEDULE_EVENT_TYPE_LABELS)[]).map(
                (k) => (
                  <option key={k} value={k}>
                    {PUBLIC_SCHEDULE_EVENT_TYPE_LABELS[k]}
                  </option>
                ),
              )}
            </select>
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField>
              <FormLabel htmlFor="ps-county">{scheduleFormText("county", locale)}</FormLabel>
              <Input id="ps-county" {...form.register("county")} placeholder="Arkansas county" />
              {form.formState.errors.county ? (
                <p className="text-sm text-kelly-navy">{form.formState.errors.county.message}</p>
              ) : null}
            </FormField>
            <FormField>
              <FormLabel htmlFor="ps-city">{scheduleFormText("city", locale)}</FormLabel>
              <Input id="ps-city" {...form.register("city")} />
            </FormField>
          </div>
          <FormField>
            <FormLabel htmlFor="ps-address">{scheduleFormText("address", locale)}</FormLabel>
            <Textarea id="ps-address" rows={2} {...form.register("address")} placeholder="Street address or well-known venue" />
          </FormField>
          <FormField>
            <FormLabel htmlFor="ps-pref">{scheduleFormText("preferredDate", locale)}</FormLabel>
            <Input id="ps-pref" {...form.register("preferredDate")} placeholder="2026-06-15" />
            {form.formState.errors.preferredDate ? (
              <p className="text-sm text-kelly-navy">{form.formState.errors.preferredDate.message}</p>
            ) : null}
          </FormField>
          <FormField>
            <FormLabel htmlFor="ps-alt">{scheduleFormText("alternateDates", locale)}</FormLabel>
            <p className="text-xs text-kelly-text/60">One per line or comma-separated, each as YYYY-MM-DD.</p>
            <Textarea id="ps-alt" rows={2} {...form.register("alternateDatesText")} />
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField>
              <FormLabel htmlFor="ps-st">{scheduleFormText("startTime", locale)}</FormLabel>
              <Input id="ps-st" {...form.register("preferredStartTime")} placeholder="17:30" />
            </FormField>
            <FormField>
              <FormLabel htmlFor="ps-en">{scheduleFormText("endTime", locale)}</FormLabel>
              <Input id="ps-en" {...form.register("preferredEndTime")} />
            </FormField>
          </div>
          <FormField>
            <FormLabel htmlFor="ps-flex">{scheduleFormText("flexibility", locale)}</FormLabel>
            <select
              id="ps-flex"
              className="w-full rounded-md border border-kelly-text/20 bg-white px-3 py-2 font-body text-sm text-kelly-text"
              {...form.register("flexibility")}
            >
              <option value="exact_date_only">Exact date only</option>
              <option value="same_week">Flexible within the same week</option>
              <option value="same_month">Flexible within the same month</option>
              <option value="campaign_suggests">Any date the campaign suggests</option>
            </select>
          </FormField>
          <FormField>
            <FormLabel htmlFor="ps-aud">{scheduleFormText("audienceSize", locale)}</FormLabel>
            <Input
              id="ps-aud"
              type="number"
              min={1}
              {...form.register("audienceSize", {
                setValueAs: (v) => (v === "" || v === null || v === undefined ? undefined : Number(v)),
              })}
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="ps-purpose">{scheduleFormText("purpose", locale)}</FormLabel>
            <Textarea id="ps-purpose" rows={3} {...form.register("eventPurpose")} />
          </FormField>
          <FormField>
            <FormLabel htmlFor="ps-vis">Public or private</FormLabel>
            <select
              id="ps-vis"
              className="w-full rounded-md border border-kelly-text/20 bg-white px-3 py-2 font-body text-sm text-kelly-text"
              {...form.register("eventVisibility")}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </FormField>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-kelly-text">{scheduleFormText("pressHeading", locale)}</h2>
          <div className="flex flex-wrap gap-6 font-body text-sm text-kelly-text">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register("pressInvited")} />
              {scheduleFormText("pressInvited", locale)}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register("speakingRequested")} />
              {scheduleFormText("speakingRequested", locale)}
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register("localHostAvailable")} />
              {scheduleFormText("localHost", locale)}
            </label>
          </div>
          <FormField>
            <FormLabel htmlFor="ps-press">Press release consideration</FormLabel>
            <select
              id="ps-press"
              className="w-full rounded-md border border-kelly-text/20 bg-white px-3 py-2 font-body text-sm text-kelly-text"
              {...form.register("pressReleaseInterest")}
            >
              <option value="no">No</option>
              <option value="maybe">Maybe</option>
              <option value="yes">Yes</option>
              <option value="staff_decide">Staff decide</option>
            </select>
          </FormField>
          <FormField>
            <FormLabel htmlFor="ps-angle">Local issue / story angle (optional)</FormLabel>
            <Textarea id="ps-angle" rows={2} {...form.register("localIssueAngle")} />
          </FormField>
        </section>

        <section className="space-y-4">
          <h2 className="font-heading text-lg font-bold text-kelly-text">{scheduleFormText("notesHeading", locale)}</h2>
          <FormField>
            <FormLabel htmlFor="ps-notes">{scheduleFormText("notesLabel", locale)}</FormLabel>
            <Textarea id="ps-notes" rows={3} {...form.register("notes")} />
          </FormField>
          <FormField>
            <label className="flex items-start gap-2 font-body text-sm text-kelly-text">
              <input type="checkbox" {...form.register("permissionToContact")} className="mt-1" />
              <span>{scheduleFormText("permissionLabel", locale)}</span>
            </label>
            {form.formState.errors.permissionToContact ? (
              <p className="text-sm text-kelly-navy">{form.formState.errors.permissionToContact.message}</p>
            ) : null}
          </FormField>
        </section>

        <Button type="submit" variant="primary" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? scheduleFormText("submitting", locale) : scheduleFormText("submit", locale)}
        </Button>
      </form>
    </div>
  );
}
