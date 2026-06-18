import type { ForumTranscriptLabRecord } from "@/lib/intelligence/v4/forumTranscriptLab";
import { EP_FORUM_TRANSCRIPT_LAB_API } from "@/lib/election-plan/debate-prep-links";
import { formatBytes } from "@/lib/intelligence/v4/largeForumVideoLimits";

type Props = {
  record: ForumTranscriptLabRecord;
  /** API root without trailing slash — defaults to Election Plan route. */
  apiBase?: string;
};

export function AccaForumLocalRecordingPanel({
  record,
  apiBase = EP_FORUM_TRANSCRIPT_LAB_API,
}: Props) {
  const hasLocal = Boolean(record.localVideoRelativePath?.trim());
  const hasOwned = Boolean(record.ownedMediaAssetId);

  if (!hasLocal && !hasOwned) return null;

  const videoSrc = hasLocal
    ? `${apiBase}/video`
    : `/api/owned-campaign-media/${record.ownedMediaAssetId}/file`;

  return (
    <section className="mb-6">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--ep-navy)]">
        Local forum recording
        {record.videoSizeBytes ? ` · ${formatBytes(record.videoSizeBytes)}` : ""}
      </p>
      <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-lg border border-[var(--ep-border)] bg-black shadow-sm">
        <video className="h-full w-full" controls preload="metadata" src={videoSrc}>
          Your browser does not support HTML5 video.
        </video>
      </div>
      {hasLocal ? (
        <p className="mt-2 text-xs text-[var(--ep-navy-muted)]">
          Streamed from drop folder — source file is never deleted during ingest.
        </p>
      ) : null}
    </section>
  );
}
