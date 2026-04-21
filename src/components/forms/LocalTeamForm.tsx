"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { localTeamSchema, type LocalTeamInput } from "@/lib/forms/schemas";
import { FormField } from "@/components/forms/FormField";
import { FormLabel } from "@/components/forms/FormLabel";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { Button } from "@/components/ui/Button";
import { FormErrorSummary, FormSuccessPanel } from "@/components/forms/FormMessages";
import { trackFormComplete, trackFormStart } from "@/lib/analytics/track";

export function LocalTeamForm({ id }: { id?: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [started, setStarted] = useState(false);

  const form = useForm<LocalTeamInput>({
    resolver: zodResolver(localTeamSchema),
    defaultValues: {
      formType: "local_team",
      name: "",
      email: "",
      phone: "",
      zip: "",
      county: "",
      community: "",
      teamGoal: "",
      website: "",
    },
  });

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
          form.setError(k as keyof LocalTeamInput, { message: v });
        });
      }
      setServerError(json.error ?? "Something went wrong.");
      return;
    }
    trackFormComplete("local_team", json.submissionId);
    setShowSuccess(true);
    form.reset({
      formType: "local_team",
      name: "",
      email: "",
      phone: "",
      zip: "",
      county: "",
      community: "",
      teamGoal: "",
      website: "",
    });
  });

  if (showSuccess) {
    return (
      <FormSuccessPanel title="Local power starts with a small circle.">
        <p>
          Thanks for stepping up where you live. Organizers will reach out with a simple next step—usually a
          short call or neighbor meetup plan.
        </p>
        <p>
          While you wait, skim the{" "}
          <a className="font-semibold text-red-dirt underline" href="/resources">
            resources
          </a>{" "}
          library for facilitation tips and civic explainers you can reuse locally.
        </p>
        <Button type="button" variant="outline" onClick={() => setShowSuccess(false)}>
          Register another team lead
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
          trackFormStart("local_team");
        }
      }}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...form.register("website")} />
      {serverError ? <FormErrorSummary errors={{ server: serverError }} /> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField>
          <FormLabel htmlFor="lt-name">Full name</FormLabel>
          <Input id="lt-name" {...form.register("name")} autoComplete="name" />
          {form.formState.errors.name ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.name.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="lt-email">Email</FormLabel>
          <Input id="lt-email" type="email" {...form.register("email")} autoComplete="email" />
          {form.formState.errors.email ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.email.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="lt-phone">Phone (optional)</FormLabel>
          <Input id="lt-phone" type="tel" {...form.register("phone")} autoComplete="tel" />
        </FormField>
        <FormField>
          <FormLabel htmlFor="lt-zip">ZIP</FormLabel>
          <Input id="lt-zip" {...form.register("zip")} autoComplete="postal-code" />
          {form.formState.errors.zip ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.zip.message}</p>
          ) : null}
        </FormField>
      </div>
      <FormField>
        <FormLabel htmlFor="lt-county">County (optional)</FormLabel>
        <Input id="lt-county" {...form.register("county")} />
      </FormField>
      <FormField>
        <FormLabel htmlFor="lt-community">Town or community</FormLabel>
        <Input id="lt-community" {...form.register("community")} />
        {form.formState.errors.community ? (
          <p className="text-sm text-red-dirt">{form.formState.errors.community.message}</p>
        ) : null}
      </FormField>
      <FormField>
        <FormLabel htmlFor="lt-goal">What do you want this team to do first? (optional)</FormLabel>
        <Textarea id="lt-goal" rows={4} {...form.register("teamGoal")} />
      </FormField>
      <Button type="submit" variant="primary" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : "Start a local team"}
      </Button>
    </form>
  );
}
