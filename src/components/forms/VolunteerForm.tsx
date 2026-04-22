"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { volunteerSchema, type VolunteerInput } from "@/lib/forms/schemas";
import { getToolkitTitleForResourceSlug } from "@/content/resources/toolkit";
import { FormField } from "@/components/forms/FormField";
import { FormLabel } from "@/components/forms/FormLabel";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { Button } from "@/components/ui/Button";
import { FormErrorSummary, FormSuccessPanel } from "@/components/forms/FormMessages";
import { trackFormComplete, trackFormStart } from "@/lib/analytics/track";

export function VolunteerForm({ id, prefillResource }: { id?: string; prefillResource?: string }) {
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
      <Button type="submit" variant="primary" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : "Volunteer"}
      </Button>
    </form>
  );
}
