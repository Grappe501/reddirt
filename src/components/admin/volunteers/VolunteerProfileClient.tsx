"use client";

import Link from "next/link";
import type { VolunteerProfile } from "@/lib/campaign-events/volunteers/volunteer-types";
import type { VolunteerTrainingPath } from "@/lib/campaign-events/volunteers/volunteer-training-engine";
import type { VolunteerCommunicationDraft } from "@/lib/campaign-events/volunteers/volunteer-types";
import { VOLUNTEER_PROGRESSION_TIERS, suggestNextProgressLevel } from "@/lib/campaign-events/volunteers/volunteer-progression";
import { detectRetentionRisk, detectLeadershipPotential } from "@/lib/campaign-events/volunteers/volunteer-scoring";

export function VolunteerProfileClient({
  profile,
  trainingPath,
  drafts,
}: {
  profile: VolunteerProfile;
  trainingPath: VolunteerTrainingPath;
  drafts: VolunteerCommunicationDraft[];
}) {
  const nextLevel = suggestNextProgressLevel(profile);
  const retention = detectRetentionRisk(profile);
  const leadership = detectLeadershipPotential(profile);

  return (
    <div className="mx-auto max-w-[900px] pb-16 font-body">
      <Link href="/admin/volunteers" className="text-xs font-bold text-kelly-navy underline">
        ← Volunteer command center
      </Link>
      <header className="mt-4 rounded-2xl border border-kelly-navy/15 p-6">
        <h1 className="font-heading text-2xl font-bold text-kelly-navy">
          {profile.firstName} {profile.lastName}
        </h1>
        <p className="mt-1 text-sm text-kelly-text/70">
          {profile.email} · {profile.county ?? "County TBD"} · Source: {profile.source}
        </p>
        <p className="mt-2 text-xs">
          Consent: <strong>{profile.consentStatus}</strong> · Reliability: {profile.reliabilityScore} · Retention risk:{" "}
          {retention} · Leadership: {leadership}
        </p>
      </header>

      <section className="mt-6 rounded-2xl border p-5">
        <h2 className="font-heading font-bold text-kelly-navy">Skills & availability</h2>
        <p className="mt-2 text-xs">Skills: {profile.skills.join(", ") || "—"}</p>
        <p className="text-xs">Interests: {profile.interests.join(", ") || "—"}</p>
        <p className="text-xs">Preferred tasks: {profile.preferredTasks.join(", ") || "—"}</p>
      </section>

      <section className="mt-4 rounded-2xl border p-5">
        <h2 className="font-heading font-bold text-kelly-navy">Training</h2>
        <p className="text-xs">Next modules: {trainingPath.recommendedNext.join(", ") || "—"}</p>
        <p className="text-xs">Completed: {trainingPath.completed.join(", ") || "—"}</p>
        {trainingPath.gaps.map((g) => (
          <p key={g} className="text-[10px] text-amber-800">
            {g}
          </p>
        ))}
      </section>

      <section className="mt-4 rounded-2xl border p-5">
        <h2 className="font-heading font-bold text-kelly-navy">Assignments & events</h2>
        <p className="text-xs">Events: {profile.assignedEvents.join(", ") || "None"}</p>
        <p className="text-xs">Tasks: {profile.assignedTasks.join(", ") || "None"}</p>
      </section>

      <section className="mt-4 rounded-2xl border p-5">
        <h2 className="font-heading font-bold text-kelly-navy">Leadership pathway</h2>
        <p className="text-xs">
          Current: {VOLUNTEER_PROGRESSION_TIERS.find((t) => t.level === profile.progressLevel)?.label ?? profile.progressLevel}
        </p>
        <p className="text-xs">Suggested next: {VOLUNTEER_PROGRESSION_TIERS.find((t) => t.level === nextLevel)?.label ?? nextLevel}</p>
      </section>

      <section className="mt-4 rounded-2xl border p-5">
        <h2 className="font-heading font-bold text-kelly-navy">Communication drafts (no send)</h2>
        {drafts.map((d) => (
          <div key={d.id} className="mt-3 rounded border border-kelly-text/10 p-3 text-xs">
            <p className="font-bold">{d.workflowType}: {d.subject}</p>
            <pre className="mt-2 whitespace-pre-wrap text-[10px]">{d.body}</pre>
            {d.consentWarning ? <p className="mt-1 text-amber-800">{d.consentWarning}</p> : null}
            <p className="mt-1 text-[10px]">Human approval required · suppression check before ECC send</p>
          </div>
        ))}
      </section>

      {profile.notes ? (
        <section className="mt-4 rounded-2xl border p-5">
          <h2 className="font-heading font-bold text-kelly-navy">Notes</h2>
          <p className="text-xs whitespace-pre-wrap">{profile.notes}</p>
        </section>
      ) : null}
    </div>
  );
}
