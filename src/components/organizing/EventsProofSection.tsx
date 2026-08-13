import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PublicMediaSlotFrame } from "@/components/media/PublicMediaSlotFrame";
import type { CountyVisitLedger } from "@/lib/events/county-visit-ledger";

export async function EventsProofSection({ ledger }: { ledger: CountyVisitLedger }) {
  const n = ledger.visited.length;

  return (
    <section aria-labelledby="events-proof-heading" className="space-y-8">
      <div>
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Proof</p>
        <h2 id="events-proof-heading" className="mt-1 font-heading text-2xl font-bold text-kelly-text md:text-3xl">
          Showing up matters.
        </h2>
        <p className="mt-2 max-w-2xl font-body text-kelly-text/75">
          Kelly has traveled Arkansas listening to the people who actually live here.
        </p>
      </div>

      <figure className="overflow-hidden rounded-2xl border border-kelly-text/10 shadow-[var(--shadow-soft)]">
        <PublicMediaSlotFrame
          slotKey="events.been.graphic"
          className="min-h-[16rem] w-full"
          sizes="(min-width: 1024px) 960px, 100vw"
        />
        <figcaption className="border-t border-kelly-text/10 bg-kelly-text/[0.03] px-4 py-3 font-body text-xs text-kelly-text/65">
          Regnat Populus brand art. The county count below is computed from the campaign visit ledger — not from this
          image.
        </figcaption>
      </figure>

      <div className="rounded-card border border-kelly-navy/15 bg-kelly-navy/[0.04] px-5 py-6">
        <p className="font-heading text-4xl font-bold text-kelly-navy md:text-5xl">
          {n} of {ledger.totalCounties}
        </p>
        <p className="mt-2 font-body text-sm font-semibold text-kelly-text">Arkansas counties visited</p>
        <p className="mt-1 font-body text-sm text-kelly-text/70">
          A county counts after an in-person Kelly appearance has ended (Central Time). Travel, volunteer-only work,
          overnight legs, virtual stops, and tentative dates do not count.
        </p>
      </div>

      <div>
        <h3 className="font-heading text-lg font-bold text-kelly-text">Counties visited</h3>
        <ul className="mt-4 columns-2 gap-x-8 sm:columns-3 md:columns-4" aria-label="Visited Arkansas counties">
          {ledger.visited.map((row) => (
            <li key={row.countyName} className="break-inside-avoid py-1 font-body text-sm text-kelly-text">
              {row.countyName}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button href="/events/request" variant="primary">
          Invite Kelly
        </Button>
        <Link href="/arkansas-visits" className="font-body text-sm font-semibold text-kelly-navy underline-offset-4 hover:underline">
          Full county trail →
        </Link>
      </div>
    </section>
  );
}
