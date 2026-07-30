import {
  MEET_KELLY_TRUST_INDICATORS,
} from "@/content/about/meet-kelly-trust-indicators";

const kindLabel: Record<(typeof MEET_KELLY_TRUST_INDICATORS)[number]["kind"], string> = {
  profile: "Profile",
  organization: "Organization",
  media: "Media",
  civic: "Civic",
};

export function MeetKellyTrustIndicators() {
  return (
    <section id="trust-indicators" aria-labelledby="trust-indicators-heading" className="scroll-mt-24">
      <h2
        id="trust-indicators-heading"
        className="font-heading text-2xl font-bold text-kelly-text md:text-3xl"
      >
        Trust indicators you can verify
      </h2>
      <p className="mt-3 max-w-2xl font-body text-base leading-relaxed text-kelly-text/78">
        Real credentials—not testimonials, not endorsements, not invented stats. Each item links to a public source.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {MEET_KELLY_TRUST_INDICATORS.map((item) => (
          <li
            key={item.href}
            className="rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-5 shadow-[var(--shadow-soft)]"
          >
            <p className="font-body text-xs font-bold uppercase tracking-wide text-kelly-muted">
              {kindLabel[item.kind]}
            </p>
            <h3 className="mt-1 font-heading text-lg font-bold text-kelly-text">{item.label}</h3>
            <p className="mt-2 font-body text-sm leading-relaxed text-kelly-text/80">{item.detail}</p>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block font-body text-sm font-semibold text-kelly-navy underline decoration-kelly-navy/30 underline-offset-2 hover:decoration-kelly-navy"
            >
              View source →
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
