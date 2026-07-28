import Link from "next/link";
import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { CampaignTranscriptDisclosure } from "@/components/media/CampaignTranscriptDisclosure";
import { CampaignTranscriptTools } from "@/components/media/CampaignTranscriptTools";
import { LazyYouTubeEmbed } from "@/components/media/LazyYouTubeEmbed";
import { isPublicTranscript, youtubePosterUrl } from "@/lib/media/campaign-transcript";
import { cn } from "@/lib/utils";

export type CampaignVideoCardProps = {
  media: CampaignMediaRecord;
  showTranscript?: boolean;
  className?: string;
};

/** Landscape / long-form campaign video card — privacy-enhanced, click-to-play. */
export function CampaignVideoCard({ media, showTranscript = true, className }: CampaignVideoCardProps) {
  const poster = media.thumbnailUrl ?? youtubePosterUrl(media.youtubeVideoId);
  const tools = isPublicTranscript(media) ? (
    <CampaignTranscriptTools
      youtubeVideoId={media.youtubeVideoId}
      plainText={media.transcript.plainText}
      segments={media.transcript.segments}
    />
  ) : null;
  return (
    <article className={cn("overflow-hidden rounded-card border border-kelly-ink/10 bg-white shadow-sm", className)}>
      <LazyYouTubeEmbed videoId={media.youtubeVideoId} title={media.title} posterUrl={poster} />
      <div className="px-5 py-5 md:px-6">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-kelly-ink">{media.title}</h2>
        {media.summary || media.description ? (
          <p className="mt-3 font-body text-base leading-relaxed text-kelly-slate">
            {media.summary ?? media.description}
          </p>
        ) : null}
        {media.topics.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Topics">
            {media.topics.map((t) => (
              <li
                key={t}
                className="rounded-full border border-kelly-ink/10 bg-kelly-fog px-3 py-1 font-body text-xs font-semibold uppercase tracking-wide text-kelly-navy"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : null}
        {media.relatedPagePaths.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-body text-sm font-semibold text-kelly-navy">
            {media.relatedPagePaths.map((href) => (
              <li key={href}>
                <Link href={href} className="underline-offset-2 hover:underline">
                  Related: {href}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {showTranscript ? <CampaignTranscriptDisclosure media={media} tools={tools} /> : null}
        {!showTranscript && isPublicTranscript(media) ? (
          <p className="mt-4 font-body text-sm font-semibold text-kelly-navy">Transcript available</p>
        ) : null}
      </div>
    </article>
  );
}
