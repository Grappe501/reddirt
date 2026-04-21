import Link from "next/link";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { PROOF_SECTION } from "@/content/home/homepagePremium";
import { FadeInWhenVisible } from "@/components/home/FadeInWhenVisible";

export function HomeProofSection() {
  return (
    <section
      className="relative overflow-hidden bg-civic-midnight py-section-y text-civic-mist lg:py-section-y-lg"
      aria-labelledby="proof-heading"
    >
      <div className="pointer-events-none absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-civic-gold/[0.06] blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-civic-blue/40 blur-3xl" aria-hidden />
      <ContentContainer className="relative">
        <FadeInWhenVisible className="max-w-3xl">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.24em] text-civic-gold">{PROOF_SECTION.eyebrow}</p>
          <h2 id="proof-heading" className="mt-4 font-heading text-[clamp(1.85rem,4vw,2.85rem)] font-bold tracking-tight text-civic-mist">
            {PROOF_SECTION.title}
          </h2>
          <p className="mt-5 font-body text-lg leading-relaxed text-civic-mist/78 md:text-xl">{PROOF_SECTION.intro}</p>
        </FadeInWhenVisible>
        <div className="mt-14 grid grid-cols-1 gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-8">
          {PROOF_SECTION.blocks.map((b, i) => (
            <FadeInWhenVisible key={b.title} delay={0.08 * i}>
              <div className="flex h-full flex-col overflow-hidden rounded-card border border-civic-gold/15 bg-civic-deep/80 shadow-xl shadow-black/20">
                {/* MEDIA: dashboard screenshot, workflow diagram, field photo, or rally still */}
                <div className="relative flex min-h-[160px] items-center justify-center bg-gradient-to-br from-civic-blue/50 to-civic-midnight px-4 py-10 md:min-h-[180px]">
                  <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a227' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
                  <span className="relative font-body text-xs font-semibold uppercase tracking-[0.2em] text-civic-gold/80">
                    Visual asset · CMS
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6 md:p-8">
                  <h3 className="font-heading text-xl font-bold text-civic-mist">{b.title}</h3>
                  <p className="mt-3 flex-1 font-body text-base leading-relaxed text-civic-mist/75">{b.body}</p>
                </div>
              </div>
            </FadeInWhenVisible>
          ))}
        </div>
        <FadeInWhenVisible className="mt-14 lg:mt-16">
          <Link
            href={PROOF_SECTION.ctaHref}
            className="inline-flex min-h-[48px] items-center justify-center rounded-btn bg-civic-gold px-8 py-3.5 text-sm font-bold uppercase tracking-wider text-civic-midnight transition hover:bg-civic-gold-soft"
          >
            {PROOF_SECTION.ctaLabel}
          </Link>
        </FadeInWhenVisible>
      </ContentContainer>
    </section>
  );
}
