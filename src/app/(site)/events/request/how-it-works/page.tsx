import type { Metadata } from "next";
import Link from "next/link";
import { EventPathwayPage } from "@/components/events/EventPathwayPage";
import { Button } from "@/components/ui/Button";
import { inviteKellyContent } from "@/content/events/invite-kelly";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { getContactMailto } from "@/config/external-campaign";

const { meta, layerTwo: L2, layerThree: L3 } = inviteKellyContent;

export const metadata: Metadata = pageMeta({
  title: "How inviting Kelly works",
  description:
    "How to invite Kelly Grappe to your community—process, ground rules, formats you can host, and how to start a request.",
  path: meta.layerTwo.path,
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default function InviteKellyHowItWorksPage() {
  const mailto = getContactMailto();

  return (
    <EventPathwayPage layer={2} eyebrow={L2.eyebrow} title={L2.title} subtitle={L2.subtitle}>
      <div className="space-y-10 font-body text-kelly-text/88">
        {L2.introParagraphs.map((p) => (
          <p key={p.slice(0, 40)} className="text-base leading-relaxed md:text-[1.05rem]">
            {p}
          </p>
        ))}
        <ol className="list-none space-y-6 p-0">
          {L2.steps.map((step, i) => (
            <li
              key={step.title}
              className="rounded-card border border-kelly-text/10 bg-white/95 p-5 shadow-sm sm:p-6 md:p-7"
            >
              <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-gold/90">Step {i + 1}</p>
              <h2 className="mt-2 font-heading text-lg font-bold text-kelly-ink md:text-xl">{step.title}</h2>
              <p className="mt-3 text-base leading-relaxed text-kelly-text/85 md:text-[1.02rem]">{step.body}</p>
            </li>
          ))}
        </ol>

        <section id="what-you-can-host" aria-labelledby="invite-host-formats" className="scroll-mt-24 border-t border-kelly-text/10 pt-10">
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-kelly-gold/90">What you can host</p>
          <h2 id="invite-host-formats" className="mt-3 font-heading text-2xl font-bold text-kelly-ink md:text-3xl">
            {L3.title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-kelly-text/85 md:text-[1.05rem]">{L3.subtitle}</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {L3.hostCards.map((card) => (
              <article
                key={card.title}
                className="flex h-full flex-col rounded-card border border-kelly-text/10 bg-white/95 p-5 shadow-sm sm:p-6 md:min-h-[9rem]"
              >
                <h3 className="font-heading text-lg font-bold text-kelly-ink md:text-xl">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-kelly-text/85 md:text-base">{card.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 text-base leading-relaxed text-kelly-text/90 md:text-[1.05rem]">{L3.closing}</p>
        </section>

        <div
          id="start-request"
          className="rounded-card border border-dashed border-kelly-text/25 bg-gradient-to-br from-kelly-wash/70 to-white px-6 py-8 text-center shadow-sm md:px-10 md:py-10"
        >
          <p className="font-heading text-lg font-bold text-kelly-ink md:text-xl">{L3.formPlaceholderTitle}</p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-kelly-slate md:text-base">{L3.formPlaceholderBody}</p>
          <p className="mt-4 font-body text-xs text-kelly-text/60">
            Uses the campaign&apos;s public contact address from site configuration until the hosted request form is live.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button href={mailto} variant="primary" className="min-h-[52px] w-full min-w-[14rem] sm:w-auto">
              {L3.primaryCtaLabel}
            </Button>
          </div>
          <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
            {L3.secondaryLinks.map((l) => (
              <Button
                key={l.href}
                href={l.href}
                variant="outline"
                className="min-h-[48px] w-full min-w-[12rem] sm:w-auto"
              >
                {l.label}
              </Button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-kelly-text/55">
          <Link href="/events/request" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
            Back to why we invite
          </Link>
        </p>
      </div>
    </EventPathwayPage>
  );
}
