import Link from "next/link";
import {
  CLARK_CHURCH_TOUR_STEPS,
  CLARK_CHURCH_TOUR_STOPS,
  churchDirectionsUrl,
  churchMapsEmbedUrl,
  type ChurchTourStop,
} from "@/content/events/clark-church-tour-2026";

function ChurchCard({ stop }: { stop: ChurchTourStop }) {
  const maps = churchMapsEmbedUrl(stop.address);
  const dir = churchDirectionsUrl(stop.address);
  return (
    <article className="overflow-hidden rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] shadow-[var(--shadow-soft)]">
      <div className="aspect-[16/9] bg-kelly-text/5">
        <iframe
          title={`Map of ${stop.name}`}
          src={maps}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="space-y-3 p-5 md:p-6">
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">{stop.city}</p>
        <h3 className="font-heading text-xl font-bold text-kelly-text">{stop.name}</h3>
        <p className="font-body text-sm text-kelly-text/80">
          <a className="font-semibold text-kelly-navy underline-offset-4 hover:underline" href={dir}>
            {stop.address}
          </a>
        </p>
        {stop.pastor ? (
          <p className="font-body text-sm text-kelly-text/85">
            <strong>Pastor:</strong> {stop.pastor}
          </p>
        ) : null}
        {stop.pastorNote ? <p className="font-body text-sm text-kelly-text/70">{stop.pastorNote}</p> : null}
        {stop.phone ? <p className="font-body text-sm text-kelly-text/80">{stop.phone}</p> : null}
        {stop.serviceHint ? <p className="font-body text-sm font-semibold text-kelly-text/85">{stop.serviceHint}</p> : null}
        <p className="font-body text-sm leading-relaxed text-kelly-text/80">{stop.history}</p>
        <p className="font-body text-sm leading-relaxed text-kelly-text/80">{stop.community}</p>
        <p className="font-body text-xs text-kelly-text/55">
          Source:{" "}
          <a className="underline-offset-2 hover:underline" href={stop.sourceHref} target="_blank" rel="noopener noreferrer">
            {stop.sourceLabel}
          </a>
        </p>
        <a
          className="inline-flex font-body text-sm font-bold text-kelly-navy underline-offset-4 hover:underline"
          href={dir}
        >
          Directions on your phone →
        </a>
      </div>
    </article>
  );
}

export function ClarkChurchTourBrief() {
  const gurdon = CLARK_CHURCH_TOUR_STOPS.filter((s) => s.city === "Gurdon");
  const ark = CLARK_CHURCH_TOUR_STOPS.filter((s) => s.city === "Arkadelphia");
  return (
    <div className="mt-14 space-y-12">
      <section>
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Sunday run of show</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Step by step — September 20</h2>
        <p className="mt-3 max-w-3xl font-body text-base leading-relaxed text-kelly-text/80">
          Clark County first. De Queen second. Leave Arkadelphia no later than 1:30 p.m. The churches below are the
          Sunday map for Gurdon and Arkadelphia — confirm which door the host opens before you walk in.
        </p>
        <ol className="mt-6 space-y-3">
          {CLARK_CHURCH_TOUR_STEPS.map((step, i) => (
            <li
              key={step.time}
              className="rounded-lg border border-kelly-text/10 bg-kelly-text/[0.03] px-4 py-3 font-body text-kelly-text/85"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-kelly-navy">
                {i + 1}. {step.time}
              </p>
              <p className="mt-1 font-heading text-lg font-bold">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed">{step.detail}</p>
            </li>
          ))}
        </ol>
        <p className="mt-4 rounded-lg border-2 border-yellow-400 bg-yellow-50/70 px-4 py-3 font-body text-sm font-semibold text-yellow-950">
          Hard leave: 1:30 p.m. from Arkadelphia. Next public stop is{" "}
          <Link className="underline underline-offset-2" href="/events/dequeen-sep-20-2026">
            De Queen, 4:00–6:00 p.m.
          </Link>
          , Downtown Pavilion, 124 W. DeQueen Avenue.
        </p>
      </section>

      <section>
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Gurdon</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-text">Morning churches</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {gurdon.map((stop) => (
            <ChurchCard key={stop.id} stop={stop} />
          ))}
        </div>
      </section>

      <section>
        <p className="font-body text-xs font-bold uppercase tracking-wider text-kelly-navy">Arkadelphia</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-kelly-text">County-seat churches</h2>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {ark.map((stop) => (
            <ChurchCard key={stop.id} stop={stop} />
          ))}
        </div>
      </section>
    </div>
  );
}
