import type { Metadata } from "next";
import { EventPathwayPage } from "@/components/events/EventPathwayPage";
import { inviteKellyContent } from "@/content/events/invite-kelly";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

const { meta, layerTwo: L2 } = inviteKellyContent;

export const metadata: Metadata = pageMeta({
  title: meta.layerTwo.title,
  description: meta.layerTwo.description,
  path: meta.layerTwo.path,
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default function InviteKellyHowItWorksPage() {
  return (
    <EventPathwayPage
      layer={2}
      eyebrow={L2.eyebrow}
      title={L2.title}
      subtitle={L2.subtitle}
      nextStep={L2.nextCta}
    >
      {/*
        TODO: Connect form to workflow intake when Invite Kelly form ships.
        TODO: Pending-approval calendar (internal) — approved public events only on /events.
        TODO: Approved public Google Calendar feed (read-only) — later integration.
        TODO: Email notification flow for hosts.
      */}
      <div className="space-y-8 font-body text-kelly-text/88">
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
      </div>
    </EventPathwayPage>
  );
}
