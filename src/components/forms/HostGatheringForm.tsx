"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gatheringTypeValues, hostGatheringSchema, type HostGatheringInput } from "@/lib/forms/schemas";
import { FormField } from "@/components/forms/FormField";
import { FormLabel } from "@/components/forms/FormLabel";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { Button } from "@/components/ui/Button";
import { FormErrorSummary, FormSuccessPanel } from "@/components/forms/FormMessages";
import { trackFormComplete, trackFormStart } from "@/lib/analytics/track";

const gatheringLabels: Record<(typeof gatheringTypeValues)[number], string> = {
  front_porch: "Front porch conversation",
  living_room: "Living room gathering",
  coffee_meetup: "Coffee meetup",
  listening_session: "Local listening session",
  issue_briefing: "Issue briefing",
  other: "Something else (tell us)",
};

type HostGatheringFormProps = {
  id?: string;
  /** When set (e.g. on `/listening-sessions`), the gather type defaults to this value. */
  initialGatheringType?: (typeof gatheringTypeValues)[number];
};

export function HostGatheringForm({ id, initialGatheringType = "living_room" }: HostGatheringFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [started, setStarted] = useState(false);

  const form = useForm<HostGatheringInput>({
    resolver: zodResolver(hostGatheringSchema),
    defaultValues: {
      formType: "host_gathering",
      name: "",
      email: "",
      phone: "",
      zip: "",
      county: "",
      community: "",
      gatheringType: initialGatheringType,
      gatheringTypeOther: "",
      preferredTiming: "",
      expectedGuests: "",
      needs: "",
      website: "",
    },
  });

  const gType = form.watch("gatheringType");

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
          form.setError(k as keyof HostGatheringInput, { message: v });
        });
      }
      setServerError(json.error ?? "Something went wrong.");
      return;
    }
    trackFormComplete("host_gathering", json.submissionId);
    setShowSuccess(true);
    form.reset({
      formType: "host_gathering",
      name: "",
      email: "",
      phone: "",
      zip: "",
      county: "",
      community: "",
      gatheringType: initialGatheringType,
      gatheringTypeOther: "",
      preferredTiming: "",
      expectedGuests: "",
      needs: "",
      website: "",
    });
  });

  if (showSuccess) {
    return (
      <FormSuccessPanel title="Thank you for opening your door.">
        <p>
          Hosting is leadership without the spotlight. Organizers will follow up with a short checklist—usually a
          15-minute call and a simple plan for invitations.
        </p>
        <p>
          Want backup while you wait? Skim{" "}
          <a className="font-semibold text-red-dirt underline" href="/resources#toolkit">
            the toolkit
          </a>{" "}
          for facilitation prompts you can reuse tonight.
        </p>
        <Button type="button" variant="outline" onClick={() => setShowSuccess(false)}>
          Submit another gathering
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
          trackFormStart("host_gathering");
        }
      }}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...form.register("website")} />
      {serverError ? <FormErrorSummary errors={{ server: serverError }} /> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField>
          <FormLabel htmlFor="hg-name">Full name</FormLabel>
          <Input id="hg-name" {...form.register("name")} autoComplete="name" />
          {form.formState.errors.name ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.name.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="hg-email">Email</FormLabel>
          <Input id="hg-email" type="email" {...form.register("email")} autoComplete="email" />
          {form.formState.errors.email ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.email.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="hg-phone">Phone (optional)</FormLabel>
          <Input id="hg-phone" type="tel" {...form.register("phone")} autoComplete="tel" />
        </FormField>
        <FormField>
          <FormLabel htmlFor="hg-zip">ZIP</FormLabel>
          <Input id="hg-zip" {...form.register("zip")} autoComplete="postal-code" />
          {form.formState.errors.zip ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.zip.message}</p>
          ) : null}
        </FormField>
      </div>
      <FormField>
        <FormLabel htmlFor="hg-county">County (optional)</FormLabel>
        <Input id="hg-county" {...form.register("county")} />
      </FormField>
      <FormField>
        <FormLabel htmlFor="hg-community">Town or neighborhood</FormLabel>
        <Input id="hg-community" {...form.register("community")} />
        {form.formState.errors.community ? (
          <p className="text-sm text-red-dirt">{form.formState.errors.community.message}</p>
        ) : null}
      </FormField>
      <FormField>
        <FormLabel htmlFor="hg-type">Gathering type</FormLabel>
        <select
          id="hg-type"
          className="w-full rounded-btn border border-deep-soil/15 bg-cream-canvas px-3 py-2.5 font-body text-sm text-deep-soil shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-dirt"
          {...form.register("gatheringType")}
        >
          {gatheringTypeValues.map((v) => (
            <option key={v} value={v}>
              {gatheringLabels[v]}
            </option>
          ))}
        </select>
      </FormField>
      {gType === "other" ? (
        <FormField>
          <FormLabel htmlFor="hg-type-other">Describe the gathering</FormLabel>
          <Input id="hg-type-other" {...form.register("gatheringTypeOther")} />
          {form.formState.errors.gatheringTypeOther ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.gatheringTypeOther.message}</p>
          ) : null}
        </FormField>
      ) : null}
      <FormField>
        <FormLabel htmlFor="hg-timing">Preferred timing (optional)</FormLabel>
        <Input id="hg-timing" {...form.register("preferredTiming")} placeholder="e.g. weeknight in May" />
      </FormField>
      <FormField>
        <FormLabel htmlFor="hg-guests">Expected guests (optional)</FormLabel>
        <Input id="hg-guests" {...form.register("expectedGuests")} placeholder="e.g. 6–12 neighbors" />
      </FormField>
      <FormField>
        <FormLabel htmlFor="hg-needs">What would help you host with confidence? (optional)</FormLabel>
        <Textarea id="hg-needs" rows={4} {...form.register("needs")} />
      </FormField>
      <Button type="submit" variant="primary" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : "Request host support"}
      </Button>
    </form>
  );
}
