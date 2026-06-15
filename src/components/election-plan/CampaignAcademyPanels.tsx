import Link from "next/link";

import {
  getVolunteerAcademy,
  getVolunteerPosition,
  volunteerAcademyHref,
  volunteerPositionHref,
} from "@/lib/election-plan/load-volunteer-academy";
import { responsibilityMatrixHref } from "@/lib/election-plan/load-phase-18-7b-ownership";

export function CampaignAcademyHubPanel() {
  const academy = getVolunteerAcademy();

  return (
    <section>
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--ep-gold)]">Campaign Academy</p>
      <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{academy.title}</h1>
      <p className="mt-1 text-sm text-[var(--ep-navy-muted)]">{academy.subtitle}</p>
      <p className="mt-3 text-sm italic text-[var(--ep-navy-muted)]">{academy.doctrine}</p>

      <div className="my-6 ep-card">
        <h2 className="font-heading text-sm font-bold text-[var(--ep-navy)]">June 28 launch onboarding</h2>
        <ol className="mt-3 flex flex-wrap gap-2">
          {academy.onboardingFlow.map((step, i) => (
            <li key={step} className="flex items-center gap-2 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ep-navy)] text-xs font-bold text-white">
                {i + 1}
              </span>
              <span>{step}</span>
              {i < academy.onboardingFlow.length - 1 ? <span className="text-[var(--ep-navy-muted)]">→</span> : null}
            </li>
          ))}
        </ol>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from(new Set(academy.positions.map((p) => p.category))).map((cat) => (
          <span key={cat} className="rounded-full border border-[var(--ep-border)] px-2 py-0.5 text-xs font-semibold">
            {cat}
          </span>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {academy.positions.map((pos) => (
          <Link
            key={pos.slug}
            href={volunteerPositionHref(pos.slug)}
            className="ep-card block transition hover:ring-2 hover:ring-[var(--ep-gold-soft)]"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-heading font-bold text-[var(--ep-navy)]">{pos.title}</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-700">
                {pos.category}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{pos.purpose}</p>
            <p className="mt-2 text-xs font-semibold text-[var(--ep-navy)]">{pos.timeCommitment}</p>
          </Link>
        ))}
      </div>

      <p className="mt-6 text-sm text-[var(--ep-navy-muted)]">
        Staff assignments:{" "}
        <Link href={responsibilityMatrixHref()} className="font-semibold text-[var(--ep-navy)] hover:underline">
          Campaign responsibility matrix →
        </Link>
      </p>
    </section>
  );
}

export function CampaignAcademyPositionPanel({ slug }: { slug: string }) {
  const position = getVolunteerPosition(slug);
  if (!position) {
    return (
      <p className="text-sm text-[var(--ep-navy-muted)]">
        Role not found.{" "}
        <Link href={volunteerAcademyHref()} className="underline">
          Back to academy
        </Link>
      </p>
    );
  }

  return (
    <section>
      <Link href={volunteerAcademyHref()} className="text-xs font-semibold text-[var(--ep-navy-muted)] hover:text-[var(--ep-navy)]">
        ← Campaign Academy
      </Link>
      <div className="mt-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--ep-gold)]">{position.category}</p>
        <h1 className="font-heading text-2xl font-bold text-[var(--ep-navy)]">{position.title}</h1>
        <p className="mt-1 text-sm font-semibold text-[var(--ep-navy-muted)]">{position.timeCommitment}</p>
      </div>

      <div className="my-6 ep-card border-l-4 border-[var(--ep-gold)]">
        <h2 className="font-heading text-sm font-bold text-[var(--ep-navy)]">Purpose</h2>
        <p className="mt-2 text-sm">{position.purpose}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Responsibilities" items={position.responsibilities} />
        <Section title="Weekly tasks" items={position.weeklyTasks} />
        <Section title="Success metrics" items={position.successMetrics} ordered />
        <Section title="Training" items={position.training} />
        <Section title="Scripts" items={position.scripts} />
        <div className="ep-card">
          <h2 className="font-heading font-bold text-[var(--ep-navy)]">Reporting</h2>
          <p className="mt-2 text-sm text-[var(--ep-navy-muted)]">{position.reporting}</p>
        </div>
      </div>

      <div className="mt-6 ep-card bg-gradient-to-br from-amber-50 to-white">
        <h2 className="font-heading font-bold text-[var(--ep-navy)]">How does my small piece help win Arkansas?</h2>
        <p className="mt-2 text-sm leading-relaxed">{position.connectionToPlan}</p>
      </div>

      {position.resources.length > 0 ? (
        <div className="mt-6 ep-card">
          <h2 className="font-heading font-bold text-[var(--ep-navy)]">Resources</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {position.resources.map((href) => (
              <li key={href}>
                <Link href={href} className="font-semibold text-[var(--ep-navy)] hover:underline">
                  {href.replace("/election-plan", "Election Plan")} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-8 rounded-xl border-2 border-[var(--ep-navy)] bg-[var(--ep-navy)] p-6 text-white">
        <h2 className="font-heading font-bold">Ready to take this role?</h2>
        <p className="mt-2 text-sm text-white/80">
          June 28 volunteer launch — choose this role at onboarding, complete training, get assigned by your county or
          regional lead, begin weekly tasks.
        </p>
        <p className="mt-4 text-sm font-semibold">Next step: tell your county captain or email campaign ops with this role title.</p>
      </div>
    </section>
  );
}

function Section({ title, items, ordered }: { title: string; items: string[]; ordered?: boolean }) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <div className="ep-card">
      <h2 className="font-heading font-bold text-[var(--ep-navy)]">{title}</h2>
      <Tag className={`mt-3 space-y-1 text-sm text-[var(--ep-navy-muted)] ${ordered ? "list-decimal pl-5" : "list-disc pl-5"}`}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </Tag>
    </div>
  );
}
