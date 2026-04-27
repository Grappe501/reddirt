import { SectionHeading } from "@/components/blocks/SectionHeading";
import { TALK_BUSINESS_ELECTION_2026 } from "@/config/campaign-partners";
import { resolveTalkBusinessEmbedSrc } from "@/config/talk-business-media";
import { talkBusinessKellyInterviewSummary } from "@/content/press/talk-business-kelly-interview-summary";

export type TalkBusinessKellySectionProps = {
  /** When env embed vars are empty, uses featured / inbound YouTube from the campaign library (Admin). */
  fallbackYoutubeVideoId?: string | null;
};

/**
 * Talk Business & Politics: candidate list link, interview summary, and embed (iframe — env or DB fallback).
 */
export function TalkBusinessKellySection({ fallbackYoutubeVideoId }: TalkBusinessKellySectionProps) {
  const { src, title } = resolveTalkBusinessEmbedSrc({ fallbackYoutubeVideoId });

  return (
    <section
      id="talk-business-kelly"
      className="scroll-mt-24 rounded-card border border-kelly-text/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-8"
      aria-label="Talk Business and Politics"
    >
      <SectionHeading
        align="left"
        eyebrow="Press"
        title="Talk Business &amp; Politics"
        subtitle="Long-form interview on the 2026 race and the work of the Secretary of State’s office."
        className="max-w-2xl"
      />

      <p className="mt-6 max-w-3xl font-body text-base leading-relaxed text-kelly-text/88 md:text-[1.05rem]">
        {talkBusinessKellyInterviewSummary}
      </p>

      <p className="mt-5 max-w-2xl font-body text-sm leading-relaxed text-kelly-text/80">
        <a
          href={TALK_BUSINESS_ELECTION_2026.href}
          className="font-semibold text-kelly-navy underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {TALK_BUSINESS_ELECTION_2026.linkLabel}
        </a>
      </p>

      {src ? (
        <div className="mt-8 max-w-3xl overflow-hidden rounded-card border border-kelly-text/10 bg-kelly-navy shadow-lg">
          <div className="relative aspect-video w-full">
            <iframe
              src={src}
              title={title}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
