"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  arkansasCountyNames,
  electionAdvisoryRoleLabels,
  electionAdvisoryRoleValues,
  electionAdvisoryTopicLabels,
  electionAdvisoryTopicValues,
} from "@/content/election-advisory/catalog";
import { electionAdvisoryParticipateSchema, type ElectionAdvisoryParticipateInput } from "@/lib/forms/schemas";
import { trackFormComplete, trackFormStart } from "@/lib/analytics/track";

import { submitAeacForm } from "./aeac-form-submit";

const defaults: ElectionAdvisoryParticipateInput = {
  formType: "election_advisory_participate",
  name: "",
  email: "",
  phone: "",
  county: "",
  city: undefined,
  role: "not_sure",
  topics: [],
  expertise: undefined,
  affiliation: undefined,
  arkansasResident: false,
  holdPublicElectionOffice: false,
  notes: undefined,
  website: "",
  sourcePage: "/election-advisory/participate",
  sourceComponent: "aeac-participate-form",
  consentEmail: true,
};

export function ParticipateForm() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [started, setStarted] = useState(false);

  const form = useForm<ElectionAdvisoryParticipateInput>({
    resolver: zodResolver(electionAdvisoryParticipateSchema),
    defaultValues: defaults,
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
          form.setError(key as keyof ElectionAdvisoryParticipateInput, { message });
        });
      }
      setServerError(result.error ?? "Something went wrong.");
      return;
    }
    trackFormComplete("election_advisory_participate", result.submissionId);
    setShowSuccess(true);
    form.reset(defaults);
  });

  if (showSuccess) {
    return (
      <div className="aeac-success">
        <h3>You are in the founding conversation.</h3>
        <p>
          Seats are being identified carefully. County and state officials who should not participate before the
          election will have reserved places afterward. Someone from the organizing team will follow up.
        </p>
        <button type="button" className="aeac-btn aeac-btn-ghost" onClick={() => setShowSuccess(false)}>
          Submit another interest
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
          trackFormStart("election_advisory_participate");
        }
      }}
    >
      <input type="text" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden {...form.register("website")} />
      {serverError ? <p className="aeac-error">{serverError}</p> : null}

      <div className="aeac-grid">
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
          Phone (optional)
          <input type="tel" autoComplete="tel" {...form.register("phone")} />
        </label>
        <label>
          County
          <input list="aeac-counties-participate" {...form.register("county")} />
          {form.formState.errors.county ? <span className="aeac-error">{form.formState.errors.county.message}</span> : null}
        </label>
      </div>

      <label>
        City or community (optional)
        <input autoComplete="address-level2" {...form.register("city")} />
      </label>

      <label>
        How do you want to take part?
        <select {...form.register("role")}>
          {electionAdvisoryRoleValues.map((role) => (
            <option key={role} value={role}>
              {electionAdvisoryRoleLabels[role]}
            </option>
          ))}
        </select>
      </label>

      <label>
        Affiliation or expertise in one line (optional)
        <input placeholder="County clerk office, cybersecurity, poll worker, academic, civic group" {...form.register("affiliation")} />
      </label>

      <fieldset>
        <legend>Topics you know or care about</legend>
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
        What should the Commission know about your experience?
        <textarea rows={6} {...form.register("expertise")} />
      </label>

      <label>
        Anything else (optional)
        <textarea rows={4} {...form.register("notes")} />
      </label>

      <label className="aeac-check">
        <input type="checkbox" {...form.register("arkansasResident")} />
        <span>I live or work in Arkansas. This commission is for Arkansas people.</span>
      </label>
      {form.formState.errors.arkansasResident ? (
        <p className="aeac-error">{form.formState.errors.arkansasResident.message}</p>
      ) : null}

      <label className="aeac-check">
        <input type="checkbox" {...form.register("holdPublicElectionOffice")} />
        <span>I hold a county or state election office and should wait to participate until after the election.</span>
      </label>

      <label className="aeac-check">
        <input type="checkbox" {...form.register("consentEmail")} />
        <span>You may email me about Commission participation and meetings.</span>
      </label>

      <button type="submit" className="aeac-btn" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : "Submit interest"}
      </button>

      <datalist id="aeac-counties-participate">
        {arkansasCountyNames.map((county) => (
          <option key={county} value={county} />
        ))}
      </datalist>
    </form>
  );
}
