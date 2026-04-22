import { SectionHeading } from "@/components/blocks/SectionHeading";
import { LazyYouTubeEmbed } from "@/components/media/LazyYouTubeEmbed";
import { TALK_BUSINESS_ELECTION_2026 } from "@/config/campaign-partners";
import { getTalkBusinessKellyInterviewVideoId } from "@/config/talk-business-media";

/**
 * Talk Business & Politics: 2026 candidate list + optional lazy YouTube interview embed (env-driven).
 */
export function TalkBusinessKellySection() {
  const videoId = getTalkBusinessKellyInterviewVideoId();

  return (
    <section
      id="talk-business-kelly"
      className="scroll-mt-24 rounded-card border border-deep-soil/10 bg-[var(--color-surface-elevated)] p-6 shadow-[var(--shadow-soft)] md:p-8"
      aria-label="Talk Business and Politics"
    >
      <SectionHeading
        align="left"
        eyebrow="Press"
        title="Talk Business &amp; Politics"
        subtitle="Kelly is listed on Talk Business’s rolling 2026 candidate list. When a YouTube video id is configured for this site, the long-form interview plays below—load-on-click, same as our other video embeds."
        className="max-w-2xl"
      />
      <p className="mt-4 max-w-2xl font-body text-sm leading-relaxed text-deep-soil/85">
        <a
          href={TALK_BUSINESS_ELECTION_2026.href}
          className="font-semibold text-red-dirt underline-offset-2 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {TALK_BUSINESS_ELECTION_2026.linkLabel}
        </a>{" "}
        (new tab) — includes constitutional offices, legislature, and Congress; verify filings with the{" "}
        <strong className="font-semibold text-deep-soil/90">Arkansas Secretary of State</strong> for the official record.
      </p>
      {videoId ? (
        <div className="mt-8 max-w-3xl overflow-hidden rounded-card border border-deep-soil/10 bg-civic-midnight shadow-lg">
          <LazyYouTubeEmbed
            videoId={videoId}
            title="Kelly Grappe — Talk Business &amp; Politics"
            posterUrl={null}
          />
        </div>
      ) : (
        <p className="mt-6 rounded-lg border border-dashed border-deep-soil/20 bg-cream-canvas/50 px-4 py-3 font-body text-sm text-deep-soil/70">
          The on-site YouTube interview will show here after your deploy sets the video id (see{" "}
          <code className="rounded bg-deep-soil/10 px-1.5 font-mono text-xs">.env.example</code>). Until then, open the
          list link above and watch on YouTube.
        </p>
      )}
    </section>
  );
}
