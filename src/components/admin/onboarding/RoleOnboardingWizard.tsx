"use client";

import { useState } from "react";
import Link from "next/link";
import {
  completeRoleOnboarding,
  ONBOARDING_ROLE_OPTIONS,
  type OnboardingRoleId,
  type RoleOnboardingProfile,
} from "@/lib/agents/onboarding/role-onboarding-engine";

export function RoleOnboardingWizard() {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<RoleOnboardingProfile>({
    who: "",
    helpingWith: "",
    experience: "some",
    shouldDo: [],
    shouldNot: [],
    availableHoursPerWeek: 5,
    preferredWorkStyle: "mixed",
    skillConfidence: "medium",
    campaignExperience: "some",
    techComfort: "medium",
    interests: [],
  });
  const [role, setRole] = useState<OnboardingRoleId>("campaign_manager");
  const [result, setResult] = useState<ReturnType<typeof completeRoleOnboarding> | null>(null);

  const finish = () => {
    setResult(completeRoleOnboarding(profile, role));
    setStep(9);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-16 font-body">
      <header className="rounded-3xl border border-kelly-navy/15 bg-kelly-page p-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Kelly Campaign OS</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">Welcome — role onboarding V2</h1>
        <p className="mt-2 text-sm text-kelly-muted">
          Placement, copilot, training path, dashboard blueprint, and first session plan — human-gated for risky actions.
        </p>
      </header>

      {step === 0 && (
        <section className="space-y-3 rounded-2xl border bg-kelly-page p-5">
          <label className="text-xs font-bold">1. Who are you?</label>
          <input className="w-full rounded-lg border px-3 py-2 text-sm" value={profile.who} onChange={(e) => setProfile({ ...profile, who: e.target.value })} />
          <button type="button" className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => setStep(1)}>Next</button>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-3 rounded-2xl border bg-kelly-page p-5">
          <label className="text-xs font-bold">2. What are you helping with?</label>
          <textarea className="w-full rounded-lg border px-3 py-2 text-sm" rows={2} value={profile.helpingWith} onChange={(e) => setProfile({ ...profile, helpingWith: e.target.value })} />
          <button type="button" className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => setStep(0)}>Back</button>
          <button type="button" className="ml-2 rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => setStep(2)}>Next</button>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-3 rounded-2xl border bg-kelly-page p-5">
          <label className="text-xs font-bold">3. Campaign & system experience</label>
          <select className="w-full rounded-lg border px-3 py-2 text-sm" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value as RoleOnboardingProfile["experience"] })}>
            <option value="none">First time</option>
            <option value="some">Some experience</option>
            <option value="experienced">Very experienced</option>
          </select>
          <select className="w-full rounded-lg border px-3 py-2 text-sm" value={profile.campaignExperience} onChange={(e) => setProfile({ ...profile, campaignExperience: e.target.value as RoleOnboardingProfile["campaignExperience"] })}>
            <option value="first">First campaign</option>
            <option value="some">Some campaigns</option>
            <option value="veteran">Veteran</option>
          </select>
          <button type="button" className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => setStep(1)}>Back</button>
          <button type="button" className="ml-2 rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => setStep(3)}>Next</button>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-3 rounded-2xl border bg-kelly-page p-5">
          <label className="text-xs font-bold">4. Time & work style</label>
          <input type="number" min={1} max={60} className="w-full rounded-lg border px-3 py-2 text-sm" value={profile.availableHoursPerWeek ?? 5} onChange={(e) => setProfile({ ...profile, availableHoursPerWeek: Number(e.target.value) })} placeholder="Hours per week" />
          <select className="w-full rounded-lg border px-3 py-2 text-sm" value={profile.preferredWorkStyle} onChange={(e) => setProfile({ ...profile, preferredWorkStyle: e.target.value as RoleOnboardingProfile["preferredWorkStyle"] })}>
            <option value="async">Mostly async / solo</option>
            <option value="meetings">Meetings & check-ins</option>
            <option value="mixed">Mixed</option>
          </select>
          <button type="button" className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => setStep(2)}>Back</button>
          <button type="button" className="ml-2 rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => setStep(4)}>Next</button>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-3 rounded-2xl border bg-kelly-page p-5">
          <label className="text-xs font-bold">5. Skill & tech comfort</label>
          <select className="w-full rounded-lg border px-3 py-2 text-sm" value={profile.skillConfidence} onChange={(e) => setProfile({ ...profile, skillConfidence: e.target.value as RoleOnboardingProfile["skillConfidence"] })}>
            <option value="low">Still learning</option>
            <option value="medium">Comfortable</option>
            <option value="high">Very confident</option>
          </select>
          <select className="w-full rounded-lg border px-3 py-2 text-sm" value={profile.techComfort} onChange={(e) => setProfile({ ...profile, techComfort: e.target.value as RoleOnboardingProfile["techComfort"] })}>
            <option value="low">Low tech comfort</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button type="button" className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => setStep(3)}>Back</button>
          <button type="button" className="ml-2 rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => setStep(5)}>Next</button>
        </section>
      )}

      {step === 5 && (
        <section className="space-y-3 rounded-2xl border bg-kelly-page p-5">
          <label className="text-xs font-bold">6. Pick the closest role</label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {ONBOARDING_ROLE_OPTIONS.map((r) => (
              <label key={r.id} className="flex cursor-pointer gap-2 rounded-lg border px-3 py-2 text-sm">
                <input type="radio" name="role" checked={role === r.id} onChange={() => setRole(r.id)} />
                <span><strong>{r.label}</strong> — {r.description}</span>
              </label>
            ))}
          </div>
          <button type="button" className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => setStep(4)}>Back</button>
          <button type="button" className="ml-2 rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => setStep(6)}>Next</button>
        </section>
      )}

      {step === 6 && (
        <section className="space-y-3 rounded-2xl border bg-kelly-page p-5">
          <label className="text-xs font-bold">7. Supervisor / escalation (optional)</label>
          <input className="w-full rounded-lg border px-3 py-2 text-sm" placeholder="e.g. Campaign manager" value={profile.supervisorContact ?? ""} onChange={(e) => setProfile({ ...profile, supervisorContact: e.target.value })} />
          <p className="text-xs text-kelly-muted">What not to touch yet: send email, GCal promotion, FIN post, mass comms — until trained.</p>
          <button type="button" className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={finish}>See recommendations</button>
        </section>
      )}

      {step === 9 && result ? (
        <section className="space-y-4 rounded-2xl border border-kelly-navy/20 bg-kelly-page p-5">
          <h2 className="font-bold text-kelly-navy">Your placement</h2>
          <p className="text-sm">{result.placement.rationale}</p>
          <p className="text-xs"><strong>Copilot:</strong> {result.copilotBrief.headline}</p>
          <p className="text-xs text-kelly-muted">{result.copilotBrief.mission}</p>
          <p className="text-xs"><strong>Onboarding score:</strong> {result.onboardingScore}%</p>
          <p className="text-xs"><strong>Dashboard:</strong> {result.dashboardTitle}</p>
          <h3 className="text-xs font-bold uppercase">First tasks</h3>
          <ul className="space-y-1 text-sm">
            {result.firstThreeTasks.map((t) => (
              <li key={t.href}><Link href={t.href} className="font-bold text-kelly-navy underline">{t.label}</Link></li>
            ))}
          </ul>
          <h3 className="text-xs font-bold uppercase">Training path</h3>
          <p className="text-xs text-kelly-muted">{result.trainingPath.moduleIds.slice(0, 5).join(" · ")}</p>
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/training?role=${result.copilotRole}`} className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white">Training center</Link>
            <Link href="/admin/ai-command-center/dashboard-builder/preview" className="rounded-full border px-4 py-2 text-xs font-bold">Dashboard preview</Link>
            <Link href="/admin/ai-command-center" className="rounded-full border px-4 py-2 text-xs font-bold">Command center</Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
