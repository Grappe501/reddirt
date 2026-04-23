"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  directDemocracyCommitmentSchema,
  type DirectDemocracyCommitmentInput,
} from "@/lib/forms/schemas";
import { FormField } from "@/components/forms/FormField";
import { FormLabel } from "@/components/forms/FormLabel";
import { Input } from "@/components/forms/Input";
import { Button } from "@/components/ui/Button";
import { FormErrorSummary, FormSuccessPanel } from "@/components/forms/FormMessages";
import { trackFormComplete, trackFormStart } from "@/lib/analytics/track";

export function DirectDemocracyCommitmentForm({ id }: { id?: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [started, setStarted] = useState(false);

  const form = useForm<DirectDemocracyCommitmentInput>({
    resolver: zodResolver(directDemocracyCommitmentSchema),
    defaultValues: {
      formType: "direct_democracy_commitment",
      name: "",
      email: "",
      phone: "",
      zip: "",
      county: "",
      referendumOptIn: false,
      smsOptIn: false,
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
          form.setError(k as keyof DirectDemocracyCommitmentInput, { message: v });
        });
      }
      setServerError(json.error ?? "Something went wrong.");
      return;
    }
    trackFormComplete("direct_democracy_commitment", json.submissionId);
    setShowSuccess(true);
    form.reset({
      formType: "direct_democracy_commitment",
      name: "",
      email: "",
      phone: "",
      zip: "",
      county: "",
      referendumOptIn: false,
      smsOptIn: false,
      website: "",
    });
  });

  if (showSuccess) {
    return (
      <FormSuccessPanel title="You’re on the list.">
        <p>
          We’ll only reach out when there’s a real, vetted referendum or initiative moment—never spam, never
          guilt.
        </p>
        <p>
          Until then, read how the{" "}
          <Link className="font-semibold text-red-dirt underline" href="/direct-democracy#initiative-pipeline">
            initiative pipeline
          </Link>{" "}
          works and share the{" "}
          <Link className="font-semibold text-red-dirt underline" href="/resources">
            civic education
          </Link>{" "}
          resources with a neighbor.
        </p>
        <Button type="button" variant="outline" onClick={() => setShowSuccess(false)}>
          Update another commitment
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
          trackFormStart("direct_democracy_commitment");
        }
      }}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...form.register("website")} />
      {serverError ? <FormErrorSummary errors={{ server: serverError }} /> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField>
          <FormLabel htmlFor="ddc-name">Full name</FormLabel>
          <Input id="ddc-name" {...form.register("name")} autoComplete="name" />
          {form.formState.errors.name ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.name.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="ddc-email">Email</FormLabel>
          <Input id="ddc-email" type="email" {...form.register("email")} autoComplete="email" />
          {form.formState.errors.email ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.email.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="ddc-phone">Mobile phone (optional)</FormLabel>
          <Input id="ddc-phone" type="tel" {...form.register("phone")} autoComplete="tel" />
        </FormField>
        <FormField>
          <FormLabel htmlFor="ddc-zip">ZIP</FormLabel>
          <Input id="ddc-zip" {...form.register("zip")} autoComplete="postal-code" />
          {form.formState.errors.zip ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.zip.message}</p>
          ) : null}
        </FormField>
      </div>
      <FormField>
        <FormLabel htmlFor="ddc-county">County</FormLabel>
        <Input id="ddc-county" {...form.register("county")} autoComplete="address-level2" />
        {form.formState.errors.county ? (
          <p className="text-sm text-red-dirt">{form.formState.errors.county.message}</p>
        ) : null}
      </FormField>
      <FormField className="flex flex-row items-start gap-3">
        <input
          id="ddc-ref"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-deep-soil/30 text-red-dirt"
          checked={form.watch("referendumOptIn")}
          onChange={(e) => form.setValue("referendumOptIn", e.target.checked)}
        />
        <FormLabel htmlFor="ddc-ref" className="font-normal text-deep-soil/80">
          Notify me when a referendum petition needs signatures to protect voter power.
        </FormLabel>
      </FormField>
      <FormField className="flex flex-row items-start gap-3">
        <input
          id="ddc-sms"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-deep-soil/30 text-red-dirt"
          checked={form.watch("smsOptIn")}
          onChange={(e) => form.setValue("smsOptIn", e.target.checked)}
        />
        <FormLabel htmlFor="ddc-sms" className="font-normal text-deep-soil/80">
          Text me for urgent civic actions (carrier rates may apply).
        </FormLabel>
      </FormField>
      <Button type="submit" variant="primary" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : "Save my commitment"}
      </Button>
    </form>
  );
}
