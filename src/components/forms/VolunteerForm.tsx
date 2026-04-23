"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { volunteerSchema, type VolunteerInput } from "@/lib/forms/schemas";
import { getToolkitTitleForResourceSlug } from "@/content/resources/toolkit";
import type { OutreachResourceSlug } from "@/content/resources/toolkit";
import { FormField } from "@/components/forms/FormField";
import { FormLabel } from "@/components/forms/FormLabel";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { Button } from "@/components/ui/Button";
import { FormErrorSummary, FormSuccessPanel } from "@/components/forms/FormMessages";
import { trackFormComplete, trackFormStart } from "@/lib/analytics/track";

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

function resourceToken(slug: OutreachResourceSlug) {
  return `resource:${slug}` as const;
}

export type VolunteerPrefillLane = "event_representation";

export function VolunteerForm({
  id,
  prefillResource,
  prefillLane,
}: {
  id?: string;
  prefillResource?: string;
  prefillLane?: VolunteerPrefillLane;
}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [started, setStarted] = useState(false);

  const form = useForm<VolunteerInput>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      formType: "volunteer",
      name: "",
      email: "",
      phone: "",
      zip: "",
      county: "",
      availability: "",
      skills: "",
      leadershipInterest: false,
      interests: [],
      website: "",
    },
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

  const submit = form.handleSubmit(async (data) => {
    setServerError(null);
    const res = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = (await res.json()) as {
      ok?: boolean;
      error?: string;
      fields?: Record<string, string>;
      submissionId?: string;
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
    setShowSuccess(true);
    form.reset({
      formType: "volunteer",
      name: "",
      email: "",
      phone: "",
      zip: "",
      county: "",
      availability: "",
      skills: "",
      leadershipInterest: false,
      interests: [],
      website: "",
    });
  });

  if (showSuccess) {
    return (
      <FormSuccessPanel title="Thank you—this is how campaigns actually run.">
        <p>
          A coordinator will follow up with shifts that match what you shared. If you flagged leadership
          interest, we may invite you to a short training call—no pressure, no jargon.
        </p>
        <p>
          Want to go deeper now? Browse{" "}
          <Link className="font-semibold text-red-dirt underline" href="/local-organizing">
            local organizing
          </Link>{" "}
          or learn about{" "}
          <Link className="font-semibold text-red-dirt underline" href="/direct-democracy">
            direct democracy tools
          </Link>
          .
        </p>
        <Button type="button" variant="outline" onClick={() => setShowSuccess(false)}>
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
        <div className="rounded-md border border-field-green/30 bg-field-green/10 p-4 font-body text-sm text-deep-soil/90">
          <p>
            You are signing up to <span className="font-semibold">represent the campaign</span> at local fairs,
            festivals, party or civic meetings, or other public gatherings. Add anything you already know—dates, venues,
            organizations—in availability or skills. Coordinators will follow up with tabling basics and approved
            materials.
          </p>
        </div>
      ) : null}
      {prefillResource ? (
        <div className="rounded-md border border-field-green/30 bg-field-green/10 p-4 font-body text-sm text-deep-soil/90">
          <p>
            You opened this form from:{" "}
            <span className="font-semibold">
              {getToolkitTitleForResourceSlug(prefillResource) ?? "a toolkit guide"}
            </span>
            . We will tag your signup so a coordinator can follow up in this lane.
          </p>
        </div>
      ) : null}
      {serverError ? <FormErrorSummary errors={{ server: serverError }} /> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField>
          <FormLabel htmlFor="vf-name">Full name</FormLabel>
          <Input id="vf-name" {...form.register("name")} autoComplete="name" />
          {form.formState.errors.name ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.name.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="vf-email">Email</FormLabel>
          <Input id="vf-email" type="email" {...form.register("email")} autoComplete="email" />
          {form.formState.errors.email ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.email.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="vf-phone">Phone (optional)</FormLabel>
          <Input id="vf-phone" type="tel" {...form.register("phone")} autoComplete="tel" />
        </FormField>
        <FormField>
          <FormLabel htmlFor="vf-zip">ZIP</FormLabel>
          <Input id="vf-zip" {...form.register("zip")} autoComplete="postal-code" />
          {form.formState.errors.zip ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.zip.message}</p>
          ) : null}
        </FormField>
      </div>
      <FormField>
        <FormLabel htmlFor="vf-county">County (optional)</FormLabel>
        <Input id="vf-county" {...form.register("county")} />
      </FormField>
      <FormField>
        <FormLabel htmlFor="vf-availability">Availability (optional)</FormLabel>
        <Textarea id="vf-availability" rows={3} {...form.register("availability")} />
      </FormField>
      <FormField>
        <FormLabel htmlFor="vf-skills">Skills / experience (optional)</FormLabel>
        <Textarea id="vf-skills" rows={4} {...form.register("skills")} />
      </FormField>
      <FormField className="flex flex-row items-start gap-3">
        <input
          id="vf-lead"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-deep-soil/30 text-red-dirt"
          checked={form.watch("leadershipInterest")}
          onChange={(e) => form.setValue("leadershipInterest", e.target.checked)}
        />
        <FormLabel htmlFor="vf-lead" className="font-normal text-deep-soil/80">
          I’m open to leadership training (hosting, captaining, or mentoring others).
        </FormLabel>
      </FormField>
      <div className="rounded-md border border-deep-soil/10 bg-cream-canvas/30 p-4">
        <p className="font-body text-xs font-bold uppercase tracking-wide text-deep-soil/55">Ways to help (optional)</p>
        <p className="mt-1 font-body text-sm text-deep-soil/70">
          Check any lane that fits—coordinators use this to match you faster.{" "}
          <Link className="font-semibold text-red-dirt underline" href="/resources#toolkit">
            Full how-to guides
          </Link>{" "}
          live in resources.
        </p>
        <ul className="mt-3 space-y-2">
          {OUTREACH_OPTION_COPY.map(({ slug, label, hint }) => {
            const id = `vf-outreach-${slug}`;
            const token = resourceToken(slug);
            const checked = form.watch("interests").includes(token);
            return (
              <li key={slug} className="flex flex-row items-start gap-3">
                <input
                  id={id}
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-deep-soil/30 text-red-dirt"
                  checked={checked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? Array.from(new Set([...form.getValues("interests"), token]))
                      : form.getValues("interests").filter((t) => t !== token);
                    form.setValue("interests", next, { shouldDirty: true });
                  }}
                />
                <div>
                  <FormLabel htmlFor={id} className="font-normal text-deep-soil/90">
                    {label}
                  </FormLabel>
                  <p className="mt-0.5 font-body text-xs text-deep-soil/60">{hint}</p>
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
