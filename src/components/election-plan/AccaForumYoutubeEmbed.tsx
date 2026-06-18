import { ACCA_2026_SOS_FORUM_EVENT } from "@/lib/intelligence/v4/forumVideoDropPath";

export function AccaForumYoutubeEmbed({ compact }: { compact?: boolean }) {
  const { youtubeVideoId, title, youtubeWatchUrl } = ACCA_2026_SOS_FORUM_EVENT;
  const embedSrc = `https://www.youtube.com/embed/${youtubeVideoId}?rel=0`;

  return (
    <section className={compact ? "mt-4" : "mb-6"}>
      {!compact ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]">YouTube recording</p>
      ) : null}
      <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-lg border border-[var(--ep-border)] bg-black shadow-sm">
        <iframe
          className="h-full w-full"
          src={embedSrc}
          title={`${title} — YouTube`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
        <a href={youtubeWatchUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
          Open on YouTube ↗
        </a>
        {" · "}
        Use local MP4 drop + transcript lab for AI capitalize playbook.
      </p>
    </section>
  );
}
