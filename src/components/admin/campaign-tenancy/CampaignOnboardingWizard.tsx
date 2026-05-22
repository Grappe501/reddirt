"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitCampaignOnboardingAction } from "@/app/admin/campaign-tenancy/actions";
import type { CampaignArchetype, CampaignOnboardingDraft } from "@/lib/campaign-tenancy/types";

const ARCHETYPES: { id: CampaignArchetype; label: string }[] = [
  { id: "candidate_campaign", label: "Candidate campaign" },
  { id: "pac", label: "PAC" },
  { id: "county_party", label: "County party" },
  { id: "advocacy_org", label: "Advocacy organization" },
  { id: "ballot_issue", label: "Ballot issue" },
];

export function CampaignOnboardingWizard() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<CampaignOnboardingDraft>({
    archetype: "candidate_campaign",
    displayName: "",
    electionType: "general",
    geography: "Arkansas",
    timelineStart: "2026-01-01",
    timelineEnd: "2026-11-03",
    staffSizeBand: "small_core",
    budgetLevel: "medium",
    priorities: ["field", "communications"],
    fieldGoals: ["volunteer_growth"],
    communicationGoals: ["authentic_story"],
    complianceNeeds: ["basic_reporting"],
    primaryColor: "#1a365d",
  });
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    setError(null);
    start(async () => {
      const res = await submitCampaignOnboardingAction(draft);
      if (res.ok) router.push("/admin/ai-command-center");
      else setError("Onboarding failed");
    });
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-3xl border border-kelly-text/10 bg-kelly-page p-8 font-body">
      <header>
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Sprint 10 · SaaS</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">Campaign onboarding</h1>
        <p className="mt-2 text-sm text-kelly-muted">Creates an isolated tenant config — human-reviewed, no auto-deploy.</p>
      </header>

      {step === 0 ? (
        <section className="space-y-3">
          <label className="block text-xs font-bold text-kelly-slate">Campaign type</label>
          <select
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={draft.archetype}
            onChange={(e) => setDraft({ ...draft, archetype: e.target.value as CampaignArchetype })}
          >
            {ARCHETYPES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
          <label className="block text-xs font-bold text-kelly-slate">Display name</label>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm"
            value={draft.displayName}
            onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
            placeholder="Campaign name"
          />
          <button type="button" className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => setStep(1)}>
            Next →
          </button>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="space-y-3">
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Election type" value={draft.electionType} onChange={(e) => setDraft({ ...draft, electionType: e.target.value })} />
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="Geography" value={draft.geography} onChange={(e) => setDraft({ ...draft, geography: e.target.value })} />
          <input className="w-full rounded-lg border px-3 py-2 text-sm" type="color" value={draft.primaryColor} onChange={(e) => setDraft({ ...draft, primaryColor: e.target.value })} />
          <div className="flex gap-2">
            <button type="button" className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => setStep(0)}>
              Back
            </button>
            <button
              type="button"
              disabled={pending || !draft.displayName.trim()}
              className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
              onClick={submit}
            >
              {pending ? "Creating…" : "Create campaign tenant"}
            </button>
          </div>
        </section>
      ) : null}

      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
