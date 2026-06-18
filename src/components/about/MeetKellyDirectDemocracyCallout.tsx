import Link from "next/link";
import {
  ballotInitiativeProcessHref,
  directDemocracyCommitmentHref,
  directDemocracyHubHref,
  kellyInitiativesChapterHref,
} from "@/config/direct-democracy-links";

export function MeetKellyDirectDemocracyCallout() {
  return (
    <section
      aria-labelledby="meet-kelly-dd-heading"
      className="rounded-card border-2 border-kelly-gold/40 bg-gradient-to-br from-kelly-gold/[0.12] to-white p-6 shadow-[var(--shadow-soft)] md:p-8"
    >
      <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-kelly-gold">Campaign center pillar</p>
      <h2 id="meet-kelly-dd-heading" className="mt-2 font-heading text-2xl font-bold text-kelly-navy md:text-3xl">
        Direct democracy &amp; the ballot initiative process
      </h2>
      <p className="mt-4 max-w-3xl font-body text-base leading-relaxed text-kelly-text/85">
        Kelly entered this race not only to administer elections fairly—but to defend Arkansans&apos; path to put
        measures on the ballot, run referenda when power overreaches, and keep signature gathering in volunteers&apos;
        hands. Stand Up Arkansas, LEARNS petition work, and the commitment network are part of the same story.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href={directDemocracyHubHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-kelly-blue"
        >
          Direct democracy hub
        </Link>
        <Link
          href={ballotInitiativeProcessHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-btn border-2 border-kelly-navy/20 bg-white px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-kelly-navy hover:border-kelly-gold/50"
        >
          How initiatives reach the ballot
        </Link>
        <Link
          href={kellyInitiativesChapterHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-btn border-2 border-kelly-navy/15 px-5 py-2.5 text-sm font-semibold text-kelly-navy hover:border-kelly-gold/40"
        >
          Kelly&apos;s petition organizing story
        </Link>
        <Link
          href={directDemocracyCommitmentHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-btn border-2 border-kelly-gold/45 bg-kelly-gold/10 px-5 py-2.5 text-sm font-semibold text-kelly-navy hover:bg-kelly-gold/20"
        >
          Join the commitment network
        </Link>
      </div>
    </section>
  );
}
