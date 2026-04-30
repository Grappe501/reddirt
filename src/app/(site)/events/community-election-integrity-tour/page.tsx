import type { Metadata } from "next";
import Link from "next/link";
import { EventsSupportPage } from "@/components/events/EventsSupportPage";
import { Button } from "@/components/ui/Button";
import { communityElectionIntegrityTourContent } from "@/content/events/community-election-integrity-tour";
import { pageMeta } from "@/lib/seo/metadata";
import { brandMediaFromLegacySite } from "@/config/brand-media";

const { meta, hub: H } = communityElectionIntegrityTourContent;

export const metadata: Metadata = pageMeta({
  title: meta.hub.title,
  description: meta.hub.description,
  path: meta.hub.path,
  imageSrc: brandMediaFromLegacySite.statewideBanner,
});

export default function CommunityElectionIntegrityTourPage() {
  return (
    <EventsSupportPage eyebrow={H.eyebrow} title={H.title} intro={H.subtitle}>
      {/*
        Heavy-lift TODOs: connect verified tour rows from admin/DB; WorkflowIntake for requests; county map colors.
      */}
      <div className="space-y-12 font-body text-kelly-text/88">
        <section aria-labelledby="tour-why">
          <h2 id="tour-why" className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">
            {H.why.heading}
          </h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed md:text-[1.05rem]">
            {H.why.paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </div>
        </section>

        <section aria-labelledby="tour-how">
          <h2 id="tour-how" className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">
            {H.how.heading}
          </h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed md:text-[1.05rem]">
            {H.how.paragraphs.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </div>
        </section>

        <section aria-labelledby="tour-what">
          <h2 id="tour-what" className="font-heading text-xl font-bold text-kelly-ink md:text-2xl">
            {H.what.heading}
          </h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-base leading-relaxed md:text-[1.02rem]">
            {H.what.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {H.ctas.map((c) => (
            <Button key={c.href} href={c.href} variant="primary" className="min-h-[48px] w-full sm:w-auto sm:min-w-[12rem]">
              {c.label}
            </Button>
          ))}
        </div>

        <p className="rounded-lg border border-kelly-text/10 bg-kelly-wash/50 px-4 py-3 text-sm leading-relaxed text-kelly-text/75">
          Related: the structured{" "}
          <Link href="/listening-sessions" className="font-semibold text-kelly-navy underline-offset-2 hover:underline">
            Election &amp; ballot access listening sessions
          </Link>{" "}
          series — a cousin to this tour, with its own format and goals. Both stay grounded in nonpartisan process
          education, not fear.
        </p>
      </div>
    </EventsSupportPage>
  );
}
