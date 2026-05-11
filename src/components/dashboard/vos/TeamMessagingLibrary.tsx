import Link from "next/link";

import { CopyTextButton } from "@/components/volunteer/CopyTextButton";

const APPROVED_PHRASES = [
  "Build the next team — don’t wait to be managed.",
  "Place people where they fit — more teams, not bigger teams.",
  "Train as you grow; shadow the first downstream huddle.",
  "Small actions, statewide impact.",
  "Get GOTV ready — escalate questions, not routine weekly work.",
  "I’m volunteering because I want trustworthy leadership and neighbors who show up for each other.",
  "If you’re curious, you can read more at the volunteer page — no pressure, happy to answer what I can.",
  "We’re building small teams of three coordinators so the work stays local and relational.",
];

const CAPTION_EXAMPLES = [
  "Showed up for [local event] today — grateful for everyone working to make our community stronger. Learn about volunteering: [link]",
  "Neighbor-led teams > endless feeds. If you’ve ever thought about helping out, start here: /volunteer",
];

const DOS = [
  "Stay factual, kind, and local.",
  "Point to campaign-approved links for depth.",
  "Credit volunteers and community partners honestly.",
];

const DONTS = [
  "No unsourced opponent attacks.",
  "Don’t share private details about voters or volunteers.",
  "Don’t promise perks or jobs that aren’t real.",
];

const WEEKLY_MESSAGE_MOCK =
  "Week of May 11: lift neighbor stories, steer turnout questions to relational follow-up, and route new energy to /volunteer or downstream teams once someone’s P5 list is full. HQ will drop priority captions in this library soon.";

export function TeamMessagingLibrary({ teamSlug }: { teamSlug: string }) {
  return (
    <div className="space-y-8" id="messaging-library">
      <section className="rounded-2xl border border-kelly-navy/20 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-navy/55">Messaging library</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-kelly-navy">Campaign-approved language · copy friendly</h2>
        <p className="mt-3 font-body text-sm text-kelly-text/80">
          Use this as your triad’s quick reference. Full email templates and longer prompts live in the{" "}
          <Link className="font-semibold text-kelly-blue underline" href="/volunteer/resources/messaging">
            volunteer Messaging & Talking Points library
          </Link>
          .
        </p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">What Kelly stands for</h3>
        <p className="mt-3 font-body text-sm text-kelly-text/85">
          Trusted public service, transparent elections, and practical help for Oklahoma families — Meet the detailed policy
          framing in the field playbook; keep volunteer posts values-first and verifiable.
        </p>
        <div className="mt-4">
          <Link className="text-sm font-semibold text-kelly-blue underline" href="/field-playbook">
            Field playbook · policy & story (approved source)
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Current talking points (seed)</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 font-body text-sm text-kelly-text/85">
          <li>Election integrity: defend access and accurate counts without fear-mongering.</li>
          <li>Voter registration: frame as neighbor care — offer help, not lectures.</li>
          <li>Volunteer model: three-person triads + Power of 5 relational turnout.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-page/80 p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Pillars & invitations (full copy)</h3>
        <p className="mt-2 font-body text-sm text-kelly-text/80">
          Secure elections, local control, service, volunteer invites, Power of 5 invites, captions, and FAQ — each block is
          copy-ready on the hub.
        </p>
        <ul className="mt-4 flex flex-col gap-2 font-body text-sm font-semibold text-kelly-blue">
          <li>
            <Link className="underline hover:text-kelly-navy" href="/volunteer/resources/messaging#secure-elections">
              Secure elections
            </Link>
          </li>
          <li>
            <Link className="underline hover:text-kelly-navy" href="/volunteer/resources/messaging#local-control">
              Local control
            </Link>
          </li>
          <li>
            <Link className="underline hover:text-kelly-navy" href="/volunteer/resources/messaging#service-accountability">
              Service and accountability
            </Link>
          </li>
          <li>
            <Link className="underline hover:text-kelly-navy" href="/volunteer/resources/messaging#p5-invite">
              Power of 5 invitation
            </Link>
          </li>
          <li>
            <Link className="underline hover:text-kelly-navy" href="/volunteer/resources/messaging#captions">
              Social caption examples
            </Link>
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-kelly-fog/40 p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="font-heading text-lg font-bold text-kelly-navy">Weekly message from campaign (demo)</h3>
          <CopyTextButton text={WEEKLY_MESSAGE_MOCK} label="Copy weekly message" />
        </div>
        <p className="mt-3 font-body text-sm text-kelly-text/85">{WEEKLY_MESSAGE_MOCK}</p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Approved phrases</h3>
        <ul className="mt-4 space-y-3">
          {APPROVED_PHRASES.map((p, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-kelly-text/10 bg-kelly-page/80 px-3 py-2 font-body text-sm text-kelly-text/85">
              <span>{p}</span>
              <CopyTextButton text={p} label="Copy" />
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Social caption examples</h3>
        <ul className="mt-4 space-y-3">
          {CAPTION_EXAMPLES.map((p, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-kelly-text/10 bg-kelly-page/80 px-3 py-2 font-body text-sm text-kelly-text/85">
              <span>{p}</span>
              <CopyTextButton text={p} label="Copy" />
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-kelly-success/30 bg-kelly-success/[0.08] p-6">
          <h3 className="font-heading text-base font-bold text-kelly-navy">Do</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 font-body text-sm text-kelly-text/85">
            {DOS.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-kelly-text/20 bg-kelly-text/[0.04] p-6">
          <h3 className="font-heading text-base font-bold text-kelly-navy">Don’t</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 font-body text-sm text-kelly-text/85">
            {DONTS.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      </section>

      <p className="font-body text-xs text-kelly-text/60">
        Triad workspace:{" "}
        <Link href={`/dashboard/team/${teamSlug}/power-of-5`} className="font-semibold text-kelly-blue underline">
          Power of 5 / VR tab
        </Link>{" "}
        for downstream placement + copy-ready emails.
      </p>
    </div>
  );
}
