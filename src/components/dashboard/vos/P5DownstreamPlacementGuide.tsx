import Link from "next/link";

const DECISIONS: { title: string; letter: string; body: string }[] = [
  {
    letter: "A",
    title: "Add to an existing P5 network",
    body: "The person is in a member’s natural relationship circle and that member still has room or is building toward five contacts — keep them relational, not as a bulk dump.",
  },
  {
    letter: "B",
    title: "Place downstream",
    body: "The sourcing member’s Power of 5 is already complete, the person fits another geography, or an open lane exists on a downstream triad — route through a private fit check with that team’s lead first.",
  },
  {
    letter: "C",
    title: "Invite to volunteer onboarding",
    body: "They want the full /volunteer experience and a formal triad lane — send the public onboarding flow, not a silent add to someone’s P5 list.",
  },
  {
    letter: "D",
    title: "Invite to a monthly outreach event",
    body: "Interest without readiness to volunteer — community outreach social hour helps them meet the field family without pressure.",
  },
  {
    letter: "E",
    title: "Invite to a voter registration event",
    body: "They need registration help or can bring others to a focused VR push — pair with the P5/VR coordinator’s monthly cadence.",
  },
];

const STEPS: string[] = [
  "Identify where the person belongs geographically (home, work, civic life).",
  "Scan downstream teams for open role, geographic overlap, relationship tie, and real capacity.",
  "Contact the downstream team lead privately — use the email template; do not broadcast declines.",
  "Confirm fit (and dignity for the person) before they receive any join link.",
  "Collect the correct invite link or QR code from the downstream lead once they approve.",
  "Send the person only after approval — use the “new person” email template with that exact link/QR.",
  "Update the queue: pending fit check → invite sent → placed (or deferred if timing is wrong).",
];

export function P5DownstreamPlacementGuide() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-kelly-gold/35 bg-kelly-gold/[0.07] p-6 md:p-8">
        <p className="font-body text-[10px] font-bold uppercase tracking-[0.22em] text-kelly-deep/70">Core rule</p>
        <h3 className="mt-2 font-heading text-lg font-bold text-kelly-navy">Move people downstream — do not overload a finished P5</h3>
        <p className="mt-3 font-body text-sm text-kelly-text/85">
          If someone already has a complete Power of 5, the job shifts from “add another name” to{" "}
          <span className="font-semibold text-kelly-deep">placing new relationships where they help most</span> — often a
          downstream team or a community event — always with a respectful fit check first.
        </p>
      </section>

      <section className="rounded-2xl border border-kelly-text/10 bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">When to route how</h3>
        <ul className="mt-4 space-y-4">
          {DECISIONS.map((d) => (
            <li key={d.letter} className="rounded-xl border border-kelly-text/10 bg-kelly-page/80 px-4 py-3">
              <p className="font-body text-[10px] font-bold uppercase text-kelly-text/50">{d.letter}</p>
              <p className="font-heading text-sm font-bold text-kelly-deep">{d.title}</p>
              <p className="mt-2 font-body text-sm text-kelly-text/85">{d.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-kelly-navy/15 bg-kelly-navy/[0.03] p-6 md:p-8">
        <h3 className="font-heading text-lg font-bold text-kelly-navy">Guided placement flow (downstream)</h3>
        <ol className="mt-4 list-decimal space-y-3 pl-6 font-body text-sm text-kelly-text/85">
          {STEPS.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        <p className="mt-6 font-body text-xs text-kelly-text/65">
          Templates for steps 3 and 6 live in the{" "}
          <Link href="/volunteer/resources/email-templates" className="font-semibold text-kelly-blue underline">
            volunteer resource library · Email templates
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
