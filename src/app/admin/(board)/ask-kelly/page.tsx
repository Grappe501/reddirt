import Link from "next/link";
import { AskKellyReadAloudButton } from "@/components/admin/ask-kelly/AskKellyReadAloudButton";
import {
  ASK_KELLY_ONBOARDING_COMMAND_CENTER_TAGLINE,
  ASK_KELLY_ONBOARDING_FEEDBACK,
  ASK_KELLY_ONBOARDING_FIRST_CARDS_INTRO,
  ASK_KELLY_ONBOARDING_OFFLINE,
  ASK_KELLY_ONBOARDING_ROUTE_FINDER_TITLE,
  ASK_KELLY_ONBOARDING_UPDATES,
  ASK_KELLY_ONBOARDING_WELCOME,
  ASK_KELLY_ONBOARDING_WELCOME_READ_ALOUD,
  ASK_KELLY_VOICE_ASSIST_ADMIN_NOTE,
} from "@/content/ask-kelly-candidate-onboarding-copy";
import { PAGE_KEYS } from "@/lib/content/page-blocks";

const heroExampleHref = `/admin/pages/${PAGE_KEYS[0]}`;
const heroExampleLabel = PAGE_KEYS[0].replace(/-/g, " ");

export default function AskKellyCandidateOnboardingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <header className="space-y-4">
        <p className="font-body text-sm font-medium uppercase tracking-wide text-kelly-navy/90">
          {ASK_KELLY_ONBOARDING_COMMAND_CENTER_TAGLINE}
        </p>
        <h1 className="font-heading text-3xl font-bold text-kelly-text">{ASK_KELLY_ONBOARDING_WELCOME.title}</h1>
        {ASK_KELLY_ONBOARDING_WELCOME.body.map((p) => (
          <p key={p} className="font-body text-base leading-relaxed text-kelly-text/85">
            {p}
          </p>
        ))}
        <AskKellyReadAloudButton text={ASK_KELLY_ONBOARDING_WELCOME_READ_ALOUD} />
        <p className="font-body text-xs text-kelly-text/65">{ASK_KELLY_VOICE_ASSIST_ADMIN_NOTE}</p>
      </header>

      <section aria-labelledby="first-things-heading" className="space-y-4">
        <h2 id="first-things-heading" className="font-heading text-xl font-bold text-kelly-navy">
          First things to learn
        </h2>
        <p className="font-body text-sm text-kelly-text/80">{ASK_KELLY_ONBOARDING_FIRST_CARDS_INTRO}</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          <li>
            <Link
              href="/admin/pages"
              className="block rounded-xl border border-kelly-text/12 bg-kelly-page p-4 shadow-[var(--shadow-soft)] transition hover:border-kelly-gold/35 hover:bg-kelly-fog/40"
            >
              <span className="font-heading text-sm font-bold text-kelly-navy">Page content</span>
              <span className="mt-1 block font-body text-xs text-kelly-text/70">Pick a page, then edit the hero text with review steps.</span>
              <span className="mt-2 block font-mono text-[11px] text-kelly-text/55">/admin/pages</span>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/workbench/ask-kelly-beta"
              className="block rounded-xl border border-kelly-text/12 bg-kelly-page p-4 shadow-[var(--shadow-soft)] transition hover:border-kelly-gold/35 hover:bg-kelly-fog/40"
            >
              <span className="font-heading text-sm font-bold text-kelly-navy">Ask Kelly — beta feedback</span>
              <span className="mt-1 block font-body text-xs text-kelly-text/70">See what testers sent. Triage only—no auto-updates to the site.</span>
              <span className="mt-2 block font-mono text-[11px] text-kelly-text/55">/admin/workbench/ask-kelly-beta</span>
            </Link>
          </li>
          <li>
            <Link
              href={heroExampleHref}
              className="block rounded-xl border border-kelly-text/12 bg-kelly-page p-4 shadow-[var(--shadow-soft)] transition hover:border-kelly-gold/35 hover:bg-kelly-fog/40"
            >
              <span className="font-heading text-sm font-bold text-kelly-navy">Example: one page hero editor</span>
              <span className="mt-1 block font-body text-xs text-kelly-text/70">Opens the hero editor for “{heroExampleLabel}”—same flow as other listed pages.</span>
              <span className="mt-2 block font-mono text-[11px] text-kelly-text/55">{heroExampleHref}</span>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/workbench"
              className="block rounded-xl border border-kelly-text/12 bg-kelly-page p-4 shadow-[var(--shadow-soft)] transition hover:border-kelly-gold/35 hover:bg-kelly-fog/40"
            >
              <span className="font-heading text-sm font-bold text-kelly-navy">Campaign workbench</span>
              <span className="mt-1 block font-body text-xs text-kelly-text/70">Hub for campaign-side tools and links.</span>
              <span className="mt-2 block font-mono text-[11px] text-kelly-text/55">/admin/workbench</span>
            </Link>
          </li>
          <li className="sm:col-span-2">
            <Link
              href="/admin/content"
              className="block rounded-xl border border-kelly-text/12 bg-kelly-page p-4 shadow-[var(--shadow-soft)] transition hover:border-kelly-gold/35 hover:bg-kelly-fog/40"
            >
              <span className="font-heading text-sm font-bold text-kelly-navy">Content overview</span>
              <span className="mt-1 block font-body text-xs text-kelly-text/70">Short map of where major admin areas point.</span>
              <span className="mt-2 block font-mono text-[11px] text-kelly-text/55">/admin/content</span>
            </Link>
          </li>
        </ul>
      </section>

      <section aria-labelledby="updates-heading" className="rounded-xl border border-kelly-forest/20 bg-kelly-fog/40 px-5 py-5">
        <h2 id="updates-heading" className="font-heading text-xl font-bold text-kelly-navy">
          {ASK_KELLY_ONBOARDING_UPDATES.title}
        </h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/85">{ASK_KELLY_ONBOARDING_UPDATES.intro}</p>
        <ol className="mt-4 list-decimal space-y-3 pl-5 font-body text-sm text-kelly-text/90">
          {ASK_KELLY_ONBOARDING_UPDATES.steps.map((s) => (
            <li key={s.label}>
              <span className="font-semibold text-kelly-ink">{s.label}.</span> {s.detail}
            </li>
          ))}
        </ol>
        <p className="mt-4 border-t border-kelly-text/10 pt-4 font-body text-sm text-kelly-text/80">{ASK_KELLY_ONBOARDING_UPDATES.footer}</p>
      </section>

      <section aria-labelledby="feedback-heading" className="space-y-3">
        <h2 id="feedback-heading" className="font-heading text-xl font-bold text-kelly-navy">
          {ASK_KELLY_ONBOARDING_FEEDBACK.title}
        </h2>
        <ul className="list-disc space-y-2 pl-5 font-body text-sm leading-relaxed text-kelly-text/85">
          {ASK_KELLY_ONBOARDING_FEEDBACK.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="offline-heading" className="space-y-3">
        <h2 id="offline-heading" className="font-heading text-xl font-bold text-kelly-navy">
          {ASK_KELLY_ONBOARDING_OFFLINE.title}
        </h2>
        <ul className="list-disc space-y-2 pl-5 font-body text-sm leading-relaxed text-kelly-text/85">
          {ASK_KELLY_ONBOARDING_OFFLINE.lines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="finder-heading" className="rounded-xl border border-kelly-text/12 bg-kelly-page p-5 shadow-[var(--shadow-soft)]">
        <h2 id="finder-heading" className="font-heading text-lg font-bold text-kelly-navy">
          {ASK_KELLY_ONBOARDING_ROUTE_FINDER_TITLE}
        </h2>
        <dl className="mt-4 space-y-3 font-body text-sm text-kelly-text/90">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
            <dt className="shrink-0 font-medium text-kelly-text/70">Where do I edit page copy?</dt>
            <dd>
              <Link href="/admin/pages" className="font-mono text-kelly-navy underline-offset-2 hover:underline">
                /admin/pages
              </Link>
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
            <dt className="shrink-0 font-medium text-kelly-text/70">Where do I see beta feedback?</dt>
            <dd>
              <Link href="/admin/workbench/ask-kelly-beta" className="font-mono text-kelly-navy underline-offset-2 hover:underline">
                /admin/workbench/ask-kelly-beta
              </Link>
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
            <dt className="shrink-0 font-medium text-kelly-text/70">Where do I start?</dt>
            <dd>
              <span className="font-mono text-kelly-navy">/admin/ask-kelly</span>
              <span className="ml-1 text-kelly-text/60">(this page)</span>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
