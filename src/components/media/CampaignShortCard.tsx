import Link from "next/link";
import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { CampaignTranscriptDisclosure } from "@/components/media/CampaignTranscriptDisclosure";
import { CampaignTranscriptTools } from "@/components/media/CampaignTranscriptTools";
import { LazyShortYouTubeEmbed } from "@/components/media/LazyShortYouTubeEmbed";
import { isPublicTranscript, youtubePosterUrl } from "@/lib/media/campaign-transcript";
import { cn } from "@/lib/utils";

export type CampaignShortCardProps = {
  media: CampaignMediaRecord;
  showTranscript?: boolean;
  className?: string;
};

/** Vertical 9:16 Campaign Short — click-to-play, capped width on desktop. */
export function CampaignShortCard({ media, showTranscript = true, className }: CampaignShortCardProps) {
  const poster = media.thumbnailUrl ?? youtubePosterUrl(media.youtubeVideoId);
  const tools = isPublicTranscript(media) ? (
    <CampaignTranscriptTools
      youtubeVideoId={media.youtubeVideoId}
      plainText={media.transcript.plainText}
      segments={media.transcript.segments}
    />
  ) : null;

  return (
    <article className={cn("mx-auto w-full max-w-[320px]", className)}>
      <LazyShortYouTubeEmbed videoId={media.youtubeVideoId} title={media.title} posterUrl={poster} />
      <div className="mt-4">
        <p className="font-body text-[11px] font-bold uppercase tracking-[0.18em] text-kelly-navy">Short</p>
        <h2 className="mt-1 font-heading text-xl font-bold text-kelly-ink">{media.title}</h2>
        {media.summary || media.description ? (
          <p className="mt-2 font-body text-sm leading-relaxed text-kelly-slate">
            {media.summary ?? media.description}
          </p>
        ) : null}
        {media.topics.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2" aria-label="Topics">
            {media.topics.map((t) => (
              <li
                key={t}
                className="rounded-full border border-kelly-ink/10 bg-kelly-fog px-2.5 py-0.5 text-xs font-semibold text-kelly-navy"
              >
                {t}
              </li>
            ))}
          </ul>
        ) : null}
        {media.relatedPagePaths.length > 0 ? (
          <ul className="mt-3 space-y-1 font-body text-sm font-semibold text-kelly-navy">
            {media.relatedPagePaths.map((href) => (
              <li key={href}>
                <Link href={href} className="underline-offset-2 hover:underline">
                  {href}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {showTranscript ? <CampaignTranscriptDisclosure media={media} tools={tools} /> : null}
        {!showTranscript && isPublicTranscript(media) ? (
          <p className="mt-3 font-body text-sm font-semibold text-kelly-navy">Transcript available</p>
        ) : null}
      </div>
    </article>
  );
}
