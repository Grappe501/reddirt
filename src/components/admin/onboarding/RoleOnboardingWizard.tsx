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
  });
  const [role, setRole] = useState<OnboardingRoleId>("campaign_manager");
  const [result, setResult] = useState<ReturnType<typeof completeRoleOnboarding> | null>(null);

  const finish = () => {
    setResult(completeRoleOnboarding(profile, role));
    setStep(7);
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-16 font-body">
      <header className="rounded-3xl border border-kelly-navy/15 bg-kelly-page p-6">
        <p className="text-[10px] font-bold uppercase tracking-wider text-kelly-slate">Kelly Campaign OS</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-kelly-navy">Welcome — role onboarding</h1>
        <p className="mt-2 text-sm text-kelly-muted">We will place you in the right lane, recommend a dashboard blueprint, and your first three tasks.</p>
      </header>

      {step === 0 && (
        <section className="space-y-3 rounded-2xl border bg-kelly-page p-5">
          <label className="text-xs font-bold">1. Who are you?</label>
          <input className="w-full rounded-lg border px-3 py-2 text-sm" value={profile.who} onChange={(e) => setProfile({ ...profile, who: e.target.value })} />
          <button type="button" className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => setStep(1)}>
            Next
          </button>
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
          <label className="text-xs font-bold">3. Experience</label>
          <select className="w-full rounded-lg border px-3 py-2 text-sm" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: e.target.value as RoleOnboardingProfile["experience"] })}>
            <option value="none">First time on a campaign system</option>
            <option value="some">Some experience</option>
            <option value="experienced">Very experienced</option>
          </select>
          <button type="button" className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => setStep(1)}>Back</button>
          <button type="button" className="ml-2 rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => setStep(3)}>Next</button>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-3 rounded-2xl border bg-kelly-page p-5">
          <label className="text-xs font-bold">4. Pick the closest role</label>
          <div className="space-y-2">
            {ONBOARDING_ROLE_OPTIONS.map((r) => (
              <label key={r.id} className="flex cursor-pointer gap-2 rounded-lg border px-3 py-2 text-sm">
                <input type="radio" name="role" checked={role === r.id} onChange={() => setRole(r.id)} />
                <span>
                  <strong>{r.label}</strong> — {r.description}
                </span>
              </label>
            ))}
          </div>
          <button type="button" className="rounded-full border px-4 py-2 text-xs font-bold" onClick={() => setStep(2)}>Back</button>
          <button type="button" className="ml-2 rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={() => setStep(4)}>Next</button>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-3 rounded-2xl border bg-kelly-page p-5">
          <p className="text-xs font-bold">5–6. Safe boundaries (automatic)</p>
          <p className="text-xs text-kelly-muted">You should NOT send emails, promote Google Calendar, or post financial transactions without a supervisor.</p>
          <button type="button" className="rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white" onClick={finish}>
            See recommendations
          </button>
        </section>
      )}

      {step === 7 && result ? (
        <section className="space-y-4 rounded-2xl border border-kelly-navy/20 bg-kelly-page p-5">
          <h2 className="font-bold text-kelly-navy">Your placement</h2>
          <p className="text-sm">{result.placement.rationale}</p>
          <p className="text-xs">
            <strong>Dashboard:</strong> {result.dashboardTitle}
          </p>
          <h3 className="text-xs font-bold uppercase">First three tasks</h3>
          <ul className="space-y-1 text-sm">
            {result.firstThreeTasks.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="font-bold text-kelly-navy underline">
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/admin/ai-command-center/dashboard-builder" className="inline-block rounded-full bg-kelly-navy px-4 py-2 text-xs font-bold text-white">
            Open dashboard builder
          </Link>
        </section>
      ) : null}
    </div>
  );
}
