"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { arkansasCountyNames } from "@/content/election-advisory/catalog";
import { electionAdvisoryUpdatesSchema, type ElectionAdvisoryUpdatesInput } from "@/lib/forms/schemas";
import { trackFormComplete, trackFormStart } from "@/lib/analytics/track";

import { submitAeacForm } from "./aeac-form-submit";

const defaults: ElectionAdvisoryUpdatesInput = {
  formType: "election_advisory_updates",
  name: "",
  email: "",
  county: "",
  website: "",
  sourcePage: "/election-advisory/updates",
  sourceComponent: "aeac-updates-form",
  consentEmail: false,
};

export function UpdatesForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [started, setStarted] = useState(false);

  const form = useForm<ElectionAdvisoryUpdatesInput>({
    resolver: zodResolver(electionAdvisoryUpdatesSchema),
    defaultValues: defaults,
  });

  const submit = form.handleSubmit(async (data) => {
    setServerError(null);
    const result = await submitAeacForm(data);
    if (!result.ok) {
      if (result.fields) {
        Object.entries(result.fields).forEach(([key, message]) => {
          form.setError(key as keyof ElectionAdvisoryUpdatesInput, { message });
        });
      }
      setServerError(result.error ?? "Something went wrong.");
      return;
    }
    trackFormComplete("election_advisory_updates", result.submissionId);
    setShowSuccess(true);
    form.reset(defaults);
  });

  if (showSuccess) {
    return (
      <div className="aeac-success">
        <h3>You are on the Commission update list.</h3>
        <p>Meeting notices, notes, findings, and public communications will come to this address when they are ready.</p>
        <button type="button" className="aeac-btn aeac-btn-ghost" onClick={() => setShowSuccess(false)}>
          Add another address
        </button>
      </div>
    );
  }

  return (
    <form
      className="aeac-form"
      onSubmit={submit}
      onFocus={() => {
        if (!started) {
          setStarted(true);
          trackFormStart("election_advisory_updates");
        }
      }}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...form.register("website")} />
      {serverError ? <p className="aeac-error">{serverError}</p> : null}

      <label>
        Full name
        <input autoComplete="name" {...form.register("name")} />
        {form.formState.errors.name ? <span className="aeac-error">{form.formState.errors.name.message}</span> : null}
      </label>
      <label>
        Email
        <input type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email ? <span className="aeac-error">{form.formState.errors.email.message}</span> : null}
      </label>
      <label>
        County (optional)
        <input list="aeac-counties-updates" {...form.register("county")} />
      </label>
      <label className="aeac-check">
        <input type="checkbox" {...form.register("consentEmail")} />
        <span>Send me regular email communications from the Arkansas Election Advisory Commission.</span>
      </label>
      {form.formState.errors.consentEmail ? (
        <p className="aeac-error">{form.formState.errors.consentEmail.message}</p>
      ) : null}

      <button type="submit" className="aeac-btn" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : "Sign up for updates"}
      </button>

      <datalist id="aeac-counties-updates">
        {arkansasCountyNames.map((county) => (
          <option key={county} value={county} />
        ))}
      </datalist>
    </form>
  );
}
