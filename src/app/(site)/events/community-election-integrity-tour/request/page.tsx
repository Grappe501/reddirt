import type { Metadata } from "next";
import Link from "next/link";
import { EventsSupportPage } from "@/components/events/EventsSupportPage";
import { Button } from "@/components/ui/Button";
import { communityElectionIntegrityTourContent } from "@/content/events/community-election-integrity-tour";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";
import { getContactMailto } from "@/config/external-campaign";

const { meta, request: R } = communityElectionIntegrityTourContent;

export const metadata: Metadata = pageMeta({
  title: meta.request.title,
  description: meta.request.description,
  path: meta.request.path,
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default function IntegrityTourRequestPage() {
  const mailto = getContactMailto();
  const { inviteKellyCrossLink } = R;

  return (
    <EventsSupportPage eyebrow={R.eyebrow} title={R.title} intro={R.intro}>
      <div className="space-y-10 font-body text-kelly-text/88">
        <div className="space-y-5">
          {R.leadParagraphs.map((p) => (
            <p key={p.slice(0, 48)} className="text-base leading-relaxed md:text-[1.05rem]">
              {p}
            </p>
          ))}
          <p className="text-sm text-kelly-text/75">
            Looking for a general visit or backyard conversation? Start with{" "}
            <Link href={inviteKellyCrossLink.href} className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
              {inviteKellyCrossLink.label}
            </Link>
            .
          </p>
        </div>

        <section aria-labelledby="tour-invite-who">
          <h2 id="tour-invite-who" className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">
            {R.whoInvites.heading}
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-base leading-relaxed">
            {R.whoInvites.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tour-invite-need">
          <h2 id="tour-invite-need" className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">
            {R.whatWeNeed.heading}
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-base leading-relaxed">
            {R.whatWeNeed.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <div className="rounded-card border border-dashed border-kelly-text/25 bg-kelly-wash/50 p-8 text-center md:p-10">
          <p className="font-heading text-lg font-bold text-kelly-ink">{R.formTitle}</p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-kelly-slate md:text-base">{R.formBody}</p>
          <p className="mx-auto mt-3 max-w-lg text-xs text-kelly-text/60">TODO: WorkflowIntake + pending approval calendar.</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button href={mailto} variant="primary" className="min-h-[52px]">
              Email the campaign
            </Button>
            <Button href={inviteKellyCrossLink.href} variant="outline" className="min-h-[48px]">
              Invite Kelly
            </Button>
            <Button href="/events/community-election-integrity-tour" variant="outline" className="min-h-[48px]">
              Back to tour overview
            </Button>
          </div>
        </div>
      </div>
    </EventsSupportPage>
  );
}
