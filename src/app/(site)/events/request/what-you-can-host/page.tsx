import type { Metadata } from "next";
import { EventPathwayPage } from "@/components/events/EventPathwayPage";
import { Button } from "@/components/ui/Button";
import { inviteKellyContent } from "@/content/events/invite-kelly";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { getContactMailto } from "@/config/external-campaign";
import Link from "next/link";

const { meta, layerThree: L3 } = inviteKellyContent;

export const metadata: Metadata = pageMeta({
  title: meta.layerThree.title,
  description: meta.layerThree.description,
  path: meta.layerThree.path,
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default function InviteKellyWhatYouCanHostPage() {
  const mailto = getContactMailto();

  return (
    <EventPathwayPage layer={3} eyebrow={L3.eyebrow} title={L3.title} subtitle={L3.subtitle}>
      {/*
        TODO: Replace email-primary pattern with WorkflowIntake form when approved.
        {inviteKellyFutureWorkflowNotes.map...} — keep heavy lifts out of production UI; listed in /how-it-works for staff.
      */}
      <div className="space-y-10 font-body text-kelly-text/88">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {L3.hostCards.map((card) => (
            <article
              key={card.title}
              className="flex h-full flex-col rounded-card border border-kelly-text/10 bg-white/95 p-5 shadow-sm sm:p-6 md:min-h-[9rem]"
            >
              <h2 className="font-heading text-lg font-bold text-kelly-ink md:text-xl">{card.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-kelly-text/85 md:text-base">{card.body}</p>
            </article>
          ))}
        </div>

        <p className="text-base leading-relaxed text-kelly-text/90 md:text-[1.05rem]">{L3.closing}</p>

        <div
          id="start-request"
          className="rounded-card border border-dashed border-kelly-text/25 bg-gradient-to-br from-kelly-wash/70 to-white px-6 py-8 text-center shadow-sm md:px-10 md:py-10"
        >
          <p className="font-heading text-lg font-bold text-kelly-ink md:text-xl">{L3.formPlaceholderTitle}</p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-kelly-slate md:text-base">{L3.formPlaceholderBody}</p>
          <p className="mt-4 font-body text-xs text-kelly-text/60">
            Uses the campaign&apos;s public contact route from site config (e.g. <span className="font-mono text-[11px]">NEXT_PUBLIC_CONTACT_EMAIL</span>).
            {/* TODO: wire real workflow form; keep mailto as secondary once form exists */}
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
