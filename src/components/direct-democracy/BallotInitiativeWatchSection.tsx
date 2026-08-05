"use client";

import Link from "next/link";
import { SectionHeading } from "@/components/blocks/SectionHeading";
import { ContentContainer } from "@/components/layout/ContentContainer";
import { FullBleedSection } from "@/components/layout/FullBleedSection";
import { LazyYouTubeEmbed } from "@/components/media/LazyYouTubeEmbed";
import { Button } from "@/components/ui/Button";
import {
  ballotInitiativeWatchStandaloneHref,
  ballotInitiativeWatchYoutubeId,
} from "@/config/direct-democracy-links";
import { youtubePosterUrl } from "@/lib/media/campaign-transcript";

const VIDEO_TITLE = "How Arkansas’s ballot initiative process has changed";

/**
 * Lead-in + watch CTA for the Direct Democracy hub.
 * Embed is optional convenience; the canonical independent page lives on Stand Up Arkansas.
 */
export function BallotInitiativeWatchSection() {
  const poster = youtubePosterUrl(ballotInitiativeWatchYoutubeId);

  return (
    <FullBleedSection variant="subtle" id="ballot-initiative-watch" aria-labelledby="ballot-watch-heading">
      <ContentContainer>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 lg:items-start">
          <div className="lg:col-span-5">
            <SectionHeading
              id="ballot-watch-heading"
              eyebrow="Watch this"
              title="How the ballot initiative process has been hollowed out"
              subtitle="Over the last fifteen years, General Assemblies have stacked barriers onto the people’s path to the ballot. See what changed—and why every Arkansan should understand it."
              align="left"
              className="max-w-xl"
            />
            <div className="mt-6 space-y-4 font-body text-base leading-relaxed text-kelly-text/80">
              <p>
                Direct democracy only works when ordinary people can still use it. When thresholds, timelines, and
                technical traps multiply session after session, the right remains on paper while the practical path
                disappears.
              </p>
              <p className="font-semibold text-kelly-navy">
                Please watch this briefing. Share it with neighbors, classrooms, and county parties. Understanding
                how the process disintegrated is the first step toward protecting it.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={ballotInitiativeWatchStandaloneHref} variant="primary">
                Open standalone watch page
              </Button>
              <Button
                href={`https://youtu.be/${ballotInitiativeWatchYoutubeId}`}
                variant="outline"
              >
                Watch on YouTube
              </Button>
            </div>
            <p className="mt-4 font-body text-sm text-kelly-muted">
              The standalone page lives on{" "}
              <Link
                href={ballotInitiativeWatchStandaloneHref}
                className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
              >
                Stand Up Arkansas
              </Link>
              — it does not depend on this campaign site being online.
            </p>
          </div>

          <div className="lg:col-span-7">
            <LazyYouTubeEmbed
              videoId={ballotInitiativeWatchYoutubeId}
              title={VIDEO_TITLE}
              posterUrl={poster}
            />
            <p className="mt-3 font-body text-sm text-kelly-muted">
              Prefer a dedicated page?{" "}
              <Link
                href={ballotInitiativeWatchStandaloneHref}
                className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
              >
                Watch at standuparkansas.com/ballot-initiative-watch
              </Link>
              .
            </p>
          </div>
        </div>
      </ContentContainer>
    </FullBleedSection>
  );
}
