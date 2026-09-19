"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  arkansasCountyNames,
  electionAdvisoryTopicLabels,
  electionAdvisoryTopicValues,
  type ElectionAdvisoryTopic,
} from "@/content/election-advisory/catalog";
import { electionAdvisoryConcernSchema, type ElectionAdvisoryConcernInput } from "@/lib/forms/schemas";
import { trackFormComplete, trackFormStart } from "@/lib/analytics/track";

import { submitAeacForm } from "./aeac-form-submit";

const defaults: ElectionAdvisoryConcernInput = {
  formType: "election_advisory_concern",
  name: "",
  email: "",
  phone: "",
  county: "",
  zip: undefined,
  topics: [],
  concern: "",
  wantResponse: true,
  arkansasConnection: undefined,
  website: "",
  sourcePage: "/election-advisory/concerns",
  sourceComponent: "aeac-concern-form",
  consentEmail: false,
};

export function ConcernForm({
  initialTopics = [],
  initialConcern = "",
  sourcePage = "/election-advisory/concerns",
  sourceComponent = "aeac-concern-form",
  submitLabel = "Submit concern",
}: {
  initialTopics?: ElectionAdvisoryTopic[];
  initialConcern?: string;
  sourcePage?: string;
  sourceComponent?: string;
  submitLabel?: string;
} = {}) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [started, setStarted] = useState(false);
  const startingValues: ElectionAdvisoryConcernInput = {
    ...defaults,
    topics: initialTopics,
    concern: initialConcern,
    sourcePage,
    sourceComponent,
  };

  const form = useForm<ElectionAdvisoryConcernInput>({
    resolver: zodResolver(electionAdvisoryConcernSchema),
    defaultValues: startingValues,
  });

  const topics = form.watch("topics") ?? [];

  const toggleTopic = (topic: (typeof electionAdvisoryTopicValues)[number]) => {
    const next = new Set(topics);
    if (next.has(topic)) next.delete(topic);
    else next.add(topic);
    form.setValue("topics", Array.from(next), { shouldValidate: true });
  };

  const submit = form.handleSubmit(async (data) => {
    setServerError(null);
    const result = await submitAeacForm(data);
    if (!result.ok) {
      if (result.fields) {
        Object.entries(result.fields).forEach(([key, message]) => {
          form.setError(key as keyof ElectionAdvisoryConcernInput, { message });
        });
      }
      setServerError(result.error ?? "Something went wrong.");
      return;
    }
    trackFormComplete("election_advisory_concern", result.submissionId);
    setShowSuccess(true);
    form.reset(startingValues);
  });

  if (showSuccess) {
    return (
      <div className="aeac-success">
        <h3>Thank you. The concern is in the Commission record.</h3>
        <p>
          This is not a campaign comment box. A coordinator will review what you sent and keep it with the
          questions the Commission should be prepared to answer with facts.
        </p>
        <button type="button" className="aeac-btn aeac-btn-ghost" onClick={() => setShowSuccess(false)}>
          Share another concern
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
          trackFormStart("election_advisory_concern");
        }
      }}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...form.register("website")} />
      {serverError ? <p className="aeac-error">{serverError}</p> : null}

      <div className="aeac-grid">
        <label>
          Full name
          <input id="aeac-concern-name" autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name ? <span className="aeac-error">{form.formState.errors.name.message}</span> : null}
        </label>
        <label>
          Email
          <input id="aeac-concern-email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email ? <span className="aeac-error">{form.formState.errors.email.message}</span> : null}
        </label>
        <label>
          Phone (optional)
          <input id="aeac-concern-phone" type="tel" autoComplete="tel" {...form.register("phone")} />
        </label>
        <label>
          County
          <input id="aeac-concern-county" list="aeac-counties" {...form.register("county")} />
        </label>
      </div>

      <label>
        Your connection to Arkansas elections (optional)
        <input
          id="aeac-concern-connection"
          placeholder="Voter, poll worker, county official, researcher, concerned citizen"
          {...form.register("arkansasConnection")}
        />
      </label>

      <fieldset>
        <legend>Which part of the election cycle does this concern?</legend>
        <div className="aeac-topic-grid">
          {electionAdvisoryTopicValues.map((topic) => (
            <label key={topic} className="aeac-check">
              <input type="checkbox" checked={topics.includes(topic)} onChange={() => toggleTopic(topic)} />
              <span>{electionAdvisoryTopicLabels[topic]}</span>
            </label>
          ))}
        </div>
        {form.formState.errors.topics ? <p className="aeac-error">{form.formState.errors.topics.message}</p> : null}
      </fieldset>

      <label>
        The concern or question
        <textarea id="aeac-concern-body" rows={7} {...form.register("concern")} />
        {form.formState.errors.concern ? <span className="aeac-error">{form.formState.errors.concern.message}</span> : null}
      </label>

      <label className="aeac-check">
        <input type="checkbox" {...form.register("wantResponse")} />
        <span>I would like the Commission to consider answering this publicly or following up with me.</span>
      </label>

      <label className="aeac-check">
        <input type="checkbox" {...form.register("consentEmail")} />
        <span>You may email me about this concern.</span>
      </label>

      <button type="submit" className="aeac-btn" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : submitLabel}
      </button>

      <datalist id="aeac-counties">
        {arkansasCountyNames.map((county) => (
          <option key={county} value={county} />
        ))}
      </datalist>
    </form>
  );
}
