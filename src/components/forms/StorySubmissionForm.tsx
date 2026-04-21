"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storySubmissionSchema, type StorySubmissionInput } from "@/lib/forms/schemas";
import { FormField } from "@/components/forms/FormField";
import { FormLabel } from "@/components/forms/FormLabel";
import { Input } from "@/components/forms/Input";
import { Textarea } from "@/components/forms/Textarea";
import { Button } from "@/components/ui/Button";
import { FormErrorSummary, FormSuccessPanel } from "@/components/forms/FormMessages";
import { trackFormComplete, trackFormStart } from "@/lib/analytics/track";

export function StorySubmissionForm({ id }: { id?: string }) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [started, setStarted] = useState(false);

  const form = useForm<StorySubmissionInput>({
    resolver: zodResolver(storySubmissionSchema),
    defaultValues: {
      formType: "story_submission",
      name: "",
      email: "",
      phone: "",
      county: "",
      title: "",
      story: "",
      consentPublic: false,
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
          form.setError(k as keyof StorySubmissionInput, { message: v });
        });
      }
      setServerError(json.error ?? "Something went wrong.");
      return;
    }
    trackFormComplete("story_submission", json.submissionId);
    setShowSuccess(true);
    form.reset({
      formType: "story_submission",
      name: "",
      email: "",
      phone: "",
      county: "",
      title: "",
      story: "",
      consentPublic: false,
      website: "",
    });
  });

  if (showSuccess) {
    return (
      <FormSuccessPanel title="Thank you for trusting us with your story.">
        <p>
          A storyteller or organizer may follow up for clarity—we’ll never publish without your explicit OK.
        </p>
        <p>
          Want to stay looped in while we build this out?{" "}
          <a className="font-semibold text-red-dirt underline" href="/get-involved">
            Get involved
          </a>
          .
        </p>
        <Button type="button" variant="outline" onClick={() => setShowSuccess(false)}>
          Share another story
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
          trackFormStart("story_submission");
        }
      }}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...form.register("website")} />
      {serverError ? <FormErrorSummary errors={{ server: serverError }} /> : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField>
          <FormLabel htmlFor="ss-name">Name</FormLabel>
          <Input id="ss-name" {...form.register("name")} autoComplete="name" />
          {form.formState.errors.name ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.name.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="ss-email">Email</FormLabel>
          <Input id="ss-email" type="email" {...form.register("email")} autoComplete="email" />
          {form.formState.errors.email ? (
            <p className="text-sm text-red-dirt">{form.formState.errors.email.message}</p>
          ) : null}
        </FormField>
        <FormField>
          <FormLabel htmlFor="ss-phone">Phone (optional)</FormLabel>
          <Input id="ss-phone" type="tel" {...form.register("phone")} autoComplete="tel" />
        </FormField>
        <FormField>
          <FormLabel htmlFor="ss-county">County (optional)</FormLabel>
          <Input id="ss-county" {...form.register("county")} />
        </FormField>
      </div>
      <FormField>
        <FormLabel htmlFor="ss-title">Story title</FormLabel>
        <Input id="ss-title" {...form.register("title")} />
        {form.formState.errors.title ? (
          <p className="text-sm text-red-dirt">{form.formState.errors.title.message}</p>
        ) : null}
      </FormField>
      <FormField>
        <FormLabel htmlFor="ss-story">Your story</FormLabel>
        <Textarea id="ss-story" rows={10} {...form.register("story")} />
        {form.formState.errors.story ? (
          <p className="text-sm text-red-dirt">{form.formState.errors.story.message}</p>
        ) : null}
      </FormField>
      <FormField className="flex flex-row items-start gap-3">
        <input
          id="ss-consent"
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-deep-soil/30 text-red-dirt"
          checked={form.watch("consentPublic")}
          onChange={(e) => form.setValue("consentPublic", e.target.checked, { shouldValidate: true })}
        />
        <FormLabel htmlFor="ss-consent" className="font-normal text-deep-soil/80">
          It’s OK for organizers to follow up about this story. I understand nothing will be published without my
          permission.
        </FormLabel>
      </FormField>
      {form.formState.errors.consentPublic ? (
        <p className="text-sm text-red-dirt">{form.formState.errors.consentPublic.message}</p>
      ) : null}
      <Button type="submit" variant="primary" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : "Submit story"}
      </Button>
    </form>
  );
}
