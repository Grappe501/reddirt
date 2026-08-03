"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  volunteerKickoffSchema,
  type VolunteerKickoffInput,
} from "@/lib/forms/schemas";
import { FormField } from "@/components/forms/FormField";
import { FormLabel } from "@/components/forms/FormLabel";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { Button } from "@/components/ui/Button";
import { FormErrorSummary } from "@/components/forms/FormMessages";
import { ARKANSAS_COUNTY_REGISTRY } from "@/lib/county/arkansas-county-registry";
import {
  CAMPAIGN_TEAMS,
  LOCAL_ROLES,
  STRIKE_REGIONS,
} from "@/content/volunteer-kickoff/roles";
import { KICKOFF_BASE } from "@/content/volunteer-kickoff/slides";
import { trackFormComplete, trackFormStart } from "@/lib/analytics/track";

type Pathway = VolunteerKickoffInput["pathway"];

const countyNames = ARKANSAS_COUNTY_REGISTRY.map((c) => c.displayName).sort((a, b) =>
  a.localeCompare(b),
);

export function KickoffSignupForm({
  pathway,
  title,
  intro,
}: {
  pathway: Pathway;
  title: string;
  intro: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const prefillRole = searchParams.get("role") ?? undefined;
  const prefillTeam = searchParams.get("team") ?? undefined;
  const prefillEvent = searchParams.get("event") ?? undefined;
  const youthIntentRaw = searchParams.get("intent");
  const youthIntent =
    youthIntentRaw === "refer" || youthIntentRaw === "help" || youthIntentRaw === "join"
      ? youthIntentRaw
      : pathway === "youth"
        ? "join"
        : undefined;

  const defaults = useMemo<VolunteerKickoffInput>(() => {
    const roles =
      pathway === "local" && prefillRole
        ? [prefillRole]
        : pathway === "campaign" && prefillTeam
          ? [prefillTeam]
          : [];
    return {
      formType: "volunteer_kickoff",
      pathway,
      name: "",
      email: "",
      phone: "",
      county: "",
      city: undefined,
      preferredContact: "email",
      roles,
      primaryTeam: pathway === "campaign" ? prefillTeam : undefined,
      secondaryTeam: undefined,
      availability: undefined,
      skills: undefined,
      canHost: false,
      canRecruit: false,
      willingToTravel: false,
      leadershipInterest: false,
      organizationName: undefined,
      preferScope: pathway === "match" ? "either" : undefined,
      enjoyDoing: undefined,
      youthIntent,
      eventId: prefillEvent,
      regions: [],
      notes: undefined,
      website: "",
      sourcePage: typeof window === "undefined" ? `${KICKOFF_BASE}/join/${pathway}` : window.location.pathname,
      sourceComponent: "KickoffSignupForm",
      sourceCampaign: "volunteer-kickoff",
      consentEmail: true,
      consentSms: false,
      consentPhone: false,
    };
  }, [pathway, prefillEvent, prefillRole, prefillTeam, youthIntent]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VolunteerKickoffInput>({
    resolver: zodResolver(volunteerKickoffSchema),
    defaultValues: defaults,
  });

  const selectedRoles = watch("roles") ?? [];
  const selectedRegions = watch("regions") ?? [];

  function toggleRole(id: string) {
    const next = selectedRoles.includes(id)
      ? selectedRoles.filter((r) => r !== id)
      : [...selectedRoles, id].slice(0, 20);
    setValue("roles", next, { shouldValidate: true });
    if (pathway === "campaign" && !watch("primaryTeam")) {
      setValue("primaryTeam", id, { shouldValidate: true });
    }
  }

  function toggleRegion(id: string) {
    const next = selectedRegions.includes(id)
      ? selectedRegions.filter((r) => r !== id)
      : [...selectedRegions, id].slice(0, 8);
    setValue("regions", next, { shouldValidate: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setSubmitting(true);
    trackFormStart("volunteer_kickoff");
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          sourcePage: `${KICKOFF_BASE}/join/${pathway}`,
          sourceComponent: "KickoffSignupForm",
          sourceCampaign: "volunteer-kickoff",
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setServerError(
          json.error === "rate_limited"
            ? "Too many submissions — wait a moment and try again."
            : "We could not save your signup. Please try again.",
        );
        setSubmitting(false);
        return;
      }
      trackFormComplete("volunteer_kickoff");
      const q = new URLSearchParams({
        pathway,
        county: values.county,
        role: values.primaryTeam || values.roles[0] || pathway,
      });
      router.push(`${KICKOFF_BASE}/thank-you?${q.toString()}`);
    } catch {
      setServerError("Network error — check your connection and try again.");
      setSubmitting(false);
    }
  });

  const fieldErrors: Record<string, string> = {};
  for (const [k, v] of Object.entries(errors)) {
    if (v?.message) fieldErrors[k] = String(v.message);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-6" noValidate>
      <div>
        <h1 className="font-heading text-3xl font-bold text-[var(--kelly-official-navy)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 font-body text-[var(--color-secondary)]">{intro}</p>
      </div>

      <FormErrorSummary errors={fieldErrors} />
      {serverError ? (
        <p role="alert" className="rounded-card border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          {serverError}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField className="sm:col-span-2">
          <FormLabel htmlFor="kickoff-name">Full name</FormLabel>
          <Input id="kickoff-name" autoComplete="name" {...register("name")} />
        </FormField>
        <FormField>
          <FormLabel htmlFor="kickoff-email">Email</FormLabel>
          <Input id="kickoff-email" type="email" autoComplete="email" {...register("email")} />
        </FormField>
        <FormField>
          <FormLabel htmlFor="kickoff-phone">Mobile number</FormLabel>
          <Input id="kickoff-phone" type="tel" autoComplete="tel" {...register("phone")} />
        </FormField>
        <FormField>
          <FormLabel htmlFor="kickoff-county">County</FormLabel>
          <select
            id="kickoff-county"
            className="min-h-12 w-full rounded-btn border border-[var(--color-border-subtle)] bg-white px-3 font-body"
            {...register("county")}
          >
            <option value="">Select county</option>
            {countyNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField>
          <FormLabel htmlFor="kickoff-city">City (optional)</FormLabel>
          <Input id="kickoff-city" autoComplete="address-level2" {...register("city")} />
        </FormField>
      </div>

      <FormField>
        <FormLabel htmlFor="kickoff-contact">Preferred contact</FormLabel>
        <select
          id="kickoff-contact"
          className="min-h-12 w-full rounded-btn border border-[var(--color-border-subtle)] bg-white px-3 font-body"
          {...register("preferredContact")}
        >
          <option value="email">Email</option>
          <option value="phone">Phone call</option>
          <option value="text">Text</option>
        </select>
      </FormField>

      {pathway === "local" ? (
        <fieldset className="space-y-3">
          <legend className="font-heading text-sm font-bold uppercase tracking-wide text-[var(--kelly-official-navy)]">
            Local roles
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {LOCAL_ROLES.map((role) => (
              <label
                key={role.id}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--color-border-subtle)] bg-white p-3 text-sm"
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                />
                <span>
                  <span className="font-semibold text-[var(--kelly-official-navy)]">{role.title}</span>
                  <span className="block text-[var(--color-secondary)]">{role.blurb}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {pathway === "campaign" ? (
        <>
          <FormField>
            <FormLabel htmlFor="kickoff-primary">Primary campaign team</FormLabel>
            <select
              id="kickoff-primary"
              className="min-h-12 w-full rounded-btn border border-[var(--color-border-subtle)] bg-white px-3 font-body"
              {...register("primaryTeam")}
            >
              <option value="">Select a team</option>
              {CAMPAIGN_TEAMS.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.title}
                </option>
              ))}
            </select>
          </FormField>
          <FormField>
            <FormLabel htmlFor="kickoff-secondary">Secondary interest (optional)</FormLabel>
            <select
              id="kickoff-secondary"
              className="min-h-12 w-full rounded-btn border border-[var(--color-border-subtle)] bg-white px-3 font-body"
              {...register("secondaryTeam")}
            >
              <option value="">None</option>
              {CAMPAIGN_TEAMS.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.title}
                </option>
              ))}
            </select>
          </FormField>
          <fieldset className="space-y-3">
            <legend className="font-heading text-sm font-bold uppercase tracking-wide text-[var(--kelly-official-navy)]">
              Regions you can cover
            </legend>
            <div className="flex flex-wrap gap-2">
              {STRIKE_REGIONS.map((region) => (
                <label
                  key={region.id}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--color-border-subtle)] bg-white px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedRegions.includes(region.id)}
                    onChange={() => toggleRegion(region.id)}
                  />
                  {region.label}
                </label>
              ))}
            </div>
          </fieldset>
        </>
      ) : null}

      {pathway === "youth" ? (
        <FormField>
          <FormLabel htmlFor="kickoff-youth-intent">How do you want to help?</FormLabel>
          <select
            id="kickoff-youth-intent"
            className="min-h-12 w-full rounded-btn border border-[var(--color-border-subtle)] bg-white px-3 font-body"
            {...register("youthIntent")}
          >
            <option value="join">I am 16–24 and want to join</option>
            <option value="refer">I know a young person who should join</option>
            <option value="help">I want to help the Youth Coalition</option>
          </select>
        </FormField>
      ) : null}

      {pathway === "match" ? (
        <>
          <FormField>
            <FormLabel htmlFor="kickoff-enjoy">What do you enjoy doing?</FormLabel>
            <Textarea id="kickoff-enjoy" rows={3} {...register("enjoyDoing")} />
          </FormField>
          <FormField>
            <FormLabel htmlFor="kickoff-scope">Do you prefer local or statewide work?</FormLabel>
            <select
              id="kickoff-scope"
              className="min-h-12 w-full rounded-btn border border-[var(--color-border-subtle)] bg-white px-3 font-body"
              {...register("preferScope")}
            >
              <option value="local">Local</option>
              <option value="statewide">Statewide</option>
              <option value="either">Either / not sure</option>
            </select>
          </FormField>
        </>
      ) : null}

      <FormField>
        <FormLabel htmlFor="kickoff-availability">Availability</FormLabel>
        <Input
          id="kickoff-availability"
          placeholder="Evenings, Saturdays, a few hours a week…"
          {...register("availability")}
        />
      </FormField>

      {(pathway === "campaign" || pathway === "match") && (
        <FormField>
          <FormLabel htmlFor="kickoff-skills">Relevant skills</FormLabel>
          <Textarea id="kickoff-skills" rows={3} {...register("skills")} />
        </FormField>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {pathway === "local" || pathway === "match" ? (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("canHost")} />I can host an event
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("canRecruit")} />I can recruit others
            </label>
          </>
        ) : null}
        {pathway === "campaign" || pathway === "match" ? (
          <>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("willingToTravel")} />I am willing to travel
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register("leadershipInterest")} />I am interested in leadership
            </label>
          </>
        ) : null}
      </div>

      {(pathway === "local" || pathway === "youth") && (
        <FormField>
          <FormLabel htmlFor="kickoff-org">Organization (optional)</FormLabel>
          <Input id="kickoff-org" {...register("organizationName")} />
        </FormField>
      )}

      <FormField>
        <FormLabel htmlFor="kickoff-notes">Notes or local ideas</FormLabel>
        <Textarea id="kickoff-notes" rows={3} {...register("notes")} />
      </FormField>

      <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...register("website")} />
      <input type="hidden" {...register("formType")} />
      <input type="hidden" {...register("pathway")} />
      <input type="hidden" {...register("eventId")} />

      <label className="flex items-start gap-2 text-sm text-[var(--color-secondary)]">
        <input type="checkbox" className="mt-1" {...register("consentEmail")} />
        <span>Email me follow-up about my volunteer role and campaign updates.</span>
      </label>

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Saving…" : submitLabel(pathway)}
      </Button>
    </form>
  );
}

function submitLabel(pathway: Pathway): string {
  switch (pathway) {
    case "local":
      return "Join My Local Team";
    case "campaign":
      return "Join a Statewide Campaign Team";
    case "youth":
      return "Join the Youth Coalition Effort";
    case "match":
      return "Help Me Find My Place";
  }
}
