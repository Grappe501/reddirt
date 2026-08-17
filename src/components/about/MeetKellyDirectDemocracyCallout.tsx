import Link from "next/link";
import {
  ballotInitiativeProcessHref,
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
      <div className="mt-4 max-w-3xl space-y-4 font-body text-base leading-relaxed text-kelly-text/85">
        <p>
          Kelly entered this race not only to administer elections fairly—but to defend Arkansans&apos; path to put
          measures on the ballot and run referenda when power overreaches.
        </p>
        <p>
          Kelly is a fierce advocate of direct democracy in Arkansas. We are one of only 16 states that have the ability
          for citizens to change the law. This is a sacred right in our constitution and Kelly is committed to ensuring
          that the people have a voice through this process.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          href={ballotInitiativeProcessHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-btn bg-kelly-navy px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-kelly-blue"
        >
          How initiatives reach the ballot
        </Link>
        <Link
          href={kellyInitiativesChapterHref}
          className="inline-flex min-h-[44px] items-center justify-center rounded-btn border-2 border-kelly-navy/15 px-5 py-2.5 text-sm font-semibold text-kelly-navy hover:border-kelly-gold/40"
        >
          Kelly&apos;s petition organizing story
        </Link>
      </div>
    </section>
  );
}
