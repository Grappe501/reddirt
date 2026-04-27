"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { joinMovementSchema, type JoinMovementInput } from "@/lib/forms/schemas";
import { FormField } from "@/components/forms/FormField";
import { FormLabel } from "@/components/forms/FormLabel";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { Button } from "@/components/ui/Button";
import { FormErrorSummary, FormSuccessPanel } from "@/components/forms/FormMessages";
import { trackFormComplete, trackFormStart } from "@/lib/analytics/track";

const interestOptions = [
  { id: "field", label: "Field / events" },
  { id: "digital", label: "Digital help" },
  { id: "faith_communities", label: "Faith communities" },
  { id: "voter_education", label: "Voter education" },
  { id: "party_or_civic_meeting", label: "Party or civic meeting invite" },
  { id: "direct_democracy", label: "Ballot access & initiatives" },
] as const;

export function JoinMovementForm({ id }: { id?: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [started, setStarted] = useState(false);

  const form = useForm<JoinMovementInput>({
    resolver: zodResolver(joinMovementSchema),
    defaultValues: {
      formType: "join_movement",
      name: "",
      email: "",
      phone: "",
      zip: "",
      county: "",
      interests: [],
      message: "",
      website: "",
    },
  });

  const interests = form.watch("interests") ?? [];

  const toggleInterest = (optId: string) => {
    const next = new Set(interests);
    if (next.has(optId)) next.delete(optId);
    else next.add(optId);
    form.setValue("interests", Array.from(next), { shouldValidate: true });
  };

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
          form.setError(k as keyof JoinMovementInput, { message: v });
        });
      }
      setServerError(json.error ?? "Something went wrong.");
      return;
    }
    trackFormComplete("join_movement", json.submissionId);
    setShowSuccess(true);
    form.reset({
      formType: "join_movement",
      name: "",
      email: "",
      phone: "",
      zip: "",
      county: "",
      interests: [],
      message: "",
      website: "",
    });
  });

  if (showSuccess) {
    return (
      <FormSuccessPanel title="You’re in.">
        <p>
          Thanks for raising your hand. A real human will review your note—especially meeting invites—and route it
          to the right contact.
        </p>
        <p>
          <strong>What happens next:</strong> watch your inbox. Explore{" "}
          <Link className="font-semibold text-kelly-navy underline" href="/priorities">
            office priorities
          </Link>{" "}
          or{" "}
          <Link className="font-semibold text-kelly-navy underline" href="/local-organizing">
            local organizing
          </Link>
          .
        </p>
        <Button type="button" variant="outline" onClick={() => setShowSuccess(false)}>
          Submit another
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
          trackFormStart("join_movement");
        }
      }}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...form.register("website")} />
      {serverError ? <FormErrorSummary errors={{ server: serverError }} /> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField>
          <FormLabel htmlFor="jm-name">Full name</FormLabel>
          <Input id="jm-name" {...form.register("name")} autoComplete="name" />
          {form.formState.errors.name ? (
            <p className="text-sm text-kelly-navy">{form.formState.errors.name.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="jm-email">Email</FormLabel>
          <Input id="jm-email" type="email" {...form.register("email")} autoComplete="email" />
          {form.formState.errors.email ? (
            <p className="text-sm text-kelly-navy">{form.formState.errors.email.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="jm-phone">Phone (optional)</FormLabel>
          <Input id="jm-phone" type="tel" {...form.register("phone")} autoComplete="tel" />
        </FormField>
        <FormField>
          <FormLabel htmlFor="jm-zip">ZIP</FormLabel>
          <Input id="jm-zip" {...form.register("zip")} autoComplete="postal-code" />
          {form.formState.errors.zip ? (
            <p className="text-sm text-kelly-navy">{form.formState.errors.zip.message}</p>
          ) : null}
        </FormField>
      </div>
      <FormField>
        <FormLabel htmlFor="jm-county">County (optional)</FormLabel>
        <Input id="jm-county" {...form.register("county")} />
      </FormField>
      <FormField>
        <FormLabel>How you want to help (optional)</FormLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {interestOptions.map((opt) => (
            <label key={opt.id} className="flex items-center gap-3 font-body text-sm text-kelly-text">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-kelly-text/30 text-kelly-navy"
                checked={interests.includes(opt.id)}
                onChange={() => toggleInterest(opt.id)}
              />
              {opt.label}
            </label>
          ))}
        </div>
      </FormField>
      <FormField>
        <FormLabel htmlFor="jm-message">Anything we should know? (optional)</FormLabel>
        <Textarea id="jm-message" {...form.register("message")} rows={5} />
      </FormField>
      <Button type="submit" variant="primary" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : "Submit"}
      </Button>
    </form>
  );
}
