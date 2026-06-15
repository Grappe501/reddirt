"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  ONBOARDING_LOCAL_STORAGE_KEY,
  academyHowItHelpsHref,
  academyTrainingRoleHref,
  type RoleOnboardingProfile,
} from "@/lib/election-plan/load-volunteer-onboarding";
import type { VolunteerPosition } from "@/lib/election-plan/load-volunteer-academy";
import { volunteerPositionHref } from "@/lib/election-plan/load-volunteer-academy";

export type SavedOnboarding = {
  name: string;
  email: string;
  county: string;
  roleSlug: string;
  roleTitle: string;
  savedAt: string;
  firstActionComplete: boolean;
  trainingComplete: boolean;
};

type Props = {
  positions: VolunteerPosition[];
  roleProfiles: Record<string, RoleOnboardingProfile>;
};

export function OnboardingRoleSelectForm({ positions, roleProfiles }: Props) {
  const [saved, setSaved] = useState<SavedOnboarding | null>(null);
  const [roleSlug, setRoleSlug] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [county, setCounty] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ONBOARDING_LOCAL_STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw) as SavedOnboarding);
    } catch {
      /* ignore */
    }
  }, []);

  const profile = roleSlug ? roleProfiles[roleSlug] : null;
  const position = roleSlug ? positions.find((p) => p.slug === roleSlug) : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!roleSlug || !name.trim() || !position) return;
    const record: SavedOnboarding = {
      name: name.trim(),
      email: email.trim(),
      county: county.trim(),
      roleSlug,
      roleTitle: position.title,
      savedAt: new Date().toISOString(),
      firstActionComplete: false,
      trainingComplete: false,
    };
    localStorage.setItem(ONBOARDING_LOCAL_STORAGE_KEY, JSON.stringify(record));
    setSaved(record);
    setSubmitted(true);
  }

  function clearSelection() {
    localStorage.removeItem(ONBOARDING_LOCAL_STORAGE_KEY);
    setSaved(null);
    setSubmitted(false);
    setRoleSlug("");
    setName("");
    setEmail("");
    setCounty("");
  }

  if (saved && !submitted) {
    const p = roleProfiles[saved.roleSlug];
    return (
      <div className="ep-card border-2 border-[var(--ep-gold)]">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Your saved role selection</h2>
        <p className="mt-2 text-sm">
          <strong>{saved.name}</strong> · {saved.roleTitle}
          {saved.county ? ` · ${saved.county} County` : null}
        </p>
        {p ? (
          <div className="mt-4 rounded-lg bg-amber-50 p-4">
            <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Your first action</p>
            <p className="mt-1 text-sm font-medium text-[var(--ep-navy)]">{p.firstAction}</p>
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={academyTrainingRoleHref(saved.roleSlug)} className="rounded-md bg-[var(--ep-navy)] px-3 py-2 text-xs font-bold text-white">
            Open training packet →
          </Link>
          <Link href={academyHowItHelpsHref(saved.roleSlug)} className="rounded-md border border-[var(--ep-border)] px-3 py-2 text-xs font-semibold">
            How this helps Kelly win →
          </Link>
          <button type="button" onClick={clearSelection} className="text-xs text-[var(--ep-navy-muted)] underline">
            Choose a different role
          </button>
        </div>
      </div>
    );
  }

  if (submitted && saved && profile) {
    return (
      <div id="first-action" className="ep-card border-2 border-emerald-400 bg-emerald-50/50">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">You have a role — here is your first action</h2>
        <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">
          {saved.name}, you selected <strong>{saved.roleTitle}</strong>. Weekly expectation: {profile.weeklyExpectation}
        </p>
        <div className="mt-4 rounded-lg border border-emerald-200 bg-white p-4">
          <p className="text-xs font-bold uppercase text-emerald-800">First action (within 72 hours)</p>
          <p className="mt-2 text-sm font-medium">{profile.firstAction}</p>
        </div>
        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-[var(--ep-navy-muted)]">
          {profile.firstWeekTasks.slice(0, 3).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={academyTrainingRoleHref(saved.roleSlug)} className="rounded-md bg-[var(--ep-navy)] px-3 py-2 text-xs font-bold text-white">
            Complete training packet →
          </Link>
          <Link href={volunteerPositionHref(saved.roleSlug)} className="rounded-md border px-3 py-2 text-xs font-semibold">
            Full role page →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form id="choose-role" onSubmit={handleSubmit} className="ep-card space-y-4">
      <h2 className="font-heading font-bold text-[var(--ep-navy)]">Choose your role</h2>
      <p className="text-sm text-[var(--ep-navy-muted)]">People join roles, not organizations. Pick one job.</p>

      <label className="block text-sm">
        <span className="font-semibold">Role</span>
        <select
          required
          value={roleSlug}
          onChange={(e) => setRoleSlug(e.target.value)}
          className="mt-1 w-full rounded-md border border-[var(--ep-border)] px-3 py-2"
        >
          <option value="">Select a role…</option>
          {positions.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title} ({p.timeCommitment})
            </option>
          ))}
        </select>
      </label>

      {profile && position ? (
        <div id="expectations" className="rounded-lg bg-slate-50 p-4 text-sm">
          <p className="font-semibold text-[var(--ep-navy)]">{position.purpose}</p>
          <p className="mt-2 text-[var(--ep-navy-muted)]">
            <strong>Weekly expectation:</strong> {profile.weeklyExpectation}
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold">Your name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--ep-border)] px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-semibold">County</span>
          <input
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            placeholder="e.g. Pulaski"
            className="mt-1 w-full rounded-md border border-[var(--ep-border)] px-3 py-2"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-semibold">Email (optional)</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-[var(--ep-border)] px-3 py-2"
        />
      </label>

      <button type="submit" className="w-full rounded-md bg-[var(--ep-navy)] py-3 text-sm font-bold text-white">
        Confirm role & see first action
      </button>
    </form>
  );
}

export function OnboardingLocalStatusBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ONBOARDING_LOCAL_STORAGE_KEY);
      setCount(raw ? 1 : 0);
    } catch {
      setCount(0);
    }
  }, []);

  if (count === 0) return null;
  return (
    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
      1 browser registration
    </span>
  );
}
