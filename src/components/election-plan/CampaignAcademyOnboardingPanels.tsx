import Link from "next/link";

import { OnboardingLocalStatusBadge, OnboardingRoleSelectForm } from "@/components/election-plan/OnboardingRoleSelectForm";
import {
  getVolunteerAcademy,
  volunteerAcademyHref,
  volunteerPositionHref,
} from "@/lib/election-plan/load-volunteer-academy";
import {
  academyAssignmentsHref,
  academyJune28Href,
  academyOnboardingHref,
  academyTrainingHref,
  getOnboardingRollup,
  getVolunteerOnboarding,
  getRoleOnboardingBundle,
  academyHowItHelpsHref,
  academyTrainingRoleHref,
} from "@/lib/election-plan/load-volunteer-onboarding";

function AcademyNav() {
  const links = [
    { href: volunteerAcademyHref(), label: "Academy hub" },
    { href: academyOnboardingHref(), label: "Onboarding" },
    { href: academyJune28Href(), label: "June 28 launch" },
    { href: academyAssignmentsHref(), label: "Assignments" },
    { href: academyTrainingHref(), label: "Training" },
  ];
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="rounded-full border border-[var(--ep-border)] px-3 py-1 text-xs font-semibold hover:bg-[var(--ep-cream)]"
        >
          {l.label}
        </Link>
      ))}
    </div>
  );
}

export function VolunteerOnboardingPanel() {
  const academy = getVolunteerAcademy();
  const onboarding = getVolunteerOnboarding();
  const rollup = getOnboardingRollup();

  return (
    <section>
      <AcademyNav />
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Phase 18.7C</p>
      <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Volunteer Onboarding</h1>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{onboarding.mission}</p>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.filled}/{rollup.foundingLeaderGoal}</div>
          <div className="ep-stat-label">Founding leaders goal</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.open}</div>
          <div className="ep-stat-label">Assignment slots open</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{onboarding.launchDate}</div>
          <div className="ep-stat-label">Launch date</div>
        </div>
      </div>

      <div className="mb-8 ep-card">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Onboarding path</h2>
        <ol className="mt-4 space-y-2">
          {onboarding.onboardingSteps.map((step, i) => (
            <li key={step.id} className="flex gap-3 text-sm">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--ep-navy)] text-xs font-bold text-white">
                {i + 1}
              </span>
              <Link href={step.route} className="font-medium hover:underline">
                {step.label}
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <OnboardingRoleSelectForm positions={academy.positions} roleProfiles={onboarding.roleProfiles} />

      <p className="mt-6 text-sm">
        <Link href={academyJune28Href()} className="font-semibold text-[var(--ep-navy)] hover:underline">
          June 28 launch agenda →
        </Link>
      </p>
    </section>
  );
}

export function June28LaunchPanel() {
  const onboarding = getVolunteerOnboarding();
  const { launchEvent, followUpPacket } = onboarding;

  return (
    <section>
      <AcademyNav />
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">June 28 · {onboarding.launchDate}</p>
      <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{launchEvent.title}</h1>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{launchEvent.subtitle}</p>
      <p className="mt-2 text-sm">
        {launchEvent.format} · {launchEvent.durationMinutes} min · Goal: {launchEvent.goal}
      </p>

      <div className="my-6 overflow-x-auto ep-card">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Launch agenda</h2>
        <table className="mt-4 w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="pb-2 pr-3">Time</th>
              <th className="pb-2 pr-3">Segment</th>
              <th className="pb-2 pr-3">Owner</th>
              <th className="pb-2">Notes</th>
            </tr>
          </thead>
          <tbody>
            {launchEvent.agenda.map((row) => (
              <tr key={row.segment} className="border-b border-[var(--ep-border)] last:border-0">
                <td className="py-2 pr-3 tabular-nums">{row.time}</td>
                <td className="py-2 pr-3 font-medium">{row.segment}</td>
                <td className="py-2 pr-3">{row.owner}</td>
                <td className="py-2 text-[var(--ep-navy-muted)]">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ep-card">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">Follow-up packet</h2>
        <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
          Send within {followUpPacket.sendWithin} · Subject: {followUpPacket.subject}
        </p>
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">
          {followUpPacket.includes.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3 className="mt-6 font-heading text-sm font-bold">Week one checklist</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--ep-navy-muted)]">
          {followUpPacket.weekOneChecklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <p className="mt-6">
        <Link href={academyOnboardingHref()} className="font-semibold text-[var(--ep-navy)] hover:underline">
          Start onboarding flow →
        </Link>
      </p>
    </section>
  );
}

export function AssignmentsTrackerPanel() {
  const onboarding = getVolunteerOnboarding();
  const rollup = getOnboardingRollup();
  const academy = getVolunteerAcademy();

  return (
    <section>
      <AcademyNav />
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Assignment tracker</h1>
        <OnboardingLocalStatusBadge />
      </div>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
        Founding leader goal: {rollup.foundingLeaderGoal} · {rollup.filled} filled · {rollup.open} open
      </p>

      <div className="my-6 ep-stat-grid">
        <div className="ep-stat">
          <div className="ep-stat-value text-red-700">{rollup.open}</div>
          <div className="ep-stat-label">Slots open</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.onboardingComplete}</div>
          <div className="ep-stat-label">Onboarding complete</div>
        </div>
        <div className="ep-stat">
          <div className="ep-stat-value">{rollup.pendingOnboarding}</div>
          <div className="ep-stat-label">Assigned · training pending</div>
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {rollup.byRole.map((r) => (
          <div key={r.slug} className="rounded-lg border border-[var(--ep-border)] p-3 text-sm">
            <p className="font-medium">{r.title}</p>
            <p className="mt-1 text-[var(--ep-navy-muted)]">
              {r.slotsFilled} filled · {r.slotsOpen} open
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto ep-card">
        <table className="w-full min-w-[48rem] text-sm">
          <thead>
            <tr className="border-b text-left text-xs uppercase text-[var(--ep-navy-muted)]">
              <th className="pb-2 pr-3">Slot</th>
              <th className="pb-2 pr-3">Role</th>
              <th className="pb-2 pr-3">Region</th>
              <th className="pb-2 pr-3">Volunteer</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {onboarding.assignmentSlots.map((slot) => {
              const role = academy.positions.find((p) => p.slug === slot.roleSlug);
              return (
                <tr key={slot.id} className="border-b border-[var(--ep-border)] last:border-0">
                  <td className="py-2 pr-3 font-medium">{slot.label}</td>
                  <td className="py-2 pr-3">{role?.title ?? slot.roleSlug}</td>
                  <td className="py-2 pr-3">{slot.region}</td>
                  <td className="py-2 pr-3">{slot.volunteerName ?? "—"}</td>
                  <td className="py-2">
                    <span
                      className={
                        slot.volunteerName
                          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900"
                          : "rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-900"
                      }
                    >
                      {slot.volunteerName ? "filled" : "open"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function TrainingHubPanel() {
  const academy = getVolunteerAcademy();
  const onboarding = getVolunteerOnboarding();

  return (
    <section>
      <AcademyNav />
      <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">Training packets</h1>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">Complete your role training before your first weekly tasks.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {academy.positions.map((pos) => {
          const profile = onboarding.roleProfiles[pos.slug];
          const moduleCount = profile?.trainingModules.length ?? 0;
          const totalMin = profile?.trainingModules.reduce((s, m) => s + m.durationMinutes, 0) ?? 0;
          return (
            <Link
              key={pos.slug}
              href={academyTrainingRoleHref(pos.slug)}
              className="ep-card block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
            >
              <h2 className="font-heading font-bold text-[var(--ep-navy)]">{pos.title}</h2>
              <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">
                {moduleCount} modules · ~{totalMin} min
              </p>
              <p className="mt-2 text-xs font-semibold text-[var(--ep-navy)]">{profile?.weeklyExpectation}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export function TrainingRolePanel({ slug }: { slug: string }) {
  const bundle = getRoleOnboardingBundle(slug);
  if (!bundle) {
    return (
      <p className="text-sm">
        Training not found.{" "}
        <Link href={academyTrainingHref()} className="underline">
          Back to training
        </Link>
      </p>
    );
  }

  const { position, profile } = bundle;

  return (
    <section>
      <Link href={academyTrainingHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
        ← Training hub
      </Link>
      <div className="mt-2">
        <p className="text-xs font-bold uppercase text-[var(--ep-gold)]">Training packet</p>
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{position.title}</h1>
      </div>

      <div className="my-6 ep-card">
        <h2 className="font-heading font-bold">Expectation sheet</h2>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="font-semibold">Time</dt>
            <dd className="text-[var(--ep-navy-muted)]">{profile.expectationSheet.time}</dd>
          </div>
          <div>
            <dt className="font-semibold">Monthly targets</dt>
            <dd className="text-[var(--ep-navy-muted)]">{profile.expectationSheet.monthly}</dd>
          </div>
          <div>
            <dt className="font-semibold">Reporting</dt>
            <dd className="text-[var(--ep-navy-muted)]">{profile.expectationSheet.reporting}</dd>
          </div>
        </dl>
      </div>

      <div className="mb-6 ep-card">
        <h2 className="font-heading font-bold">Training modules</h2>
        <ul className="mt-3 space-y-3">
          {profile.trainingModules.map((mod, i) => (
            <li key={mod.id} className="flex gap-3 rounded-lg border border-[var(--ep-border)] p-3 text-sm">
              <span className="font-bold text-[var(--ep-navy-muted)]">{i + 1}.</span>
              <div>
                <p className="font-medium">{mod.title}</p>
                <p className="text-xs text-[var(--ep-navy-muted)]">
                  {mod.durationMinutes} min · {mod.type}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="ep-card">
        <h2 className="font-heading font-bold">First week tasks</h2>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--ep-navy-muted)]">
          {profile.firstWeekTasks.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={academyHowItHelpsHref(slug)} className="rounded-md bg-[var(--ep-navy)] px-3 py-2 text-xs font-bold text-white">
          How this role helps Kelly win →
        </Link>
        <Link href={volunteerPositionHref(slug)} className="rounded-md border px-3 py-2 text-xs font-semibold">
          Full role description →
        </Link>
      </div>
    </section>
  );
}

export function HowItHelpsPanel({ slug }: { slug: string }) {
  const bundle = getRoleOnboardingBundle(slug);
  if (!bundle) return null;
  const { position, profile } = bundle;

  return (
    <section>
      <Link href={volunteerPositionHref(slug)} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:underline">
        ← {position.title}
      </Link>
      <div className="mt-4 ep-card border-2 border-[var(--ep-gold)] bg-gradient-to-br from-amber-50 to-white p-8">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">How this role helps Kelly win Arkansas</p>
        <h1 className="mt-2 font-heading text-2xl font-bold text-[var(--ep-navy)]">{position.title}</h1>
        <p className="mt-6 text-lg leading-relaxed text-[var(--ep-navy)]">{position.connectionToPlan}</p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="ep-card">
          <h2 className="font-heading text-sm font-bold">Your first action</h2>
          <p className="mt-2 text-sm">{profile.firstAction}</p>
        </div>
        <div className="ep-card">
          <h2 className="font-heading text-sm font-bold">Weekly expectation</h2>
          <p className="mt-2 text-sm">{profile.weeklyExpectation}</p>
        </div>
      </div>

      <div className="mt-6">
        <Link href={academyTrainingRoleHref(slug)} className="font-semibold text-[var(--ep-navy)] hover:underline">
          Open training packet →
        </Link>
      </div>
    </section>
  );
}

export function OnboardingStatusDashboardPanel() {
  const rollup = getOnboardingRollup();
  const onboarding = getVolunteerOnboarding();

  return (
    <div className="mb-8 ep-card border-2 border-[var(--ep-navy)]">
      <p className="text-xs font-bold uppercase text-[var(--ep-navy-muted)]">Phase 18.7C · Onboarding status</p>
      <div className="mt-2 flex flex-wrap gap-6">
        <div>
          <div className="text-2xl font-bold tabular-nums">{rollup.filled}/{rollup.foundingLeaderGoal}</div>
          <div className="text-xs text-[var(--ep-navy-muted)]">Founding leaders</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums text-red-700">{rollup.open}</div>
          <div className="text-xs text-[var(--ep-navy-muted)]">Slots open</div>
        </div>
        <div>
          <div className="text-2xl font-bold tabular-nums">{onboarding.launchDate}</div>
          <div className="text-xs text-[var(--ep-navy-muted)]">June 28 launch</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={academyOnboardingHref()} className="rounded-full bg-[var(--ep-navy)] px-3 py-1 text-xs font-semibold text-white">
          Onboarding flow →
        </Link>
        <Link href={academyAssignmentsHref()} className="rounded-full border px-3 py-1 text-xs font-semibold">
          Assignments →
        </Link>
      </div>
    </div>
  );
}
