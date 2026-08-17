"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  volunteerSchema,
  type VolunteerInput,
  volunteerPreferredRoleValues,
  volunteerPreferredLanguageValues,
} from "@/lib/forms/schemas";
import { getToolkitTitleForResourceSlug } from "@/content/resources/toolkit";
import type { OutreachResourceSlug } from "@/content/resources/toolkit";
import { powerOf5OnboardingHref } from "@/config/navigation";
import { FormField } from "@/components/forms/FormField";
import { FormLabel } from "@/components/forms/FormLabel";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { Button } from "@/components/ui/Button";
import { FormErrorSummary, FormSuccessPanel } from "@/components/forms/FormMessages";
import { trackFormComplete, trackFormStart } from "@/lib/analytics/track";
import { DISCORD_VOLUNTEER_BLURB } from "@/lib/volunteer-ops/discord-volunteer-copy";

const OUTREACH_OPTION_COPY: {
  slug: OutreachResourceSlug;
  label: string;
  hint: string;
}[] = [
  {
    slug: "postcard-outreach",
    label: "Handwritten postcards",
    hint: "We supply cards and a targeted list; you write, pay postage, and mail.",
  },
  {
    slug: "phone-banking",
    label: "Phone banking",
    hint: "Full dialer system in development—sign up now so we can place you when shifts open.",
  },
  {
    slug: "text-banking",
    label: "Peer-to-peer text banking",
    hint: "We provide numbers and scripts; you text from a Google Voice or similar line to protect your personal number.",
  },
];

const PREFERRED_ROLE_LABELS: Record<(typeof volunteerPreferredRoleValues)[number], string> = {
  events: "Events",
  social_media: "Social media",
  power_of_five: "Power of 5 / voter registration",
  youth_outreach: "Youth outreach",
  womens_outreach: "Women’s outreach",
  fundraising: "Fundraising",
  not_sure: "Not sure yet",
};

const PREFERRED_LANGUAGE_LABELS: Record<(typeof volunteerPreferredLanguageValues)[number], string> = {
  english: "English",
  spanish: "Spanish",
  marshallese: "Marshallese",
};

function resourceToken(slug: OutreachResourceSlug) {
  return `resource:${slug}` as const;
}

export type VolunteerPrefillLane = "event_representation";

const defaultVolunteerValues: VolunteerInput = {
  formType: "volunteer",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  zip: "",
  county: "",
  city: undefined,
  preferredRole: "not_sure",
  preferredLanguage: "english",
  student: false,
  schoolCampus: undefined,
  discordInterest: false,
  hostingInterest: false,
  fundraisingInterest: false,
  leadershipInterest: false,
  interests: [],
  notes: undefined,
  availability: undefined,
  skills: undefined,
  website: "",
};

export function VolunteerForm({
  id,
  prefillResource,
  prefillLane,
  presetPreferredRole,
}: {
  id?: string;
  prefillResource?: string;
  prefillLane?: VolunteerPrefillLane;
  /** When user picks a lane on /volunteer, align the role select */
  presetPreferredRole?: VolunteerInput["preferredRole"] | null;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successTeamSlug, setSuccessTeamSlug] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const form = useForm<VolunteerInput>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: { ...defaultVolunteerValues },
  });

  useEffect(() => {
    if (!prefillResource) return;
    const token = `resource:${prefillResource}`;
    const current = form.getValues("interests");
    if (!current.includes(token)) {
      form.setValue("interests", [...current, token], { shouldDirty: true });
    }
  }, [prefillResource, form]);

  useEffect(() => {
    if (prefillLane !== "event_representation") return;
    const token = "lane:event_representation";
    const current = form.getValues("interests");
    if (!current.includes(token)) {
      form.setValue("interests", [...current, token], { shouldDirty: true });
    }
  }, [prefillLane, form]);

  useEffect(() => {
    if (!presetPreferredRole) return;
    form.setValue("preferredRole", presetPreferredRole);
  }, [presetPreferredRole, form]);

  const submit = form.handleSubmit(async (data) => {
    setServerError(null);
    const res = await fetch("/api/forms", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      error?: string;
      fields?: Record<string, string>;
      submissionId?: string;
      volunteerTeamSlug?: string | null;
    };
    if (!res.ok) {
      if (json.fields) {
        Object.entries(json.fields).forEach(([k, v]) => {
          form.setError(k as keyof VolunteerInput, { message: v });
        });
      }
      setServerError(json.error ?? "Something went wrong.");
      return;
    }
    trackFormComplete("volunteer", json.submissionId);
    setSuccessTeamSlug(json.volunteerTeamSlug && json.volunteerTeamSlug.length > 0 ? json.volunteerTeamSlug : null);
    setShowSuccess(true);
    form.reset({ ...defaultVolunteerValues });
  });

  if (showSuccess) {
    return (
      <FormSuccessPanel title="Thank you — you’re in the system." showResponseExpectation={false}>
        <p>
          A coordinator can follow up using what you submitted. Until automated email is fully live, the campaign still
          sees your signup immediately in our operations queue.
        </p>
        <p className="mt-3 font-body text-sm leading-relaxed text-kelly-text/85">
          <strong>Teams vs. Power of 5:</strong> every volunteer belongs to a small 3-person operating team for weekly
          rhythm. Separately, you can build a Power of 5 network of people you personally know — those contacts only join
          the volunteer system if they choose to sign up themselves.
        </p>
        <p className="mt-3 rounded-lg border border-kelly-gold/30 bg-kelly-gold/[0.08] p-3 font-body text-sm leading-relaxed text-kelly-deep/95">
          {DISCORD_VOLUNTEER_BLURB}
        </p>
        {successTeamSlug ? (
          <p className="mt-3">
            Your team workspace is live — open your{" "}
            <Link className="font-semibold text-kelly-navy underline" href={`/dashboard/team/${successTeamSlug}`}>
              team dashboard
            </Link>{" "}
            to start organizing (you&apos;re the founding lead until you invite coordinators).
          </p>
        ) : (
          <p className="mt-3">
            Next: explore the{" "}
            <Link className="font-semibold text-kelly-navy underline" href="/volunteer/resources">
              volunteer resource library
            </Link>{" "}
            or start the{" "}
            <Link className="font-semibold text-kelly-navy underline" href={powerOf5OnboardingHref}>
              Power of 5 onboarding
            </Link>{" "}
            path when you are ready to map your first five relationships.
          </p>
        )}
        <p className="mt-3">
          Want to go deeper now? Browse{" "}
          <Link className="font-semibold text-kelly-navy underline" href="/local-organizing">
            local organizing
          </Link>{" "}
          or learn about{" "}
          <Link className="font-semibold text-kelly-navy underline" href="/direct-democracy/ballot-initiative-process">
            how initiatives reach the ballot
          </Link>
          .
        </p>
        <Button type="button" variant="outline" onClick={() => { setShowSuccess(false); setSuccessTeamSlug(null); }}>
          Submit another volunteer form
        </Button>
      </FormSuccessPanel>
    );
  }

  return (
    <form
      id={id}
      className="space-y-6"
      onSubmit={submit}
      onFocus={() => {
        if (!started) {
          setStarted(true);
          trackFormStart("volunteer");
        }
      }}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...form.register("website")} />
      {prefillLane === "event_representation" ? (
        <div className="rounded-md border border-kelly-success/30 bg-kelly-success/10 p-4 font-body text-sm text-kelly-text/90">
          <p>
            You are signing up to <span className="font-semibold">represent the campaign</span> at local fairs,
            festivals, party or civic meetings, or other public gatherings. Add anything you already know—dates, venues,
            organizations—in availability or notes. Coordinators will follow up with tabling basics and approved
            materials.
          </p>
        </div>
      ) : null}
      {prefillResource ? (
        <div className="rounded-md border border-kelly-success/30 bg-kelly-success/10 p-4 font-body text-sm text-kelly-text/90">
          <p>
            You opened this form from:{" "}
            <span className="font-semibold">
              {getToolkitTitleForResourceSlug(prefillResource) ?? "a toolkit guide"}
            </span>
            . We will tag your signup so a coordinator can follow up in this lane.
          </p>
        </div>
      ) : null}

      <div className="rounded-xl border border-kelly-navy/15 bg-kelly-navy/[0.04] p-4 font-body text-sm leading-relaxed text-kelly-text/85">
        <p>
          <strong>3-person team + Power of 5:</strong> you can help as a volunteer on a small operating team{" "}
          <em>and</em> build a Power of 5 network of people you personally know. People in your P5 circle only enter the
          volunteer system if they choose to sign up — there is no automatic enrollment from your contact list.
        </p>
      </div>

      {serverError ? <FormErrorSummary errors={{ server: serverError }} /> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField>
          <FormLabel htmlFor="vf-first">First name</FormLabel>
          <Input id="vf-first" {...form.register("firstName")} autoComplete="given-name" />
          {form.formState.errors.firstName ? (
            <p className="text-sm text-kelly-navy">{form.formState.errors.firstName.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="vf-last">Last name</FormLabel>
          <Input id="vf-last" {...form.register("lastName")} autoComplete="family-name" />
          {form.formState.errors.lastName ? (
            <p className="text-sm text-kelly-navy">{form.formState.errors.lastName.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="vf-email">Email</FormLabel>
          <Input id="vf-email" type="email" {...form.register("email")} autoComplete="email" />
          {form.formState.errors.email ? (
            <p className="text-sm text-kelly-navy">{form.formState.errors.email.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="vf-phone">Phone</FormLabel>
          <Input id="vf-phone" type="tel" {...form.register("phone")} autoComplete="tel" />
          {form.formState.errors.phone ? (
            <p className="text-sm text-kelly-navy">{form.formState.errors.phone.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="vf-zip">ZIP code</FormLabel>
          <Input id="vf-zip" {...form.register("zip")} autoComplete="postal-code" />
          {form.formState.errors.zip ? (
            <p className="text-sm text-kelly-navy">{form.formState.errors.zip.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="vf-county">County</FormLabel>
          <Input id="vf-county" {...form.register("county")} autoComplete="address-level1" />
        </FormField>
      </div>
      <FormField>
        <FormLabel htmlFor="vf-city">City</FormLabel>
        <Input id="vf-city" {...form.register("city")} autoComplete="address-level2" />
      </FormField>

      <FormField>
        <FormLabel htmlFor="vf-role">Preferred role</FormLabel>
        <select
          id="vf-role"
          className="w-full rounded-md border border-kelly-text/20 bg-white px-3 py-2 font-body text-kelly-text"
          {...form.register("preferredRole")}
        >
          {volunteerPreferredRoleValues.map((v) => (
            <option key={v} value={v}>
              {PREFERRED_ROLE_LABELS[v]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField>
        <FormLabel htmlFor="vf-lang">Preferred language</FormLabel>
        <select
          id="vf-lang"
          className="w-full rounded-md border border-kelly-text/20 bg-white px-3 py-2 font-body text-kelly-text"
          {...form.register("preferredLanguage")}
        >
          {volunteerPreferredLanguageValues.map((v) => (
            <option key={v} value={v}>
              {PREFERRED_LANGUAGE_LABELS[v]}
            </option>
          ))}
        </select>
      </FormField>

      <FormField className="flex flex-row items-start gap-3">
        <input
          id="vf-student"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-kelly-text/30 text-kelly-navy"
          checked={form.watch("student")}
          onChange={(e) => form.setValue("student", e.target.checked)}
        />
        <FormLabel htmlFor="vf-student" className="font-normal text-kelly-text/80">
          I am a student
        </FormLabel>
      </FormField>
      {form.watch("student") ? (
        <FormField>
          <FormLabel htmlFor="vf-campus">School / campus (if student)</FormLabel>
          <Input id="vf-campus" {...form.register("schoolCampus")} />
        </FormField>
      ) : null}

      <FormField className="flex flex-row items-start gap-3">
        <input
          id="vf-discord"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-kelly-text/30 text-kelly-navy"
          checked={form.watch("discordInterest")}
          onChange={(e) => form.setValue("discordInterest", e.target.checked)}
        />
        <FormLabel htmlFor="vf-discord" className="font-normal text-kelly-text/80">
          Would you like a Discord invite for day-to-day team communication? (No bot or auto-join yet — we will follow
          up manually.)
        </FormLabel>
      </FormField>

      <FormField className="flex flex-row items-start gap-3">
        <input
          id="vf-host"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-kelly-text/30 text-kelly-navy"
          checked={form.watch("hostingInterest")}
          onChange={(e) => form.setValue("hostingInterest", e.target.checked)}
        />
        <FormLabel htmlFor="vf-host" className="font-normal text-kelly-text/80">
          I am interested in hosting a gathering (house party, meet-and-greet, etc.)
        </FormLabel>
      </FormField>

      <FormField className="flex flex-row items-start gap-3">
        <input
          id="vf-fundraise"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-kelly-text/30 text-kelly-navy"
          checked={form.watch("fundraisingInterest")}
          onChange={(e) => form.setValue("fundraisingInterest", e.target.checked)}
        />
        <FormLabel htmlFor="vf-fundraise" className="font-normal text-kelly-text/80">
          I am interested in fundraising (events, small-dollar circles, etc.)
        </FormLabel>
      </FormField>

      <FormField className="flex flex-row items-start gap-3">
        <input
          id="vf-lead"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-kelly-text/30 text-kelly-navy"
          checked={form.watch("leadershipInterest")}
          onChange={(e) => form.setValue("leadershipInterest", e.target.checked)}
        />
        <FormLabel htmlFor="vf-lead" className="font-normal text-kelly-text/80">
          I’m open to leadership training (hosting, captaining, or mentoring others).
        </FormLabel>
      </FormField>

      <FormField>
        <FormLabel htmlFor="vf-notes">Notes (optional)</FormLabel>
        <Textarea id="vf-notes" rows={4} {...form.register("notes")} />
      </FormField>

      <FormField>
        <FormLabel htmlFor="vf-availability">Availability (optional)</FormLabel>
        <Textarea id="vf-availability" rows={3} {...form.register("availability")} />
      </FormField>
      <FormField>
        <FormLabel htmlFor="vf-skills">Skills / experience (optional)</FormLabel>
        <Textarea id="vf-skills" rows={4} {...form.register("skills")} />
      </FormField>
      <div className="rounded-md border border-kelly-text/10 bg-kelly-page/30 p-4">
        <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-text/55">Ways to help (optional)</p>
        <p className="mt-1 font-body text-sm text-kelly-text/70">
          Check any lane that fits—coordinators use this to match you faster.{" "}
          <Link className="font-semibold text-kelly-navy underline" href="/resources#toolkit">
            Full how-to guides
          </Link>{" "}
          live in resources.
        </p>
        <ul className="mt-3 space-y-2">
          {OUTREACH_OPTION_COPY.map(({ slug, label, hint }) => {
            const fid = `vf-outreach-${slug}`;
            const token = resourceToken(slug);
            const checked = form.watch("interests").includes(token);
            return (
              <li key={slug} className="flex flex-row items-start gap-3">
                <input
                  id={fid}
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-kelly-text/30 text-kelly-navy"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? Array.from(new Set([...form.getValues("interests"), token]))
                      : form.getValues("interests").filter((t) => t !== token);
                    form.setValue("interests", next, { shouldDirty: true });
                  }}
                />
                <div>
                  <FormLabel htmlFor={fid} className="font-normal text-kelly-text/90">
                    {label}
                  </FormLabel>
                  <p className="mt-0.5 font-body text-xs text-kelly-text/60">{hint}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <Button type="submit" variant="primary" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : "Volunteer"}
      </Button>
    </form>
  );
}
