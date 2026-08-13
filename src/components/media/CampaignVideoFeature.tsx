import Link from "next/link";
import type { CampaignMediaRecord } from "@/content/media/campaign-media-types";
import { CampaignTranscriptDisclosure } from "@/components/media/CampaignTranscriptDisclosure";
import { CampaignTranscriptTools } from "@/components/media/CampaignTranscriptTools";
import { LazyYouTubeEmbed } from "@/components/media/LazyYouTubeEmbed";
import { isPublicTranscript, youtubePosterUrl } from "@/lib/media/campaign-transcript";
import { cn } from "@/lib/utils";

export type CampaignVideoFeatureProps = {
  media: CampaignMediaRecord;
  /** Section eyebrow above the title. */
  eyebrow?: string;
  /** Written introduction — required for homepage featured placement. */
  introduction: string;
  headingId: string;
  className?: string;
  /** Prefer shortTitle in the H2 when present. */
  preferShortTitle?: boolean;
};

function relatedLinkLabel(href: string): string {
  if (href === "/about") return "Meet Kelly";
  if (href === "/priorities") return "See My Plan";
  if (href === "/about/journey") return "See Kelly Across Arkansas";
  if (href === "/get-involved" || href === "/volunteer") return "Get Involved";
  return href;
}

/** One label once — /get-involved + /volunteer both map to Join the Campaign. */
function dedupeRelatedLinks(paths: string[]): Array<{ href: string; label: string }> {
  const seen = new Set<string>();
  const out: Array<{ href: string; label: string }> = [];
  for (const href of paths.slice(0, 6)) {
    const label = relatedLinkLabel(href);
    if (seen.has(label)) continue;
    seen.add(label);
    out.push({ href, label });
    if (out.length >= 3) break;
  }
  return out;
}

/**
 * Featured campaign statement video — privacy-enhanced, click-to-play, not a raw iframe.
 * Use for homepage primary message and Kelly Across Arkansas placements.
 */
export function CampaignVideoFeature({
  media,
  eyebrow,
  introduction,
  headingId,
  className,
  preferShortTitle = false,
}: CampaignVideoFeatureProps) {
  const poster = media.thumbnailUrl ?? youtubePosterUrl(media.youtubeVideoId);
  const title = preferShortTitle && media.shortTitle ? media.shortTitle : media.title;
  const publicTranscript = isPublicTranscript(media);
  const tools = publicTranscript ? (
    <CampaignTranscriptTools
      youtubeVideoId={media.youtubeVideoId}
      plainText={media.transcript.plainText}
      segments={media.transcript.segments}
    />
  ) : null;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-card border border-kelly-ink/10 bg-white shadow-[0_16px_48px_rgba(0,0,102,0.08)]",
        className,
      )}
    >
      <LazyYouTubeEmbed videoId={media.youtubeVideoId} title={media.title} posterUrl={poster} />
      <div className="px-5 py-6 md:px-8 md:py-8">
        {eyebrow ? (
          <p className="font-body text-[11px] font-bold uppercase tracking-[0.22em] text-kelly-gold">{eyebrow}</p>
        ) : null}
        <h2
          id={headingId}
          className={cn("font-heading text-2xl font-bold tracking-tight text-kelly-ink md:text-3xl", eyebrow && "mt-3")}
        >
          {title}
        </h2>
        <p className="mt-4 max-w-3xl font-body text-base leading-relaxed text-kelly-slate md:text-lg">{introduction}</p>
        {media.relatedPagePaths.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-body text-sm font-semibold text-kelly-navy">
            {dedupeRelatedLinks(media.relatedPagePaths).map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="underline decoration-kelly-navy/25 underline-offset-4 transition hover:decoration-kelly-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kelly-navy"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {publicTranscript ? <CampaignTranscriptDisclosure media={media} tools={tools} /> : null}
        {!publicTranscript ? (
          <p className="mt-5 font-body text-sm text-kelly-slate">
            Captions are available on YouTube after you press play.
          </p>
        ) : null}
      </div>
    </article>
  );
}
